import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProjects, createProject } from '../utils/api';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6'];

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', color: COLORS[0] });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadProjects = () => {
    getProjects()
      .then(res => setProjects(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(loadProjects, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await createProject(form);
      setProjects(prev => [res.data, ...prev]);
      setShowModal(false);
      setForm({ name: '', description: '', color: COLORS[0] });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <>
      <div className="page-header">
        <div className="flex-between">
          <div>
            <h1 className="page-title">Projects</h1>
            <p className="page-subtitle">Manage your team workspaces</p>
          </div>
          <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => setShowModal(true)}>
            + New Project
          </button>
        </div>
      </div>
      <div className="page-body">
        {projects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📁</div>
            <div className="empty-title">No projects yet</div>
            <div className="empty-desc">Create your first project to start organizing team tasks.</div>
            <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => setShowModal(true)}>
              Create Project
            </button>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map(project => {
              const memberCount = project.members?.length || 0;
              const initials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
              return (
                <Link key={project._id} to={`/projects/${project._id}`} className="project-card">
                  <div className="project-color-bar" style={{ background: project.color }} />
                  <div className="project-name">{project.name}</div>
                  {project.description && (
                    <div className="project-desc">{project.description}</div>
                  )}
                  <div className="project-meta">
                    <div className="project-members">
                      {project.members?.slice(0, 4).map((m, i) => (
                        <div key={i} className="project-member-avatar" style={{ background: COLORS[i % COLORS.length] }}>
                          {initials(m.user?.name)}
                        </div>
                      ))}
                      {memberCount > 4 && (
                        <div className="project-member-avatar" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', fontSize: 9 }}>
                          +{memberCount - 4}
                        </div>
                      )}
                    </div>
                    <span className="project-task-count">{memberCount} member{memberCount !== 1 ? 's' : ''}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">New Project</span>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                {error && <div className="error-msg">{error}</div>}
                <div className="form-group">
                  <label className="form-label">Project Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Website Redesign"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    placeholder="What is this project about?"
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Color</label>
                  <div className="color-picker">
                    {COLORS.map(c => (
                      <div
                        key={c}
                        className={`color-option ${form.color === c ? 'selected' : ''}`}
                        style={{ background: c }}
                        onClick={() => setForm({ ...form, color: c })}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ width: 'auto' }} disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
