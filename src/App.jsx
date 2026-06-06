import { Routes, Route, NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Megaphone, CalendarDays, History, Library, Settings as SettingsIcon } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import CampaignEditor from './pages/CampaignEditor';
import Calendar from './pages/Calendar';
import HistoryPage from './pages/HistoryPage';
import Templates from './pages/Templates';
import Settings from './pages/Settings';
import './App.css';

function App() {
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
          <NavLink to="/settings" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <SettingsIcon size={20} /> Paramètres
          </NavLink>
        </nav>
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
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
