import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://dynfkwpbgnofzxjckrcs.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5bmZrd3BiZ25vZnp4amNrcmNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2MDIxNTEsImV4cCI6MjA5NjE3ODE1MX0.oPXrPahSzszJkqDuURNIjIX10eo3g-Qth905CvZyaiw');

const d = new Date();
// Le "jour 15" correspond à il y a 14 jours pleins (car aujourd'hui = 0)
d.setDate(d.getDate() - 14);

async function run() {
  const { data, error } = await supabase.from('clients').upsert({
    chariow_id: 'test_swiftsmart',
    prenom: 'Swift',
    nom: 'Smart',
    email: 'swiftsmart263@gmail.com',
    telephone: '+237600000000',
    pays: 'Cameroun',
    produit_principal: 'Test Configuration',
    date_premier_achat: d.toISOString(),
    statut: 'actif'
  }, { onConflict: 'chariow_id' });

  if (error) console.error("Erreur:", error);
  else console.log("Succès ! Client inséré à la date du : " + d.toLocaleDateString());
}
run();
