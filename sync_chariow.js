import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dynfkwpbgnofzxjckrcs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5bmZrd3BiZ25vZnp4amNrcmNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2MDIxNTEsImV4cCI6MjA5NjE3ODE1MX0.oPXrPahSzszJkqDuURNIjIX10eo3g-Qth905CvZyaiw';
const supabase = createClient(supabaseUrl, supabaseKey);

const CHARIOW_TOKEN = 'sk_a7d5d2eb_bbafc296a0acab8150ad6c2e723d8441';

async function syncCustomers() {
    let url = 'https://api.chariow.com/v1/customers';
    let totalImported = 0;
    let page = 1;

    console.log("Démarrage de la synchronisation Chariow -> Supabase...");

    while (url) {
        console.log(`Récupération de la page ${page}...`);
        const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${CHARIOW_TOKEN}`, 'Accept': 'application/json' }
        });
        
        if (!res.ok) {
            console.error("Erreur de récupération Chariow API:", await res.text());
            break;
        }

        const data = await res.json();
        const customers = data.data;

        if (customers && customers.length > 0) {
            // Transformation des données
            const rows = customers.map(c => {
                // Déterminer un statut fictif basé sur la date si on n'a pas les achats détaillés
                // Dans un flux réel, on calculerait ça avec les commandes (Sales)
                return {
                    chariow_id: c.id,
                    prenom: c.first_name || '',
                    nom: c.last_name || '',
                    email: c.email || '',
                    telephone: c.phone ? (c.phone.number || '') : '',
                    date_premier_achat: c.created_at,
                    date_dernier_achat: c.updated_at,
                    statut: 'inactif' // Par défaut on va les mettre inactif
                };
            });

            const { error } = await supabase
                .from('clients')
                .upsert(rows, { onConflict: 'chariow_id' });

            if (error) {
                console.error("Erreur d'insertion Supabase:", error);
            } else {
                totalImported += rows.length;
                console.log(`Importé ${rows.length} clients (Total: ${totalImported})`);
            }
        }

        url = data.pagination?.next_page_url || null;
        page++;
        
        // Anti-rate limit basique (Optionnel)
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log("Synchronisation terminée ! Clients importés :", totalImported);
}

syncCustomers();
