import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Megaphone, CalendarDays, History, Library, Settings as SettingsIcon, MessageSquare, LogOut } from 'lucide-react';
import { supabase } from './supabaseClient';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import CampaignEditor from './pages/CampaignEditor';
import Calendar from './pages/Calendar';
import HistoryPage from './pages/HistoryPage';
import Templates from './pages/Templates';
import DirectMessage from './pages/DirectMessage';
import Settings from './pages/Settings';
import './App.css';

function App() {
  const [session, setSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingSession(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loadingSession) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>Chargement...</div>;
  }

  if (!session) {
    return <Login onLoginSuccess={setSession} />;
  }

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="text-gradient">BoomMarket</span>
        </div>
        
        <nav className="sidebar-nav">
          <NavLink to="/" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} end>
            <LayoutDashboard size={20} /> Vue d'ensemble
          </NavLink>
          <NavLink to="/clients" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <Users size={20} /> Liste des clients
          </NavLink>
          <NavLink to="/campaigns/new" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <Megaphone size={20} /> Éditeur de campagne
          </NavLink>
          <NavLink to="/calendar" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <CalendarDays size={20} /> Calendrier des envois
          </NavLink>
          <NavLink to="/history" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <History size={20} /> Historique
          </NavLink>
          <NavLink to="/templates" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <Library size={20} /> Templates de messages
          </NavLink>
          <NavLink to="/direct-message" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <MessageSquare size={20} /> Message direct
          </NavLink>
          <NavLink to="/settings" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <SettingsIcon size={20} /> Paramètres
          </NavLink>
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid var(--sidebar-border)', marginTop: 'auto' }}>
          <button 
            onClick={handleLogout}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', 
              padding: '0.75rem 1rem', background: 'transparent', border: 'none', 
              color: 'var(--text-muted)', cursor: 'pointer', borderRadius: '0.5rem',
              transition: 'all 0.2s ease', fontWeight: 500
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <LogOut size={20} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/campaigns/new" element={<CampaignEditor />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/direct-message" element={<DirectMessage />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
