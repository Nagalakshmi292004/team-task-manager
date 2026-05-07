import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">⚡</div>
          <span className="sidebar-logo-text">TaskFlow</span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-label">Menu</div>
          <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">📊</span> Dashboard
          </NavLink>
          <NavLink to="/projects" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">📁</span> Projects
          </NavLink>
        </nav>

        <div className="sidebar-user">
          <div className="avatar">{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="user-name">{user?.name}</div>
            <div className="user-email">{user?.email}</div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={handleLogout} title="Logout">🚪</button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
