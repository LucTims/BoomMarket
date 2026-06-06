import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Mail, MessageCircle, MessageSquare, Eye, X } from 'lucide-react';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('campaign_history')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique', error);
    }
    setLoading(false);
  };

  const getChannelIcon = (channel) => {
    switch (channel) {
      case 'email': return <Mail size={16} />;
      case 'whatsapp': return <MessageCircle size={16} />;
      case 'sms': return <MessageSquare size={16} />;
      default: return null;
    }
  };

  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('fr-FR', { 
      day: '2-digit', month: 'short', year: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    }).format(d);
  };

  return (
    <div>
      <h1 className="text-gradient" style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Historique des campagnes</h1>
      
      <div className="glass-panel data-table-container">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Chargement de l'historique...</div>
        ) : history.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Aucune campagne n'a encore été envoyée.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date d'envoi</th>
                <th>Nom de la campagne</th>
                <th>Cible (Segment)</th>
                <th>Canal</th>
                <th>Destinataires</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {history.map((campaign) => (
                <tr key={campaign.id}>
                  <td style={{ fontSize: '0.85rem' }}>{formatDate(campaign.created_at)}</td>
                  <td style={{ fontWeight: 600 }}>{campaign.campaign_name}</td>
                  <td>{campaign.segment}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', textTransform: 'capitalize' }}>
                      {getChannelIcon(campaign.channel)}
                      <span>{campaign.channel}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ color: 'var(--success)', fontWeight: 600 }}>{campaign.success_count}</span> / {campaign.target_count}
                  </td>
                  <td>
                    <button 
                      onClick={() => setSelectedCampaign(campaign)}
                      className="btn btn-outline" 
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      <Eye size={14} /> Voir message
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal View Message */}
      {selectedCampaign && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          padding: '1rem'
        }}>
          <div className="glass-panel" style={{
            width: '100%', maxWidth: '600px', backgroundColor: 'var(--bg-light)',
            padding: '2rem', position: 'relative', maxHeight: '90vh', overflowY: 'auto'
          }}>
            <button 
              onClick={() => setSelectedCampaign(null)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-main)' }}
            >
              <X size={24} />
            </button>
            
            <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>{selectedCampaign.campaign_name}</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <div><strong>Canal :</strong> <span style={{textTransform:'capitalize'}}>{selectedCampaign.channel}</span></div>
              <div><strong>Segment :</strong> {selectedCampaign.segment}</div>
              <div><strong>Envoyé le :</strong> {formatDate(selectedCampaign.created_at)}</div>
              <div><strong>Succès :</strong> {selectedCampaign.success_count}/{selectedCampaign.target_count}</div>
            </div>

            {selectedCampaign.channel === 'email' && selectedCampaign.subject && (
              <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--sidebar-border)' }}>
                <strong>Objet :</strong> {selectedCampaign.subject}
              </div>
            )}

            <div style={{ 
              padding: '1.5rem', backgroundColor: 'white', borderRadius: '8px', 
              border: '1px solid var(--sidebar-border)', whiteSpace: 'pre-wrap',
              fontSize: '0.9rem', lineHeight: '1.6', color: '#333'
            }}>
              {selectedCampaign.message_body}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
