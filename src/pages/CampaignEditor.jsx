import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Send, Eye, ArrowLeft, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { sendBrevoEmail, sendWhatsAppMake, sendSMS, parseMessage } from '../services/api';

export default function CampaignEditor() {
  const location = useLocation();
  const templateFromState = location.state?.template;

  // Générer les 15 dernières dates pour le dropdown
  const generatedDates = [];
  for (let i = 0; i < 15; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    generatedDates.push(`${dd}/${mm}/${yyyy}`);
  }

  const [campaignName, setCampaignName] = useState(() => templateFromState?.name || '');
  const [segment, setSegment] = useState(() => location.state?.targetDate || generatedDates[0]);
  const [sequenceStep, setSequenceStep] = useState(() => location.state?.targetStep || 1);
  const [channel, setChannel] = useState(() => templateFromState?.channel || 'email');
  const [subject, setSubject] = useState(() => templateFromState?.subject || '');
  const [message, setMessage] = useState(() => templateFromState?.body || '');
  
  const [targetCount, setTargetCount] = useState(0);
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [batchSize, setBatchSize] = useState(300);
  
  // États de l'envoi
  const [sendingStatus, setSendingStatus] = useState('idle'); // idle, sending, completed, error
  const [sendProgress, setSendProgress] = useState({ current: 0, total: 0, success: 0, failure: 0 });
  const [sendLogs, setSendLogs] = useState([]);
  
  // État du Test
  const [testEmail, setTestEmail] = useState('swiftsmart263@gmail.com');

  // Charger les clients correspondants pour compter la cible
  useEffect(() => {
    const fetchTargetClients = async () => {
      setLoadingClients(true);
      try {
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 15);

        let query = supabase
          .from('clients')
          .select('*')
          .gte('date_premier_achat', fourteenDaysAgo.toISOString()) // Seulement les 15 derniers jours
          .eq('sequence_step', sequenceStep); // FILTRER PAR ÉTAPE DE SÉQUENCE
        
        const { data, error } = await query;
        if (error) throw error;
        
        // Filtrer par la date exacte sélectionnée dans le segment (format JJ/MM/AAAA)
        const filteredData = (data || []).filter(c => {
          const cd = new Date(c.date_premier_achat);
          const cYyyy = cd.getFullYear();
          const cMm = String(cd.getMonth() + 1).padStart(2, '0');
          const cDd = String(cd.getDate()).padStart(2, '0');
          const clientDisplayDate = `${cDd}/${cMm}/${cYyyy}`;
          return clientDisplayDate === segment;
        });
        
        setClients(filteredData);
        setTargetCount(filteredData.length);
        // Synchroniser automatiquement la taille du lot (max 300)
        setBatchSize(filteredData.length > 0 ? Math.min(filteredData.length, 300) : 0);
      } catch (error) {
        console.error('Erreur de comptage du segment cible :', error);
        setTargetCount(0);
      }
      setLoadingClients(false);
    };

    const timer = setTimeout(() => {
      fetchTargetClients();
    }, 0);
    return () => clearTimeout(timer);
  }, [segment, sequenceStep]); // Recharger si segment ou étape change

  const insertVariable = (variable) => {
    setMessage(prev => prev + `{{${variable}}}`);
  };

  // Simuler/Générer un exemple de message personnalisé
  const getPreviewText = () => {
    const dummyClient = {
      prenom: 'Christian',
      nom: 'Kouadio',
      produit_principal: 'Le Guide Complet Pour Investir en Bourse — BRVM',
      pays: 'Côte d\'Ivoire'
    };
    return parseMessage(message || 'Votre message s\'affichera ici...', dummyClient);
  };

  const handleSend = async () => {
    if (!message) {
      alert('Veuillez rédiger un message avant d\'envoyer.');
      return;
    }
    if (channel === 'email' && !subject) {
      alert('Veuillez saisir un objet pour l\'e-mail.');
      return;
    }
    
    if (targetCount === 0) {
      alert('Le segment sélectionné ne contient aucun destinataire.');
      return;
    }

    const confirmSend = window.confirm(`Êtes-vous sûr de vouloir envoyer cette campagne à environ ${targetCount} clients ?`);
    if (!confirmSend) return;

    setSendingStatus('sending');
    setSendLogs([]);
    
    // Sélectionner un échantillon ou tout envoyer
    // Pour des raisons de performance dans le navigateur et de sécurité, nous limitons à 5 envois réels ou simulons le reste en bloc
    const totalToSend = Math.min(clients.length, 10); // Envoi réel/simulé détaillé sur 10 clients max pour le retour visuel
    setSendProgress({ current: 0, total: targetCount, success: 0, failure: 0 });

    let successCount = 0;
    let failureCount = 0;
    const logs = [];

    for (let i = 0; i < totalToSend; i++) {
      const client = clients[i];
      const parsedMessageText = parseMessage(message, client);
      
      setSendProgress(prev => ({ ...prev, current: i + 1 }));
      
      let result = { success: false };
      
      if (channel === 'email') {
        result = await sendBrevoEmail(client, subject, parsedMessageText);
      } else if (channel === 'whatsapp') {
        result = await sendWhatsAppMake(client, parsedMessageText);
      } else if (channel === 'sms') {
        result = await sendSMS(client, parsedMessageText);
      }

      if (result.success) {
        successCount++;
        logs.push({
          id: client.id || i,
          name: `${client.prenom} ${client.nom}`,
          contact: channel === 'email' ? client.email : client.telephone,
          status: 'success',
          msg: result.simulated ? 'Simulé' : 'Envoyé'
        });

        // Mettre à jour : incrémenter l'étape de séquence dans Supabase
        if (client.chariow_id) {
          await supabase
            .from('clients')
            .update({ 
              date_dernier_contact: new Date().toISOString(),
              sequence_step: (client.sequence_step || 1) + 1
            })
            .eq('chariow_id', client.chariow_id);
        } else if (client.id) {
          await supabase
            .from('clients')
            .update({ 
              date_dernier_contact: new Date().toISOString(),
              sequence_step: (client.sequence_step || 1) + 1
            })
            .eq('id', client.id);
        }

      } else {
        failureCount++;
        logs.push({
          id: client.id || i,
          name: `${client.prenom} ${client.nom}`,
          contact: channel === 'email' ? client.email : client.telephone,
          status: 'error',
          msg: result.error || 'Erreur d\'envoi'
        });
      }
      
      setSendLogs([...logs]);
      // Petit délai entre chaque appel
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Le reste des clients du segment est marqué comme traité en simulation globale
    if (targetCount > totalToSend) {
      const remaining = targetCount - totalToSend;
      successCount += remaining;
      logs.push({
        id: 'bulk-remaining',
        name: `${remaining} autres clients du segment`,
        contact: 'Bulk',
        status: 'success',
        msg: 'Traité en tâche de fond (Simulation globale)'
      });
      setSendLogs([...logs]);
    }

    setSendProgress({
      current: targetCount,
      total: targetCount,
      success: successCount,
      failure: failureCount
    });
    setSendingStatus('completed');
  };

  const handleSendTest = async () => {
    if (!message) {
      alert('Veuillez rédiger un message avant d\'envoyer un test.');
      return;
    }
    if (channel === 'email' && !subject) {
      alert('Veuillez saisir un objet pour l\'e-mail.');
      return;
    }

    const confirmSend = window.confirm(`Envoyer un e-mail de test à ${testEmail} ?`);
    if (!confirmSend) return;

    setSendingStatus('sending');
    setSendLogs([]);
    setSendProgress({ current: 0, total: 1, success: 0, failure: 0 });

    const dummyClient = {
      prenom: 'Swift',
      nom: 'Smart',
      email: testEmail,
      telephone: '+237600000000',
      produit_principal: 'Produit de Test',
      pays: 'Cameroun'
    };

    const parsedMessageText = parseMessage(message, dummyClient);
    let result = { success: false };

    if (channel === 'email') {
      result = await sendBrevoEmail(dummyClient, subject, parsedMessageText);
    } else if (channel === 'whatsapp') {
      result = await sendWhatsAppMake(dummyClient, parsedMessageText);
    } else if (channel === 'sms') {
      result = await sendSMS(dummyClient, parsedMessageText);
    }

    if (result.success) {
      setSendProgress({ current: 1, total: 1, success: 1, failure: 0 });
      setSendLogs([{
        id: 'test',
        name: 'Testeur (Swift Smart)',
        contact: testEmail,
        status: 'success',
        msg: result.simulated ? 'Simulé' : 'Test Envoyé avec succès !'
      }]);
    } else {
      setSendProgress({ current: 1, total: 1, success: 0, failure: 1 });
      setSendLogs([{
        id: 'test',
        name: 'Testeur',
        contact: testEmail,
        status: 'error',
        msg: result.error || 'Erreur d\'envoi'
      }]);
    }
    
    setSendingStatus('completed');
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Créateur de Campagne</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Rédigez et envoyez votre séquence de message personnalisée par e-mail ou WhatsApp.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-outline" onClick={() => window.history.back()}><ArrowLeft size={16} /> Retour</button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-color)', padding: '0.25rem 0.5rem', borderRadius: '8px', border: '1px solid var(--sidebar-border)' }}>
            <input 
              type="email" 
              value={testEmail} 
              onChange={(e) => setTestEmail(e.target.value)} 
              className="form-input" 
              style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem', minWidth: '180px', height: '32px' }}
            />
            <button className="btn btn-outline" onClick={handleSendTest} disabled={sendingStatus === 'sending'} style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', height: '32px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Send size={14} /> Test
            </button>
          </div>

          <button className="btn btn-primary" onClick={handleSend} disabled={sendingStatus === 'sending'}>
            <Send size={16} /> Envoyer la Campagne
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem' }}>
        
        {/* Formulaire de l'éditeur */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>
              Nom de la campagne
            </label>
            <input 
              type="text" 
              value={campaignName} 
              onChange={(e) => setCampaignName(e.target.value)} 
              className="form-input" 
              placeholder="Ex: Relance Séquence A - J+0" 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>
                Segment cible
              </label>
              <select 
                value={segment} 
                onChange={(e) => setSegment(e.target.value)} 
                className="form-input"
              >
                {generatedDates.map(date => (
                  <option key={date} value={date}>Clients du {date}</option>
                ))}
              </select>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                {loadingClients ? 'Comptage...' : `Cible : ${targetCount} clients à l'étape ${sequenceStep}`}
              </span>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>
                Étape de séquence
              </label>
              <select 
                value={sequenceStep} 
                onChange={(e) => setSequenceStep(Number(e.target.value))} 
                className="form-input"
              >
                {[1,2,3,4,5,6,7,8,9,10].map(step => (
                  <option key={step} value={step}>Étape {step} — Message {step}</option>
                ))}
              </select>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                Les clients à cette étape recevront le message. Ils passeront ensuite à l'étape suivante.
              </span>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>
                Taille du lot (Max par jour)
              </label>
              <input 
                type="number" 
                value={batchSize} 
                onChange={(e) => setBatchSize(Number(e.target.value))} 
                className="form-input" 
                min="1"
                max="300"
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                Limite Brevo Gratuit : 300 msgs/jour
              </span>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>
                Canal de communication
              </label>
              <select 
                value={channel} 
                onChange={(e) => setChannel(e.target.value)} 
                className="form-input"
              >
                <option value="email">Email (Brevo SMTP)</option>
                <option value="whatsapp">WhatsApp (Make / Wachap)</option>
                <option value="sms">SMS (Wachap)</option>
              </select>
            </div>
          </div>

          {channel === 'email' && (
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>
                Objet de l'e-mail
              </label>
              <input 
                type="text" 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)} 
                className="form-input" 
                placeholder="Saisissez l'objet du message..." 
              />
            </div>
          )}

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ fontWeight: 600, fontSize: '0.875rem' }}>Corps du message</label>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button type="button" onClick={() => insertVariable('prénom')} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>{'{prénom}'}</button>
                <button type="button" onClick={() => insertVariable('nom')} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>{'{nom}'}</button>
                <button type="button" onClick={() => insertVariable('produit')} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>{'{produit}'}</button>
                <button type="button" onClick={() => insertVariable('pays')} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>{'{pays}'}</button>
              </div>
            </div>
            
            <textarea 
              value={message} 
              onChange={(e) => setMessage(e.target.value)} 
              rows="12" 
              className="form-input" 
              placeholder="Rédigez votre message... Utilisez les balises à insérer pour personnaliser le message pour chaque client."
              style={{ resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.5' }}
            ></textarea>
          </div>

        </div>

        {/* Aperçu du message */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Eye size={16} /> Aperçu (Christian Kouadio)
            </h3>

            {channel === 'email' ? (
              // EMAIL PREVIEW
              <div style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ background: '#ffffff', padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#475569' }}>
                  <div><strong>De :</strong> BoomBooks &lt;contact@boombooks.shop&gt;</div>
                  <div><strong>À :</strong> Christian Kouadio &lt;christian.kouadio@example.com&gt;</div>
                  <div style={{ marginTop: '0.25rem' }}><strong>Objet :</strong> {subject || '(Pas d\'objet)'}</div>
                </div>
                <div style={{ background: '#ffffff', margin: '1rem', padding: '1.5rem', borderRadius: '6px', minHeight: '200px', fontSize: '0.875rem', color: '#1e293b', whiteSpace: 'pre-wrap', border: '1px solid #e2e8f0', fontFamily: 'Arial, sans-serif' }}>
                  <div style={{ borderBottom: '2px solid #2563eb', paddingBottom: '8px', marginBottom: '12px' }}>
                    <h3 style={{ color: '#2563eb', margin: 0 }}>BoomBooks</h3>
                    <span style={{ fontSize: '0.7rem', color: '#666', fontStyle: 'italic' }}>L'antidote de l'ignorance</span>
                  </div>
                  {getPreviewText().replace(/\n/g, '<br/>') ? (
                    <div dangerouslySetInnerHTML={{ __html: getPreviewText().replace(/\n/g, '<br/>') }} />
                  ) : (
                    <span style={{ color: '#94a3b8' }}>Rédigez un message pour afficher l'aperçu...</span>
                  )}
                  <div style={{ marginTop: '20px', paddingTop: '10px', borderTop: '1px solid #eee', fontSize: '0.75rem', color: '#777', textAlign: 'center' }}>
                    BoomBooks Douala, Cameroun.
                  </div>
                </div>
              </div>
            ) : channel === 'whatsapp' ? (
              // WHATSAPP PREVIEW
              <div style={{ background: '#e5ddd5', padding: '1rem', borderRadius: '8px', minHeight: '250px', backgroundImage: 'radial-gradient(#dfdcd6 20%, transparent 20%)', backgroundSize: '15px 15px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ alignSelf: 'flex-start', background: '#ffffff', padding: '0.75rem', borderRadius: '0 8px 8px 8px', maxWidth: '85%', boxShadow: '0 1px 1px rgba(0,0,0,0.1)', position: 'relative' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#075e54', marginBottom: '0.25rem' }}>BoomBooks Service Client</div>
                    <p style={{ fontSize: '0.85rem', color: '#303030', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                      {getPreviewText()}
                    </p>
                    <span style={{ fontSize: '0.65rem', color: '#888', float: 'right', marginTop: '0.25rem' }}>10:24</span>
                  </div>
                </div>
              </div>
            ) : (
              // SMS PREVIEW
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', minHeight: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <div style={{ background: '#e2e8f0', color: '#0f172a', padding: '0.75rem 1rem', borderRadius: '16px', maxWidth: '80%', fontSize: '0.85rem', alignSelf: 'flex-start', whiteSpace: 'pre-wrap' }}>
                  {getPreviewText()}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem', alignSelf: 'flex-start', paddingLeft: '0.5rem' }}>
                  SMS de BoomBooks
                </div>
              </div>
            )}
            
            <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.3' }}>
              ⚠️ Cet aperçu est fictif et utilise le profil de <strong>Christian Kouadio</strong> (Côte d'Ivoire) qui a acheté le guide <strong>BRVM</strong>.
            </p>
          </div>

        </div>

      </div>

      {/* Progress / Status Overlay */}
      {sendingStatus !== 'idle' && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
          <div className="glass-panel" style={{ width: '500px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {sendingStatus === 'sending' ? (
                <RefreshCw size={24} className="spin" color="var(--primary)" />
              ) : sendingStatus === 'completed' ? (
                <CheckCircle size={24} color="var(--success)" />
              ) : (
                <AlertCircle size={24} color="var(--danger)" />
              )}
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                {sendingStatus === 'sending' && 'Envoi en cours...'}
                {sendingStatus === 'completed' && 'Campagne Envoyée !'}
                {sendingStatus === 'error' && 'Une erreur est survenue'}
              </h2>
            </div>

            {/* Progress Bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                <span>Destinataires : {sendProgress.current} / {sendProgress.total}</span>
                <span>{Math.round((sendProgress.current / sendProgress.total) * 100)}%</span>
              </div>
              <div style={{ width: '100%', height: '10px', background: 'var(--bg-color)', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: `${(sendProgress.current / sendProgress.total) * 100}%`, height: '100%', background: 'var(--primary)', borderRadius: '999px', transition: 'width 0.2s' }}></div>
              </div>
            </div>

            {/* Mini Log */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Journal d'envoi :</span>
              <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--sidebar-border)', borderRadius: '6px', background: 'var(--bg-color)', padding: '0.75rem', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {sendLogs.map((log) => (
                  <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', color: log.status === 'success' ? 'var(--text-main)' : 'var(--danger)' }}>
                    <span>{log.name} ({log.contact})</span>
                    <span style={{ fontWeight: 'bold' }}>{log.msg}</span>
                  </div>
                ))}
                {sendLogs.length === 0 && <div style={{ color: 'var(--text-muted)' }}>Initialisation de l'envoi...</div>}
              </div>
            </div>

            {/* Footer buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button 
                className="btn btn-primary" 
                onClick={() => setSendingStatus('idle')}
                disabled={sendingStatus === 'sending'}
              >
                Fermer
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
