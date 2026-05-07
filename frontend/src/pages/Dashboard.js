import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard } from '../utils/api';
import { format, isPast } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const PRIORITY_COLORS = { low: 'badge-low', medium: 'badge-medium', high: 'badge-high' };
const STATUS_LABELS = { todo: 'To Do', inprogress: 'In Progress', done: 'Done' };

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    getDashboard()
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  const { stats, tasksPerUser, recentTasks, overdueTaskDetails } = data || {};
  const maxCount = tasksPerUser?.length ? Math.max(...tasksPerUser.map(u => u.count)) : 1;

  return (
    <>
      <div className="page-header">
        <p className="page-subtitle">👋 Welcome back, {user?.name?.split(' ')[0]}</p>
        <h1 className="page-title">Dashboard</h1>
      </div>
      <div className="page-body">

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Projects</div>
            <div className="stat-value stat-purple">{stats?.totalProjects ?? 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Tasks</div>
            <div className="stat-value">{stats?.totalTasks ?? 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">To Do</div>
            <div className="stat-value stat-blue">{stats?.todoTasks ?? 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">In Progress</div>
            <div className="stat-value stat-yellow">{stats?.inProgressTasks ?? 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Completed</div>
            <div className="stat-value stat-green">{stats?.doneTasks ?? 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Overdue</div>
            <div className="stat-value stat-red">{stats?.overdueTasks ?? 0}</div>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* Tasks per user */}
          <div className="card">
            <div className="section-title">Tasks per Member</div>
            {tasksPerUser?.length ? (
              <div className="bar-chart">
                {tasksPerUser.map((u, i) => (
                  <div key={i} className="bar-item">
                    <span className="bar-label">{u.name}</span>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${(u.count / maxCount) * 100}%` }} />
                    </div>
                    <span className="bar-count">{u.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No tasks assigned yet.</p>
            )}
          </div>

          {/* Overdue tasks */}
          <div className="card">
            <div className="section-title">⚠️ Overdue Tasks</div>
            {overdueTaskDetails?.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {overdueTaskDetails.map(t => (
                  <div key={t._id} style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: '10px 12px' }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{t.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--red)', marginTop: 2 }}>
                      Due: {t.dueDate ? format(new Date(t.dueDate), 'MMM d, yyyy') : '—'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>🎉 No overdue tasks!</p>
            )}
          </div>

          {/* Recent tasks */}
          <div className="card full-width">
            <div className="section-title">Recent Tasks</div>
            {recentTasks?.length ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Project</th>
                    <th>Assigned To</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTasks.map(t => (
                    <tr key={t._id}>
                      <td style={{ fontWeight: 600 }}>{t.title}</td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <span className="color-dot" style={{ background: t.project?.color || '#6366f1' }}></span>
                          {t.project?.name}
                        </span>
                      </td>
                      <td>{t.assignedTo?.name || <span style={{ color: 'var(--text-dim)' }}>Unassigned</span>}</td>
                      <td><span className={`badge ${PRIORITY_COLORS[t.priority]}`}>{t.priority}</span></td>
                      <td><span className={`badge badge-${t.status}`}>{STATUS_LABELS[t.status]}</span></td>
                      <td className={t.dueDate && isPast(new Date(t.dueDate)) && t.status !== 'done' ? 'task-due overdue' : 'task-due'}>
                        {t.dueDate ? format(new Date(t.dueDate), 'MMM d, yyyy') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <div className="empty-title">No tasks yet</div>
                <div className="empty-desc">Create a project and add tasks to get started.</div>
                <Link to="/projects" className="btn btn-secondary btn-sm">Go to Projects</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
