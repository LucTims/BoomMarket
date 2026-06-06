import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Search, Filter, X } from 'lucide-react';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSegmentModal, setShowSegmentModal] = useState(false);

  const fetchClients = async () => {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .gte('date_premier_achat', fourteenDaysAgo.toISOString()) // 14 derniers jours uniquement
      .order('date_premier_achat', { ascending: false })
      .limit(100); // Pour éviter de surcharger l'interface au début

    if (error) {
      console.error('Erreur fetch clients:', error);
    } else {
      setClients(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClients();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const filteredClients = clients.filter(c => 
    (c.prenom && c.prenom.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.nom && c.nom.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.telephone && c.telephone.includes(searchTerm))
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className="text-gradient" style={{ fontSize: '2rem' }}>Liste des clients</h1>
        <button className="btn btn-primary" onClick={() => setShowSegmentModal(true)}>Créer un segment</button>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ flexGrow: 1, display: 'flex', gap: '0.5rem', background: 'var(--bg-color)', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--sidebar-border)' }}>
          <Search size={20} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Rechercher par nom ou téléphone..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none', width: '100%', fontSize: '0.9rem' }} 
          />
        </div>
        <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} /> Filtres avancés
        </button>
      </div>

      {/* Data Table */}
      <div className="glass-panel data-table-container">
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Chargement des clients depuis Supabase...
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}><input type="checkbox" /></th>
                <th>Nom Complet</th>
                <th>Contact & Localisation</th>
                <th>Produit Acheté</th>
                <th>Date Premier Achat</th>
                <th>Dernier Contact</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.length > 0 ? filteredClients.map(client => (
                <tr key={client.id}>
                  <td><input type="checkbox" /></td>
                  <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{client.prenom} {client.nom}</td>
                  <td>
                    <div style={{ fontWeight: 500, color: 'var(--text-main)' }}>{client.telephone || 'Non renseigné'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{client.email}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 500, marginTop: '0.1rem' }}>📍 {client.pays || 'Non spécifié'}</div>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 500 }}>
                    {client.produit_principal || '-'}
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {client.date_premier_achat ? new Date(client.date_premier_achat).toLocaleDateString() : '-'}
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {client.date_dernier_contact ? new Date(client.date_dernier_contact).toLocaleDateString() : 'Jamais'}
                  </td>
                  <td>
                    <span className={`badge badge-${client.statut === 'inactif' ? 'inactive' : 'recent'}`}>
                      {(client.statut || 'inactif').toUpperCase()}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    Aucun client trouvé dans Supabase.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Segment Modal */}
      {showSegmentModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
          <div className="glass-panel" style={{ width: '420px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--sidebar-border)', paddingBottom: '0.75rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)' }}>Nouveau Segment Cible</h2>
              <button onClick={() => setShowSegmentModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontWeight: 500, fontSize: '0.875rem' }}>
                Nom du segment
              </label>
              <input 
                type="text" 
                className="form-input"
                placeholder="Ex: Acheteurs Côte d'Ivoire - Inactifs" 
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontWeight: 500, fontSize: '0.875rem' }}>
                Critère (Filtre dynamique)
              </label>
              <select className="form-input">
                <option>Acheté le produit: Guide Bourse BRVM</option>
                <option>Acheté le produit: Liste SGI de la BRVM</option>
                <option>Inactif depuis plus de 60 jours</option>
                <option>Habite en Côte d'Ivoire</option>
                <option>Habite au Cameroun</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <button className="btn btn-outline" onClick={() => setShowSegmentModal(false)}>Annuler</button>
              <button className="btn btn-primary" onClick={() => setShowSegmentModal(false)}>Sauvegarder</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
