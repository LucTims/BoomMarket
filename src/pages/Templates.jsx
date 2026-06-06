import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, MessageSquare, Clock, ArrowRight } from 'lucide-react';

export default function Templates() {
  const [activeTab, setActiveTab] = useState('sequence-a');
  const navigate = useNavigate();

  const templates = [
    // SEQUENCE A: Recent clients (< 2 months)
    {
      id: 'seq-a-1',
      sequence: 'sequence-a',
      delay: 'J+0',
      name: 'Réactivation & Valeur Immédiate',
      channel: 'email',
      subject: 'Bienvenue dans l\'aventure BoomBooks 📚 (+ votre guide BRVM)',
      body: `Salut {{prénom}},

Bienvenue chez BoomBooks ! J'espère que tu te portes bien.

As-tu bien reçu ton exemplaire du guide : "{{produit}}" ? 
Ce livre n'est pas un simple PDF à laisser traîner dans tes téléchargements. C'est une feuille de route.

Les investisseurs qui réussissent ne se contentent pas d'acheter des méthodes ; ils les étudient. Prends 15 minutes ce soir pour ouvrir ce guide, lire les 3 premières pages et commencer à poser les bases de ton éducation financière.

Dans 3 jours, je t'enverrai un outil complémentaire qui devrait grandement t'intéresser pour passer de la théorie à la pratique.

Bonne lecture,
L'équipe BoomBooks`
    },
    {
      id: 'seq-a-2',
      sequence: 'sequence-a',
      delay: 'J+3',
      name: 'Recommandation Complémentaire',
      channel: 'email',
      subject: 'La pièce manquante pour vos investissements BRVM 🧩',
      body: `Hello {{prénom}},

Il y a 3 jours, tu as commencé ton apprentissage avec "{{produit}}". C'est un excellent début.

Mais investir en bourse sans connaître la liste des SGI (Sociétés de Gestion et d'Intermédiation) agréées, c'est comme vouloir conduire une voiture sans clé de contact. Les SGI sont vos seuls intermédiaires pour acheter et vendre des actions sur la BRVM.

Nous avons compilé la "Liste Complète des SGI de la BRVM" avec leurs contacts, frais et localisation. 
C'est le complément indispensable de ton guide.

Profite de notre offre combinée client pour acquérir la liste complète dès aujourd'hui sur boombooks.shop.

Fais de la lecture ton avantage compétitif,
L'équipe BoomBooks`
    },
    {
      id: 'seq-a-3',
      sequence: 'sequence-a',
      delay: 'J+7',
      name: 'Présentation Bibliothèque',
      channel: 'email',
      subject: 'Accédez à toute notre bibliothèque (Offre Bâtisseur 🎯)',
      body: `Bonjour {{prénom}},

La lecture régulière est le fil rouge de toutes les personnes qui réussissent en Afrique et ailleurs. C'est l'antidote de l'ignorance.

Au lieu d'acheter nos guides un par un, que dirais-tu d'avoir un accès illimité à TOUTE notre collection de guides financiers, de business et d'investissement ?

Nous venons de lancer la Bibliothèque BoomBooks sur boombooks.shop.
Avec le plan BÂTISSEUR à seulement 2 500 FCFA/mois, tu disposes d'un catalogue complet pour te former au quotidien.

Rejoins le club des lecteurs disciplinés.

À ton succès,
L'équipe BoomBooks`
    },
    {
      id: 'seq-a-4',
      sequence: 'sequence-a',
      delay: 'J+14',
      name: 'Preuve Sociale & Relance',
      channel: 'email',
      subject: 'Ils ont transformé leur éducation financière avec BoomBooks...',
      body: `Salut {{prénom}},

"Grâce au Guide BRVM, j'ai osé passer mon premier ordre d'achat d'actions à Abidjan." — Christian, client de Côte d'Ivoire.
"L'abonnement Bâtisseur est le meilleur investissement que j'ai fait cette année pour ma formation." — Fatou, membre depuis Douala.

La différence entre ceux qui stagnent et ceux qui avancent réside dans ce qu'ils lisent et appliquent.

Notre offre d'accès à la bibliothèque au tarif préférentiel Bâtisseur (2 500 FCFA) est toujours ouverte, mais pour combien de temps encore ?

Ne remets pas ton éducation financière à plus tard.

Amicalement,
L'équipe BoomBooks`
    },

    // SEQUENCE B: Ancient clients (> 2 months)
    {
      id: 'seq-b-1',
      sequence: 'sequence-b',
      delay: 'J+0',
      name: 'Réintroduction & Cadeau',
      channel: 'email',
      subject: 'Des nouvelles de BoomBooks (et un cadeau pour vous 🎁)',
      body: `Hello {{prénom}},

Cela fait un moment que nous ne nous sommes pas écrit. 

Il y a quelques mois, tu nous as fait confiance en achetant "{{produit}}". Depuis, nous avons travaillé dur pour améliorer nos services.

Pour te remercier de ton soutien, nous t'avons préparé un mini-guide de lecture financière exclusif, téléchargeable gratuitement. Pas de vente, juste de la valeur pure pour t'aider à reprendre de bonnes habitudes de lecture.

[Lien vers le mini-guide gratuit]

En espérant que cela t'aidera sur le chemin de tes projets.

Bonne lecture,
L'équipe BoomBooks`
    },
    {
      id: 'seq-b-2',
      sequence: 'sequence-b',
      delay: 'J+4',
      name: 'Enseignement Approfondi (No-Sell)',
      channel: 'email',
      subject: 'Pourquoi 95% des gens n\'atteignent jamais la liberté financière ?',
      body: `Salut {{prénom}},

Aujourd'hui, pas de produit à vendre. Juste un partage d'expérience.

En analysant notre communauté en Afrique francophone, nous avons remarqué que l'obstacle principal à l'indépendance financière n'est pas le manque d'argent, mais le manque de discipline de lecture et d'auto-formation.

Les plus grands investisseurs lisent au moins 30 minutes par jour. Pourquoi ? Parce que le savoir s'accumule comme des intérêts composés.

Réfléchis-y : quelle a été ta dernière lecture constructive cette semaine ?

À très vite pour de nouveaux conseils,
L'équipe BoomBooks`
    },
    {
      id: 'seq-b-3',
      sequence: 'sequence-b',
      delay: 'J+8',
      name: 'Évolution de la marque',
      channel: 'email',
      subject: 'BoomBooks a bien grandi depuis votre achat...',
      body: `Bonjour {{prénom}},

Depuis ton achat de "{{produit}}", BoomBooks a évolué. Nous ne vendons plus seulement des guides individuels.

Nous sommes devenus un véritable centre d'apprentissage avec la Bibliothèque numérique BoomBooks. Notre but est de rendre l'éducation financière accessible à tous, de Douala à Abidjan.

Nous avons réorganisé nos plans sur boombooks.shop pour te proposer une bibliothèque complète d'e-books et d'analyses de marchés en temps réel.

Découvre ce que BoomBooks est devenu.

À bientôt,
L'équipe BoomBooks`
    },
    {
      id: 'seq-b-4',
      sequence: 'sequence-b',
      delay: 'J+12',
      name: 'Offre de retour exclusive',
      channel: 'email',
      subject: 'Une offre unique pour reprendre votre avenir en main 🌟',
      body: `Hello {{prénom}},

Nous aimerions beaucoup te revoir parmi nos lecteurs actifs.

Pour t'aider à franchir le pas, nous t'offrons un bonus spécial retour : ton premier mois d'abonnement au plan BÂTISSEUR à 1 500 FCFA au lieu de 2 500 FCFA.

C'est notre façon de te réencourager à investir dans ton atout le plus précieux : toi-même.

Profite de l'offre de retour sur boombooks.shop avec le code client : RETOURBOUK.

Excellente continuation,
L'équipe BoomBooks`
    },

    // WHATSAPP (Wachap)
    {
      id: 'wa-1',
      sequence: 'whatsapp',
      delay: 'Relance 1',
      name: 'WhatsApp - Relance Bibliothèque',
      channel: 'whatsapp',
      subject: 'WhatsApp personnel',
      body: `Salut {{prénom}} ! C'est l'équipe BoomBooks. On a vu que tu as acheté "{{produit}}" il y a quelque temps. Pour t'accompagner dans tes lectures et tes investissements, on t'a réservé un accès privilège à notre nouvelle bibliothèque de guides sur boombooks.shop. Ça t'intéresse que je t'envoie les détails ?`
    },
    {
      id: 'wa-2',
      sequence: 'whatsapp',
      delay: 'Urgent',
      name: 'WhatsApp - Offre Limitée',
      channel: 'whatsapp',
      subject: 'WhatsApp personnel',
      body: `Hello {{prénom}} ! Plus que 24 heures pour activer ton abonnement Bâtisseur à la bibliothèque BoomBooks à tarif préférentiel. C'est l'antidote parfait contre l'ignorance financière. C'est ici : boombooks.shop`
    }
  ];

  const filteredTemplates = templates.filter(t => t.sequence === activeTab);

  const handleUseTemplate = (tpl) => {
    // Naviguer vers l'éditeur de campagne en injectant l'état du template
    navigate('/campaigns/new', { state: { template: tpl } });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Templates & Séquences</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Sélectionnez un template rédigé selon le briefing de BoomBooks pour le charger dans l'éditeur.
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="glass-panel" style={{ padding: '0.5rem', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', width: 'fit-content' }}>
        <button 
          onClick={() => setActiveTab('sequence-a')}
          className="btn" 
          style={{ 
            background: activeTab === 'sequence-a' ? 'var(--primary-light)' : 'transparent', 
            color: activeTab === 'sequence-a' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'sequence-a' ? 600 : 500
          }}
        >
          Séquence A (Clients récents &lt; 2 mois)
        </button>
        <button 
          onClick={() => setActiveTab('sequence-b')}
          className="btn" 
          style={{ 
            background: activeTab === 'sequence-b' ? 'var(--primary-light)' : 'transparent', 
            color: activeTab === 'sequence-b' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'sequence-b' ? 600 : 500
          }}
        >
          Séquence B (Clients anciens &gt; 2 mois)
        </button>
        <button 
          onClick={() => setActiveTab('whatsapp')}
          className="btn" 
          style={{ 
            background: activeTab === 'whatsapp' ? 'var(--primary-light)' : 'transparent', 
            color: activeTab === 'whatsapp' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'whatsapp' ? 600 : 500
          }}
        >
          WhatsApp (Wachap)
        </button>
      </div>

      {/* List Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {filteredTemplates.map(tpl => (
          <div key={tpl.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="badge badge-new" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 700 }}>
                <Clock size={12} /> {tpl.delay}
              </span>
              <span className={`badge ${tpl.channel === 'whatsapp' ? 'badge-recent' : 'badge-reactivated'}`} style={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>
                {tpl.channel === 'email' ? <Mail size={10} style={{ display: 'inline', marginRight: '2px', verticalAlign: 'middle' }} /> : <MessageSquare size={10} style={{ display: 'inline', marginRight: '2px', verticalAlign: 'middle' }} />}
                {tpl.channel}
              </span>
            </div>

            <div style={{ flexGrow: 1 }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-main)' }}>{tpl.name}</h3>
              {tpl.channel === 'email' && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', background: 'var(--bg-color)', padding: '0.35rem 0.5rem', borderRadius: '4px' }}>
                  <strong>Objet :</strong> {tpl.subject}
                </div>
              )}
              <div style={{ 
                color: 'var(--text-muted)', 
                fontSize: '0.85rem', 
                background: 'var(--bg-color)', 
                padding: '1rem', 
                borderRadius: '6px', 
                border: '1px solid var(--sidebar-border)',
                whiteSpace: 'pre-wrap',
                maxHeight: '180px',
                overflowY: 'auto',
                fontFamily: tpl.channel === 'whatsapp' ? 'monospace' : 'inherit',
                lineHeight: '1.4'
              }}>
                {tpl.body}
              </div>
            </div>

            <button 
              className="btn btn-outline" 
              onClick={() => handleUseTemplate(tpl)}
              style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem', borderColor: 'var(--primary)', color: 'var(--primary)' }}
            >
              <span>Charger dans l'éditeur</span>
              <ArrowRight size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
