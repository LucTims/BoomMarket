import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Users, Target, DollarSign, TrendingUp, MapPin, BookOpen, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { syncChariowToSupabase } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    inactive: 0,
    active: 0,
    retention: 0
  });
  const [cohorts, setCohorts] = useState([]);
  const [selectedStep, setSelectedStep] = useState(1);
  const [maxStep, setMaxStep] = useState(1);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchRealStats = async () => {
    try {
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 15);

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .gte('date_premier_achat', fourteenDaysAgo.toISOString());
      
      if (!error && data) {
        const total = data.length;
        const active = total;
        const inactive = 0;
        const retention = 100; // Puisqu'on ne prend que les récents, 100% de la cible 14 jours est "active"
        setStats({ total, inactive, active, retention });

        const generatedCohorts = [];
        for (let i = 0; i < 15; i++) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          // Formatage robuste YYYY-MM-DD basé sur le temps local
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const dd = String(d.getDate()).padStart(2, '0');
          const localIsoDate = `${yyyy}-${mm}-${dd}`;
          const displayDate = `${dd}/${mm}/${yyyy}`; // Format européen pour l'affichage
          
          const dayClients = data.filter(c => {
            const cd = new Date(c.date_premier_achat);
            const cYyyy = cd.getFullYear();
            const cMm = String(cd.getMonth() + 1).padStart(2, '0');
            const cDd = String(cd.getDate()).padStart(2, '0');
            return `${cYyyy}-${cMm}-${cDd}` === localIsoDate;
          });
          const atStep = dayClients.filter(c => (c.sequence_step || 1) === selectedStep).length;
          const pastStep = dayClients.filter(c => (c.sequence_step || 1) > selectedStep).length;
          
          generatedCohorts.push({
            date: displayDate,
            isoDate: localIsoDate,
            total: dayClients.length,
            atStep: atStep,
            pastStep: pastStep
          });
        }
        setCohorts(generatedCohorts);

        // Calculer l'étape maximale existante
        const steps = data.map(c => c.sequence_step || 1);
        const computedMax = steps.length > 0 ? Math.max(...steps) : 1;
        setMaxStep(Math.max(computedMax, 3)); // Au minimum 3 étapes affichées
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques réelles :', error);
    }
  };

  // Synchronisation automatique au chargement
  useEffect(() => {
    const autoSync = async () => {
      setIsSyncing(true);
      try {
        await syncChariowToSupabase();
        // Une fois la synchro terminée, on rafraîchit les stats
        fetchRealStats();
      } catch (error) {
        console.error('Erreur de synchro auto:', error);
      } finally {
        setIsSyncing(false);
      }
    };
    
    autoSync();
  }, []); // Run only once on mount

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRealStats();
    }, 0);
    return () => clearTimeout(timer);
  }, [selectedStep]);

  // Distribution géographique du briefing
  const geographicDistribution = [
    { country: "Côte d'Ivoire", count: 1058, pct: 44, color: '#3b82f6' },
    { country: "Bénin", count: 530, pct: 22, color: '#10b981' },
    { country: "Cameroun", count: 413, pct: 17, color: '#f59e0b' },
    { country: "Burkina Faso", count: 205, pct: 9, color: '#8b5cf6' },
    { country: "Sénégal", count: 80, pct: 3, color: '#ec4899' },
    { country: "RDC", count: 61, pct: 3, color: '#06b6d4' },
    { country: "Mali", count: 27, pct: 1, color: '#64748b' },
    { country: "Autres", count: 17, pct: 1, color: '#94a3b8' }
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.25rem' }}>BoomBooks</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 500, fontStyle: 'italic' }}>
            "L'antidote de l'ignorance." — Pôle Service Client & CRM
          </p>
        </div>
        {isSyncing && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
            <span className="spin" style={{ display: 'inline-block' }}>🔄</span> Synchronisation en cours...
          </div>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        
        {/* Total Clients */}
        <div className="glass-panel stat-card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="stat-title">Base de Clients</span>
            <span style={{ padding: '0.4rem', borderRadius: '8px', background: 'var(--primary-light)', color: 'var(--primary)' }}>
              <Users size={20} />
            </span>
          </div>
          <div className="stat-value">{stats.total.toLocaleString()}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            <span style={{ color: 'var(--success)', fontWeight: 600 }}>{stats.active}</span> actifs / <span style={{ color: 'var(--danger)', fontWeight: 600 }}>{stats.inactive}</span> inactifs
          </div>
        </div>

        {/* Retention Rate */}
        <div className="glass-panel stat-card" style={{ borderLeft: `4px solid ${stats.retention < 5 ? 'var(--danger)' : 'var(--success)'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="stat-title">Taux de Rétention</span>
            <span style={{ padding: '0.4rem', borderRadius: '8px', background: stats.retention < 5 ? 'var(--danger-light)' : 'var(--success-light)', color: stats.retention < 5 ? 'var(--danger)' : 'var(--success)' }}>
              <TrendingUp size={20} />
            </span>
          </div>
          <div className="stat-value">{stats.retention}%</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {stats.retention < 5 ? (
              <span style={{ color: 'var(--danger)', fontWeight: 500 }}>⚠️ Rétention critique</span>
            ) : (
              <span style={{ color: 'var(--success)', fontWeight: 500 }}>Rétention en hausse</span>
            )}
          </div>
        </div>

        {/* 30-Day Conversion Target */}
        <div className="glass-panel stat-card" style={{ borderLeft: '4px solid var(--success)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="stat-title">Cible de Réactivation (30j)</span>
            <span style={{ padding: '0.4rem', borderRadius: '8px', background: 'var(--success-light)', color: 'var(--success)' }}>
              <Target size={20} />
            </span>
          </div>
          <div className="stat-value">233</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Objectif de 10% des clients inactifs
          </div>
        </div>

        {/* Revenue Goal */}
        <div className="glass-panel stat-card" style={{ borderLeft: '4px solid var(--warning)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="stat-title">Chiffre d'Affaires Visé</span>
            <span style={{ padding: '0.4rem', borderRadius: '8px', background: 'var(--warning-light)', color: 'var(--warning)' }}>
              <DollarSign size={20} />
            </span>
          </div>
          <div className="stat-value" style={{ fontSize: '1.5rem', marginTop: '0.5rem' }}>
            152K - 582K FCFA
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Sans frais de publicité
          </div>
        </div>

      </div>

      {/* Main Sections */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
        
        {/* Left Column: Geographical & Products */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Tableau des Cohortes Journalières */}
          <div className="glass-panel" style={{ padding: '1.75rem', gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--sidebar-border)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={20} color="var(--primary)" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Flux des 15 Derniers Jours</h2>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Étape :</span>
                {Array.from({ length: maxStep }, (_, i) => i + 1).map(step => (
                  <button 
                    key={step} 
                    onClick={() => setSelectedStep(step)}
                    className={selectedStep === step ? 'btn btn-primary' : 'btn btn-outline'}
                    style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem', minWidth: '36px' }}
                  >
                    {step}
                  </button>
                ))}
              </div>
            </div>
            
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date d'Achat</th>
                  <th>Total Clients</th>
                  <th>Prêts (Étape {selectedStep})</th>
                  <th>Déjà passés</th>
                  <th>Statut</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {cohorts.map((cohort, index) => {
                  let statusBadge = '';
                  if (cohort.total === 0) {
                    statusBadge = <span className="badge badge-inactive">Vide</span>;
                  } else if (cohort.atStep === 0 && cohort.pastStep > 0) {
                    statusBadge = <span className="badge badge-success">Terminé</span>;
                  } else if (cohort.atStep === 0) {
                    statusBadge = <span className="badge badge-inactive">Aucun</span>;
                  } else {
                    statusBadge = <span className="badge badge-new">À envoyer</span>;
                  }

                  return (
                    <tr key={index}>
                      <td style={{ fontWeight: 600 }}>{cohort.date}</td>
                      <td>{cohort.total}</td>
                      <td style={{ color: cohort.atStep > 0 ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 600 }}>{cohort.atStep}</td>
                      <td style={{ color: 'var(--success)' }}>{cohort.pastStep}</td>
                      <td>{statusBadge}</td>
                      <td>
                        {cohort.atStep > 0 ? (
                          <Link 
                            to="/campaigns/new" 
                            state={{ targetDate: cohort.date, targetIso: cohort.isoDate, targetStep: selectedStep }}
                            className="btn btn-primary" 
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', textDecoration: 'none' }}
                          >
                            Envoyer Msg {selectedStep}
                          </Link>
                        ) : (
                          <button disabled className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', opacity: 0.5 }}>
                            -
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              💡 Sélectionnez l'étape de séquence ci-dessus. Seuls les clients qui sont exactement à cette étape apparaissent comme "Prêts". Après envoi, ils passent automatiquement à l'étape suivante.
            </p>
          </div>
        </div>

        {/* Right Column: Campaigns & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Quick Actions */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.25rem' }}>Actions CRM Rapides</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link to="/campaigns/new" className="btn btn-primary" style={{ textDecoration: 'none', color: 'white', display: 'flex', justifyContent: 'space-between' }}>
                <span>Rédiger une Campagne</span>
                <ArrowRight size={16} />
              </Link>
              <Link to="/templates" className="btn btn-outline" style={{ textDecoration: 'none', display: 'flex', justifyContent: 'space-between' }}>
                <span>Parcourir les Séquences Brevo</span>
                <ArrowRight size={16} />
              </Link>
              <Link to="/settings" className="btn btn-outline" style={{ textDecoration: 'none', display: 'flex', justifyContent: 'space-between' }}>
                <span>Synchroniser Chariow</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Séquences & Stratégies */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Séquences Recommandées</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '0.75rem' }}>
                <h4 style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>Séquence A : Clients récents (&lt; 2 mois)</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  4 e-mails pour réactiver de manière chaleureuse, recommander la liste SGI, et proposer l'abonnement bibliothèque (Bâtisseur).
                </p>
              </div>

              <div style={{ borderLeft: '3px solid var(--warning)', paddingLeft: '0.75rem' }}>
                <h4 style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>Séquence B : Clients anciens (&gt; 2 mois)</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  4 e-mails de réintroduction douce basés sur du contenu gratuit à haute valeur, suivi de l'offre de retour exclusive.
                </p>
              </div>

              <div style={{ borderLeft: '3px solid var(--success)', paddingLeft: '0.75rem' }}>
                <h4 style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>WhatsApp (Wachap)</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Relances courtes et personnelles pour créer un canal direct et de proximité.
                </p>
              </div>
            </div>
          </div>

          {/* Target plan details */}
          <div className="glass-panel" style={{ padding: '1.75rem', background: 'var(--primary-light)', borderColor: 'rgba(37, 99, 235, 0.2)' }}>
            <h4 style={{ color: 'var(--primary)', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🎯 Limite Quotidienne Brevo
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', lineHeight: '1.4' }}>
              Le plan gratuit de Brevo limite vos envois à <strong>300 e-mails par jour</strong>. En envoyant vos campagnes par cohortes journalières, vous respecterez naturellement cette limite tout en couvrant 100% de vos nouveaux acheteurs.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
