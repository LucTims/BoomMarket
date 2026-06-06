import { useState } from 'react';
import { Save, RefreshCw, Key, AlertTriangle } from 'lucide-react';
import { syncChariowToSupabase, getApiKey } from '../services/api';

export default function Settings() {
  const [keys, setKeys] = useState(() => ({
    brevo: getApiKey('brevo'),
    wachap: getApiKey('wachap'),
    make: getApiKey('make'),
    chariow: getApiKey('chariow')
  }));
  
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [syncStatus, setSyncStatus] = useState({
    status: 'idle', // idle, fetching, saving, completed, error, cors_fallback
    page: 1,
    count: 0,
    message: '',
    simulated: false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setKeys(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('boombooks_api_keys', JSON.stringify(keys));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSync = async () => {
    setSyncStatus({ status: 'started', page: 1, count: 0, message: '' });
    try {
      await syncChariowToSupabase((progress) => {
        if (progress.status === 'fetching') {
          setSyncStatus({
            status: 'fetching',
            page: progress.page,
            count: progress.count,
            message: `Récupération de la page ${progress.page} depuis Chariow...`
          });
        } else if (progress.status === 'saving') {
          setSyncStatus({
            status: 'saving',
            page: progress.page,
            count: progress.count,
            message: `Enregistrement des données dans Supabase...`
          });
        } else if (progress.status === 'cors_fallback') {
          setSyncStatus({
            status: 'cors_fallback',
            page: 1,
            count: 0,
            message: progress.message
          });
        } else if (progress.status === 'completed') {
          setSyncStatus({
            status: 'completed',
            page: progress.page || 1,
            count: progress.total,
            message: `Synchronisation terminée ! ${progress.total} clients importés.`,
            simulated: progress.simulated || false
          });
        }
      });
    } catch (error) {
      console.error(error);
      setSyncStatus({
        status: 'error',
        page: 1,
        count: 0,
        message: `Erreur : ${error.message || 'Une erreur est survenue lors de la synchronisation.'}`
      });
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className="text-gradient" style={{ fontSize: '2rem' }}>Paramètres d'intégration</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
        
        {/* Formulaire API Keys */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--sidebar-border)', paddingBottom: '0.75rem', marginBottom: '0.5rem' }}>
            <Key size={20} color="var(--primary)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Clés d'API & Connecteurs</h2>
          </div>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>
                Clé API Brevo (SMTP & Contacts)
              </label>
              <input 
                type="text" 
                name="brevo" 
                value={keys.brevo} 
                onChange={handleChange} 
                className="form-input" 
                placeholder="xsmtpsib-..." 
                style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                Utilisée pour envoyer les séquences d'emails transactionnels et synchroniser les contacts.
              </span>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>
                Clé API Wachap (SMS)
              </label>
              <input 
                type="text" 
                name="wachap" 
                value={keys.wachap} 
                onChange={handleChange} 
                className="form-input" 
                placeholder="sk_..." 
                style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                Utilisée pour envoyer les SMS via Wachap.com.
              </span>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>
                Webhook URL Make (WhatsApp)
              </label>
              <input 
                type="text" 
                name="make" 
                value={keys.make} 
                onChange={handleChange} 
                className="form-input" 
                placeholder="https://hook.make.com/..." 
                style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                Déclenche le scénario Make pour les relances WhatsApp.
              </span>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>
                Token d'API Chariow
              </label>
              <input 
                type="text" 
                name="chariow" 
                value={keys.chariow} 
                onChange={handleChange} 
                className="form-input" 
                placeholder="sk_a7d5d2eb..." 
                style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                Pour récupérer vos clients et ventes de boombooks.shop en temps réel.
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              {saveSuccess && (
                <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', fontSize: '0.875rem', fontWeight: 500 }}>
                  Clés sauvegardées avec succès !
                </span>
              )}
              <button type="submit" className="btn btn-primary">
                <Save size={16} /> Sauvegarder les clés
              </button>
            </div>
          </form>
        </div>

        {/* Outils & Synchronisation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--sidebar-border)', paddingBottom: '0.75rem' }}>
              <RefreshCw size={20} color="var(--success)" />
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Synchronisation CRM</h2>
            </div>
            
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Mettez à jour la base de données locale Supabase avec les clients et les commandes de votre boutique Chariow.
            </p>

            <button 
              onClick={handleSync} 
              className="btn btn-primary" 
              style={{ width: '100%', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}
              disabled={syncStatus.status === 'fetching' || syncStatus.status === 'saving' || syncStatus.status === 'started'}
            >
              <RefreshCw size={16} className={syncStatus.status === 'fetching' || syncStatus.status === 'saving' || syncStatus.status === 'started' ? 'spin' : ''} />
              Synchroniser Chariow vers Supabase
            </button>

            {/* Visualisation de l'état de synchronisation */}
            {syncStatus.status !== 'idle' && (
              <div style={{ padding: '1rem', borderRadius: '8px', border: '1px solid var(--sidebar-border)', background: 'var(--bg-color)', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ fontWeight: 600, color: syncStatus.status === 'completed' ? 'var(--success)' : syncStatus.status === 'error' ? 'var(--danger)' : 'var(--primary)' }}>
                  {syncStatus.status === 'completed' && 'Synchronisation Réussie'}
                  {syncStatus.status === 'error' && 'Erreur de Synchronisation'}
                  {syncStatus.status === 'cors_fallback' && 'CORS : Utilisation Simulation'}
                  {(syncStatus.status === 'fetching' || syncStatus.status === 'saving' || syncStatus.status === 'started') && 'Synchronisation en cours...'}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  {syncStatus.message}
                </div>
                {syncStatus.count > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span>Clients synchronisés :</span>
                    <span style={{ fontWeight: 'bold' }}>{syncStatus.count}</span>
                  </div>
                )}
                {syncStatus.simulated && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--warning)', marginTop: '0.25rem', borderTop: '1px dashed var(--sidebar-border)', paddingTop: '0.25rem' }}>
                    ⚠️ Les requêtes vers l'API Chariow ont été bloquées par la sécurité du navigateur (CORS). Des données de test représentatives du briefing ont été générées et insérées dans Supabase.
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '4px solid var(--warning)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={18} color="var(--warning)" />
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>CORS & Exécution Terminal</h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              Si vous préférez exécuter la synchronisation sans restriction de navigateur (CORS), vous pouvez exécuter le script Node officiel dans le dossier du projet :
            </p>
            <div style={{ background: '#0f172a', color: '#38bdf8', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', fontFamily: 'monospace' }}>
              node sync_chariow.js
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
