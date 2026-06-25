import React, { useEffect } from 'react';
import { Navigate, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import { clearToken, getToken } from './lib/api';
import Courses from './pages/Courses';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Recommendations from './pages/Recommendations';
import Rooms from './pages/Rooms';
import Schedules from './pages/Schedules';
import Students from './pages/Students';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/schedules', label: 'Schedules' },
  { to: '/recommendations', label: 'Recommendations' },
  { to: '/rooms', label: 'Rooms' },
  { to: '/courses', label: 'Courses' },
  { to: '/students', label: 'Students' },
];

function Shell({ onLogout, children }: { onLogout: () => void; children: React.ReactNode }) {
  const location = useLocation();
  const current = navItems.find((item) => item.to === location.pathname) ?? navItems[0];

  return (
    <div className="app-shell">
      <div className="grid min-h-screen lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="sidebar flex flex-col">
          <div className="border-b border-slate-700 px-5 py-5">
            <p className="section-title text-amber-400">University Operations</p>
            <h1 className="mt-2 text-xl font-bold text-white">Command Center</h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Monitor room pressure, schedule conflicts, and recommended actions in one operational view.
            </p>
          </div>

          <nav className="flex-1 space-y-2 px-4 py-4">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-slate-700 px-5 py-4">
            <div className="panel-alt rounded-xl p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">Demo story</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Show the issue, open the schedule table, then walk through the recommendation list as the fix.
              </p>
            </div>
          </div>
        </aside>

        <div className="flex min-h-screen flex-col">
          <header className="topbar flex items-center justify-between px-6 py-4 lg:px-8">
            <div>
              <p className="section-title text-slate-400">Current section</p>
              <h2 className="mt-1 text-lg font-semibold text-white">{current.label}</h2>
            </div>
            <button onClick={onLogout} className="button-secondary">
              Logout
            </button>
          </header>

          <main className="flex-1 px-4 py-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}

function RedirectHome() {
  return <Navigate to="/" replace />;
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = getToken();
  const onLoginPage = location.pathname === '/login';

  useEffect(() => {
    if (!token && !onLoginPage) {
      navigate('/login', { replace: true });
    }
    if (token && onLoginPage) {
      navigate('/', { replace: true });
    }
  }, [navigate, onLoginPage, token]);

  const logout = () => {
    clearToken();
    navigate('/login');
  };

  const routes = (
    <Routes>
      <Route path="/login" element={<Login onSuccess={() => navigate('/')} />} />
      <Route path="/" element={<Dashboard />} />
      <Route path="/schedules" element={<Schedules />} />
      <Route path="/recommendations" element={<Recommendations />} />
      <Route path="/rooms" element={<Rooms />} />
      <Route path="/courses" element={<Courses />} />
      <Route path="/students" element={<Students />} />
      <Route path="*" element={<RedirectHome />} />
    </Routes>
  );

  if (!token && !onLoginPage) {
    return <Navigate to="/login" replace />;
  }

  if (token && onLoginPage) {
    return <Navigate to="/" replace />;
  }

  return token ? <Shell onLogout={logout}>{routes}</Shell> : routes;
}
