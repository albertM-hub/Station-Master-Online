/**
 * Station Master Online V2 - Frontend React
 * Modern UI avec Tailwind CSS, React Hooks, Context API
 * 
 * Structure:
 * - App.jsx: Router principal
 * - context/AuthContext: Auth state global
 * - context/QsoContext: QSO state + API calls
 * - pages/: Dashboard, Logbook, Import, Stats
 * - components/: Réutilisables (QsoForm, Table, etc)
 * - utils/api.js: Appels API
 * 
 * Run: npm install && npm run dev (avec Vite)
 */

// ========== App.jsx ==========
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { QsoProvider } from './context/QsoContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import LogbookPage from './pages/LogbookPage';
import ImportPage from './pages/ImportPage';
import StatsPage from './pages/StatsPage';
import SettingsPage from './pages/SettingsPage';

function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-orange-500 text-xl font-mono">▲ Station Master Online</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <QsoProvider>
      <div className="flex h-screen bg-gray-900 text-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/logbook" element={<LogbookPage />} />
              <Route path="/import" element={<ImportPage />} />
              <Route path="/stats" element={<StatsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </div>
    </QsoProvider>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

// ========== context/AuthContext.jsx ==========
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error('Erreur login');
    const data = await res.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const register = async (email, password, callsign) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, callsign })
    });
    if (!res.ok) throw new Error('Erreur register');
    const data = await res.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated: !!token, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

// ========== context/QsoContext.jsx ==========
import { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

const QsoContext = createContext();

export function QsoProvider({ children }) {
  const [qsos, setQsos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const { token } = useAuth();

  const apiCall = useCallback(async (endpoint, options = {}) => {
    const res = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  }, [token]);

  const fetchQsos = useCallback(async (filterParams = {}) => {
    setLoading(true);
    try {
      const query = new URLSearchParams(filterParams).toString();
      const data = await apiCall(`/api/qsos?${query}`);
      setQsos(data.qsos);
      setFilters(filterParams);
      return data;
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const addQso = useCallback(async (qso) => {
    const data = await apiCall('/api/qsos', {
      method: 'POST',
      body: JSON.stringify(qso)
    });
    setQsos(prev => [data, ...prev]);
    return data;
  }, [apiCall]);

  const updateQso = useCallback(async (id, qso) => {
    const data = await apiCall(`/api/qsos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(qso)
    });
    setQsos(prev => prev.map(q => q.id === id ? data : q));
    return data;
  }, [apiCall]);

  const deleteQso = useCallback(async (id) => {
    await apiCall(`/api/qsos/${id}`, { method: 'DELETE' });
    setQsos(prev => prev.filter(q => q.id !== id));
  }, [apiCall]);

  const importADIF = useCallback(async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/qsos/import', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    if (!res.ok) throw new Error('Import failed');
    const data = await res.json();
    await fetchQsos();
    return data;
  }, [token, fetchQsos]);

  const fetchStats = useCallback(async () => {
    return await apiCall('/api/stats');
  }, [apiCall]);

  return (
    <QsoContext.Provider value={{ qsos, loading, filters, fetchQsos, addQso, updateQso, deleteQso, importADIF, fetchStats }}>
      {children}
    </QsoContext.Provider>
  );
}

export const useQso = () => useContext(QsoContext);

// ========== components/Header.jsx ==========
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

export default function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    const paths = {
      '/': 'Dashboard',
      '/logbook': 'Logbook',
      '/import': 'Importer ADIF',
      '/stats': 'Statistiques',
      '/settings': 'Paramètres'
    };
    return paths[location.pathname] || 'Station Master';
  };

  return (
    <header className="bg-gray-800 border-b border-orange-500 px-6 py-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold">
        <span className="text-white">Station </span>
        <span className="text-orange-500">Master</span>
        <span className="text-white ml-2 font-normal text-sm">{getPageTitle()}</span>
      </h1>
      <div className="flex items-center gap-4">
        <div className="text-sm">
          <p className="text-gray-400">Connecté en tant que</p>
          <p className="font-mono text-orange-500 font-bold">{user?.callsign}</p>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded text-white text-sm font-bold transition"
        >
          Déconnexion
        </button>
      </div>
    </header>
  );
}

// ========== components/Sidebar.jsx ==========
import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const links = [
    { path: '/', icon: '📊', label: 'Dashboard' },
    { path: '/logbook', icon: '📖', label: 'Logbook' },
    { path: '/import', icon: '📥', label: 'Importer' },
    { path: '/stats', icon: '📈', label: 'Statistiques' },
    { path: '/settings', icon: '⚙️', label: 'Paramètres' }
  ];

  return (
    <aside className="w-64 bg-gray-800 border-r border-gray-700 p-6 flex flex-col gap-8">
      <div className="font-bold text-xl">
        <span className="text-orange-500">▲</span> SMO
      </div>
      <nav className="flex flex-col gap-2">
        {links.map(({ path, icon, label }) => (
          <Link
            key={path}
            to={path}
            className={`px-4 py-3 rounded font-mono text-sm transition ${
              isActive(path)
                ? 'bg-orange-500 text-white'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            {icon} {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

// ========== pages/DashboardPage.jsx ==========
import { useEffect, useState } from 'react';
import { useQso } from '../context/QsoContext';
import StatCard from '../components/StatCard';
import QsoChart from '../components/QsoChart';

export default function DashboardPage() {
  const { fetchQsos, fetchStats, qsos } = useQso();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        await fetchQsos();
        const statsData = await fetchStats();
        setStats(statsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="p-6">Chargement...</div>;

  const lastQso = qsos.length > 0 ? new Date(qsos[0].date).toLocaleDateString('fr-FR') : '—';

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="QSOs Total" value={stats?.totalQsos || 0} icon="📊" />
        <StatCard label="Derniers Contact" value={lastQso} icon="📅" />
        <StatCard label="Appels Uniques" value={stats?.uniqueCalls || 0} icon="🔗" />
        <StatCard label="Bandes" value={stats?.bandDistribution?.length || 0} icon="📻" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded border border-gray-700">
          <h3 className="text-lg font-bold mb-4">Distribution par Bande</h3>
          <QsoChart type="bar" data={stats?.bandDistribution} />
        </div>
        <div className="bg-gray-800 p-6 rounded border border-gray-700">
          <h3 className="text-lg font-bold mb-4">QSOs par Mode</h3>
          <QsoChart type="pie" data={stats?.modeDistribution} />
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded border border-gray-700">
        <h3 className="text-lg font-bold mb-4">Derniers QSOs</h3>
        <div className="space-y-2">
          {qsos.slice(0, 5).map(qso => (
            <div key={qso.id} className="flex justify-between text-sm font-mono border-b border-gray-700 pb-2">
              <span className="text-orange-500">{qso.call}</span>
              <span>{qso.date} - {qso.band} {qso.mode}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ========== pages/LogbookPage.jsx ==========
import { useEffect, useState } from 'react';
import { useQso } from '../context/QsoContext';
import QsoTable from '../components/QsoTable';
import QsoFormModal from '../components/QsoFormModal';

export default function LogbookPage() {
  const { qsos, loading, fetchQsos, addQso, updateQso, deleteQso } = useQso();
  const [showForm, setShowForm] = useState(false);
  const [editingQso, setEditingQso] = useState(null);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    fetchQsos(filters);
  }, [filters]);

  const handleEdit = (qso) => {
    setEditingQso(qso);
    setShowForm(true);
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingQso) {
        await updateQso(editingQso.id, formData);
      } else {
        await addQso(formData);
      }
      setShowForm(false);
      setEditingQso(null);
    } catch (err) {
      alert('Erreur: ' + err.message);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex gap-4">
        <input
          type="date"
          onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white"
        />
        <select
          onChange={(e) => setFilters(prev => ({ ...prev, band: e.target.value }))}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white"
        >
          <option value="">Toutes les bandes</option>
          {['160m', '80m', '40m', '20m', '15m', '10m', '6m', '2m', '70cm'].map(b => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
        <button
          onClick={() => { setEditingQso(null); setShowForm(true); }}
          className="ml-auto px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded text-white font-bold transition"
        >
          ➕ Nouveau QSO
        </button>
      </div>

      {loading ? (
        <div>Chargement...</div>
      ) : (
        <QsoTable qsos={qsos} onEdit={handleEdit} onDelete={deleteQso} />
      )}

      {showForm && (
        <QsoFormModal
          qso={editingQso}
          onSubmit={handleSubmit}
          onClose={() => { setShowForm(false); setEditingQso(null); }}
        />
      )}
    </div>
  );
}

// ========== pages/ImportPage.jsx ==========
import { useState } from 'react';
import { useQso } from '../context/QsoContext';

export default function ImportPage() {
  const { importADIF } = useQso();
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);

  const handleImport = async (e) => {
    e.preventDefault();
    if (!file) return;

    setImporting(true);
    try {
      const data = await importADIF(file);
      setResult(data);
      setFile(null);
    } catch (err) {
      alert('Erreur import: ' + err.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-gray-800 p-8 rounded border border-gray-700">
        <h2 className="text-2xl font-bold mb-6">Importer depuis ADIF</h2>

        <form onSubmit={handleImport} className="space-y-6">
          <div className="border-2 border-dashed border-orange-500 rounded p-8 text-center cursor-pointer hover:bg-gray-700 transition">
            <input
              type="file"
              accept=".adi,.adif"
              onChange={(e) => setFile(e.target.files?.[0])}
              className="hidden"
              id="fileInput"
            />
            <label htmlFor="fileInput" className="cursor-pointer block">
              <p className="text-lg font-bold mb-2">📁 Dépose ton fichier ADIF ici</p>
              <p className="text-sm text-gray-400">{file?.name || 'Aucun fichier sélectionné'}</p>
            </label>
          </div>

          <button
            type="submit"
            disabled={!file || importing}
            className="w-full px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 rounded text-white font-bold transition"
          >
            {importing ? 'Importation...' : '📥 Importer'}
          </button>
        </form>

        {result && (
          <div className="mt-6 p-4 bg-green-900 border border-green-500 rounded">
            <p className="text-green-300">✅ {result.imported}/{result.total} QSOs importés</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ========== pages/StatsPage.jsx ==========
export default function StatsPage() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Statistiques Avancées</h2>
      <div className="bg-gray-800 p-6 rounded border border-gray-700 text-center">
        <p className="text-gray-400">📊 Heatmaps, cartes des gridsquares, et analyses avancées (V2.1)</p>
      </div>
    </div>
  );
}

// ========== pages/SettingsPage.jsx ==========
import { useAuth } from '../context/AuthContext';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="p-6 max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">Paramètres</h2>
      
      <div className="bg-gray-800 p-6 rounded border border-gray-700 space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Callsign</label>
          <input
            type="text"
            value={user?.callsign || ''}
            readOnly
            className="w-full px-4 py-2 bg-gray-700 rounded text-white font-mono"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2">Email</label>
          <input
            type="text"
            value={user?.email || ''}
            readOnly
            className="w-full px-4 py-2 bg-gray-700 rounded text-white"
          />
        </div>
      </div>

      <div className="mt-8 bg-gray-800 p-6 rounded border border-orange-500/30">
        <h3 className="font-bold mb-2">À propos</h3>
        <p className="text-sm text-gray-400">Station Master Online v2.0</p>
        <p className="text-sm text-gray-400">Logbook radioamateur cloud-native</p>
      </div>
    </div>
  );
}

// ========== components/StatCard.jsx ==========
export default function StatCard({ label, value, icon }) {
  return (
    <div className="bg-gray-800 p-4 rounded border border-orange-500/30 hover:border-orange-500 transition">
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-gray-400 text-sm">{label}</p>
      <p className="text-2xl font-bold text-orange-500 font-mono">{value}</p>
    </div>
  );
}

// ========== components/QsoChart.jsx ==========
export default function QsoChart({ type, data }) {
  if (!data || data.length === 0) return <p className="text-gray-400">Pas de données</p>;

  return (
    <div className="space-y-2">
      {data.map((item, idx) => (
        <div key={idx} className="flex items-center gap-4">
          <span className="w-12 font-mono text-sm">{item.band || item.mode}</span>
          <div className="flex-1 bg-gray-700 rounded h-6">
            <div
              className="bg-orange-500 h-6 rounded transition"
              style={{ width: `${(item.count / (Math.max(...data.map(d => d.count)) || 1)) * 100}%` }}
            />
          </div>
          <span className="w-8 text-right text-sm">{item.count}</span>
        </div>
      ))}
    </div>
  );
}

// ========== components/QsoTable.jsx ==========
export default function QsoTable({ qsos, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto bg-gray-800 rounded border border-gray-700">
      <table className="w-full text-sm font-mono">
        <thead className="bg-gray-900 border-b border-orange-500">
          <tr>
            <th className="px-4 py-3 text-left text-orange-500">Date</th>
            <th className="px-4 py-3 text-left text-orange-500">Heure</th>
            <th className="px-4 py-3 text-left text-orange-500">Call</th>
            <th className="px-4 py-3 text-left text-orange-500">Bande</th>
            <th className="px-4 py-3 text-left text-orange-500">Mode</th>
            <th className="px-4 py-3 text-left text-orange-500">Grid</th>
            <th className="px-4 py-3 text-right text-orange-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {qsos.map(qso => (
            <tr key={qso.id} className="hover:bg-gray-700 transition">
              <td className="px-4 py-3">{qso.date}</td>
              <td className="px-4 py-3">{qso.time}</td>
              <td className="px-4 py-3 text-orange-500 font-bold">{qso.call}</td>
              <td className="px-4 py-3">{qso.band}</td>
              <td className="px-4 py-3"><span className="bg-orange-500 text-white px-2 py-1 rounded text-xs">{qso.mode}</span></td>
              <td className="px-4 py-3">{qso.grid || '—'}</td>
              <td className="px-4 py-3 text-right space-x-2">
                <button
                  onClick={() => onEdit(qso)}
                  className="px-2 py-1 bg-orange-500 hover:bg-orange-600 rounded text-xs transition"
                >
                  ✏️
                </button>
                <button
                  onClick={() => { if (confirm('Supprimer?')) onDelete(qso.id); }}
                  className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs transition"
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ========== components/QsoFormModal.jsx ==========
import { useState, useEffect } from 'react';

export default function QsoFormModal({ qso, onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    call: '',
    band: '20m',
    mode: 'FT8',
    rstRx: '',
    rstTx: '',
    grid: '',
    notes: ''
  });

  useEffect(() => {
    if (qso) {
      setFormData({ ...qso, rstRx: qso.rst_rx || '', rstTx: qso.rst_tx || '', grid: qso.grid || '' });
    }
  }, [qso]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded border border-gray-700 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-6">{qso ? 'Éditer QSO' : 'Nouveau QSO'}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
            />
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
            />
          </div>

          <input
            type="text"
            name="call"
            placeholder="Callsign"
            value={formData.call.toUpperCase()}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white font-mono"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <select
              name="band"
              value={formData.band}
              onChange={handleChange}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
            >
              {['160m', '80m', '40m', '20m', '15m', '10m', '6m', '2m', '70cm'].map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <select
              name="mode"
              value={formData.mode}
              onChange={handleChange}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
            >
              {['CW', 'SSB', 'FM', 'RTTY', 'FT8', 'FT4', 'PSK31', 'DIGI'].map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="rstRx"
              placeholder="RST RX"
              value={formData.rstRx}
              onChange={handleChange}
              maxLength="3"
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white font-mono"
            />
            <input
              type="text"
              name="rstTx"
              placeholder="RST TX"
              value={formData.rstTx}
              onChange={handleChange}
              maxLength="3"
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white font-mono"
            />
          </div>

          <input
            type="text"
            name="grid"
            placeholder="Gridsquare (ex: JO20SP)"
            value={formData.grid.toUpperCase()}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white font-mono"
          />

          <textarea
            name="notes"
            placeholder="Notes..."
            value={formData.notes}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white font-mono h-20"
          />

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded text-white font-bold transition"
            >
              💾 Enregistrer
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white font-bold transition"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
