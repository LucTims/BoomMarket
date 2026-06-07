import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { sendBrevoEmail } from '../services/api';
import { Send, Search, User, Mail, AlertCircle, CheckCircle } from 'lucide-react';

export default function DirectMessage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Form state
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  
  // Status state
  const [sendingStatus, setSendingStatus] = useState('idle'); // idle, sending, success, error
  const [statusMessage, setStatusMessage] = useState('');

  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  // Debounced search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.length >= 2) {
        setIsSearching(true);
        try {
          const { data, error } = await supabase
            .from('clients')
            .select('*')
            .or(`nom.ilike.%${searchTerm}%,prenom.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
            .limit(10);
            
          if (!error && data) {
            setSearchResults(data);
            setShowDropdown(true);
          }
        } catch (err) {
          console.error("Search error:", err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const selectClient = (client) => {
    setRecipientEmail(client.email);
    setRecipientName(`${client.prenom || ''} ${client.nom || ''}`.trim());
    setSearchTerm('');
    setShowDropdown(false);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!recipientEmail || !subject || !message) {
      setSendingStatus('error');
      setStatusMessage('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setSendingStatus('sending');
    setStatusMessage('');

    try {
      // Create a mock client object for the API function
      const targetClient = {
        email: recipientEmail,
        prenom: recipientName.split(' ')[0] || '',
        nom: recipientName.split(' ').slice(1).join(' ') || ''
      };

      const result = await sendBrevoEmail(targetClient, subject, message);

      if (result.success) {
        setSendingStatus('success');
        setStatusMessage(result.simulated ? result.message : 'Message envoyé avec succès !');
        // Clear form after 2 seconds
        setTimeout(() => {
          setRecipientEmail('');
          setRecipientName('');
          setSubject('');
          setMessage('');
          setSendingStatus('idle');
        }, 3000);
      } else {
        throw new Error(result.error || "Erreur d'envoi");
      }
    } catch (error) {
      console.error(error);
      setSendingStatus('error');
      setStatusMessage(error.message || "Une erreur est survenue lors de l'envoi.");
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Message direct</h1>
          <p className="page-subtitle">Envoyez un e-mail personnalisé à un contact spécifique.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', alignItems: 'start' }}>
        
        {/* Main Editor */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <form onSubmit={handleSend}>
            
            {/* Search or Enter Email */}
            <div className="form-group" style={{ position: 'relative' }} ref={dropdownRef}>
              <label className="form-label">
                <Search size={16} /> Rechercher un client existant
              </label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Tapez un nom, un prénom ou un e-mail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              
              {showDropdown && searchResults.length > 0 && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
                  background: 'white', border: '1px solid var(--sidebar-border)',
                  borderRadius: '0.5rem', marginTop: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  maxHeight: '250px', overflowY: 'auto'
                }}>
                  {searchResults.map(client => (
                    <div 
                      key={client.id}
                      onClick={() => selectClient(client)}
                      style={{ 
                        padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: '1px solid var(--sidebar-border)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--background-alt)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <div>
                        <div style={{ fontWeight: 500, color: 'var(--text-main)' }}>{client.prenom} {client.nom}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{client.email}</div>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Étape {client.step_email || client.sequence_step || 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">
                  <Mail size={16} /> Adresse e-mail destinataire *
                </label>
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder="contact@exemple.com"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">
                  <User size={16} /> Nom du destinataire (optionnel)
                </label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Jean Dupont"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <label className="form-label">Objet du message *</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Ex: Suite à votre commande du..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Corps du message *</label>
              <textarea 
                className="form-input" 
                style={{ minHeight: '250px', resize: 'vertical' }}
                placeholder="Rédigez votre message personnalisé ici..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Note : Votre signature ("L'équipe BoomBooks...") sera ajoutée automatiquement à la fin.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
              <button 
                type="submit" 
                className="btn-primary" 
                disabled={sendingStatus === 'sending'}
                style={{ padding: '0.75rem 2rem' }}
              >
                {sendingStatus === 'sending' ? (
                  <>Envoi en cours...</>
                ) : (
                  <><Send size={18} /> Envoyer le message</>
                )}
              </button>
              
              {sendingStatus === 'success' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)' }}>
                  <CheckCircle size={18} />
                  <span>{statusMessage}</span>
                </div>
              )}
              
              {sendingStatus === 'error' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)' }}>
                  <AlertCircle size={18} />
                  <span>{statusMessage}</span>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Sidebar Help/Preview */}
        <div className="glass-panel" style={{ padding: '1.5rem', position: 'sticky', top: '2rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} color="var(--primary)" /> Astuces
          </h3>
          <ul style={{ paddingLeft: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li>Vous pouvez utiliser la barre de recherche pour trouver un client par son nom ou son adresse e-mail.</li>
            <li>Si le client n'est pas dans la base, entrez simplement son e-mail manuellement.</li>
            <li>Les sauts de ligne seront automatiquement respectés dans l'e-mail final.</li>
            <li>Ce message ne sera pas enregistré dans l'historique global des campagnes.</li>
          </ul>
        </div>

      </div>
    </div>
  );
}
