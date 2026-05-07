import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { format, isPast } from 'date-fns';
import {
  getProject, getTasks, createTask, updateTask, deleteTask,
  addMember, removeMember, searchUsers, deleteProject, updateProject
} from '../utils/api';
import { useAuth } from '../context/AuthContext';

const PRIORITY_COLORS = { low: 'badge-low', medium: 'badge-medium', high: 'badge-high' };
const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6'];

const COLUMNS = [
  { key: 'todo', label: '📋 To Do' },
  { key: 'inprogress', label: '🔄 In Progress' },
  { key: 'done', label: '✅ Done' },
];

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('tasks');

  // Task modal
  const [taskModal, setTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assignedTo: '', priority: 'medium', dueDate: '', status: 'todo' });
  const [taskError, setTaskError] = useState('');
  const [taskSubmitting, setTaskSubmitting] = useState(false);

  // Member modal
  const [memberModal, setMemberModal] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [memberResults, setMemberResults] = useState([]);
  const [memberSearching, setMemberSearching] = useState(false);
  const searchRef = useRef(null);

  const isAdmin = project?.admin?._id === user?._id || project?.admin === user?._id;

  const loadAll = async () => {
    try {
      const [pRes, tRes] = await Promise.all([getProject(id), getTasks(id)]);
      setProject(pRes.data);
      setTasks(tRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, [id]);

  // Search users
  useEffect(() => {
    if (!memberSearch.trim()) { setMemberResults([]); return; }
    const t = setTimeout(async () => {
      setMemberSearching(true);
      try {
        const res = await searchUsers(memberSearch);
        // Filter out existing members
        const memberIds = project?.members?.map(m => m.user._id || m.user) || [];
        setMemberResults(res.data.filter(u => !memberIds.includes(u._id)));
      } catch {} finally { setMemberSearching(false); }
    }, 400);
    return () => clearTimeout(t);
  }, [memberSearch, project]);

  const openCreateTask = () => {
    setEditingTask(null);
    setTaskForm({ title: '', description: '', assignedTo: '', priority: 'medium', dueDate: '', status: 'todo' });
    setTaskError('');
    setTaskModal(true);
  };

  const openEditTask = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      assignedTo: task.assignedTo?._id || '',
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      status: task.status,
    });
    setTaskError('');
    setTaskModal(true);
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    setTaskSubmitting(true);
    setTaskError('');
    try {
      const payload = {
        ...taskForm,
        projectId: id,
        assignedTo: taskForm.assignedTo || null,
        dueDate: taskForm.dueDate || null,
      };
      if (editingTask) {
        const res = await updateTask(editingTask._id, payload);
        setTasks(prev => prev.map(t => t._id === editingTask._id ? res.data : t));
      } else {
        const res = await createTask(payload);
        setTasks(prev => [res.data, ...prev]);
      }
      setTaskModal(false);
    } catch (err) {
      setTaskError(err.response?.data?.message || 'Failed to save task');
    } finally {
      setTaskSubmitting(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await deleteTask(taskId);
      setTasks(prev => prev.filter(t => t._id !== taskId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      const res = await updateTask(task._id, { status: newStatus });
      setTasks(prev => prev.map(t => t._id === task._id ? res.data : t));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  const handleAddMember = async (userId) => {
    try {
      const res = await addMember(id, userId);
      setProject(res.data);
      setMemberSearch('');
      setMemberResults([]);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      const res = await removeMember(id, userId);
      setProject(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('Delete this project and all its tasks? This cannot be undone.')) return;
    try {
      await deleteProject(id);
      navigate('/projects');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  const tasksByStatus = (status) => tasks.filter(t => t.status === status);

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;
  if (!project) return <div className="page-body"><p>Project not found.</p></div>;

  const initials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <>
      <div className="page-header">
        <Link to="/projects" className="back-link">← Back to Projects</Link>
        <div className="flex-between">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: project.color }} />
            <h1 className="page-title">{project.name}</h1>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {isAdmin && (
              <>
                <button className="btn btn-secondary btn-sm" onClick={() => setMemberModal(true)}>👥 Members</button>
                <button className="btn btn-secondary btn-sm" onClick={openCreateTask}>+ Task</button>
                <button className="btn btn-danger btn-sm" onClick={handleDeleteProject}>🗑 Delete</button>
              </>
            )}
          </div>
        </div>
        {project.description && <p className="page-subtitle">{project.description}</p>}
      </div>

      <div className="page-body">
        <div className="tab-bar">
          <button className={`tab-btn ${tab === 'tasks' ? 'active' : ''}`} onClick={() => setTab('tasks')}>Tasks</button>
          <button className={`tab-btn ${tab === 'members' ? 'active' : ''}`} onClick={() => setTab('members')}>
            Members ({project.members?.length || 0})
          </button>
        </div>

        {tab === 'tasks' && (
          <>
            {tasks.length === 0 && isAdmin && (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <div className="empty-title">No tasks yet</div>
                <div className="empty-desc">Create the first task for this project.</div>
                <button className="btn btn-primary" style={{ width: 'auto' }} onClick={openCreateTask}>+ Create Task</button>
              </div>
            )}
            {tasks.length === 0 && !isAdmin && (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <div className="empty-title">No tasks yet</div>
                <div className="empty-desc">The project admin hasn't created any tasks yet.</div>
              </div>
            )}
            {tasks.length > 0 && (
              <div className="task-board">
                {COLUMNS.map(col => {
                  const colTasks = tasksByStatus(col.key);
                  return (
                    <div key={col.key} className="task-column">
                      <div className="task-column-header">
                        <span className="task-column-title">
                          {col.label}
                          <span className="task-column-count">{colTasks.length}</span>
                        </span>
                      </div>
                      <div className="task-column-body">
                        {colTasks.map(task => {
                          const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'done';
                          const canEdit = isAdmin || (task.assignedTo?._id === user?._id);
                          return (
                            <div key={task._id} className="task-card">
                              <div className="task-title">{task.title}</div>
                              {task.description && <div className="task-desc">{task.description}</div>}
                              <div className="task-meta">
                                <div className="task-meta-left">
                                  <span className={`badge ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</span>
                                  {task.dueDate && (
                                    <span className={`task-due ${isOverdue ? 'overdue' : ''}`}>
                                      {isOverdue ? '⚠️ ' : '📅 '}
                                      {format(new Date(task.dueDate), 'MMM d')}
                                    </span>
                                  )}
                                </div>
                                {task.assignedTo && (
                                  <div className="task-assignee">
                                    <div className="avatar" style={{ width: 22, height: 22, fontSize: 9 }}>{initials(task.assignedTo.name)}</div>
                                    <span className="task-assignee-name">{task.assignedTo.name.split(' ')[0]}</span>
                                  </div>
                                )}
                              </div>
                              {canEdit && (
                                <div className="task-actions">
                                  {col.key !== 'todo' && (
                                    <button className="btn btn-ghost btn-sm" onClick={() => handleStatusChange(task, col.key === 'done' ? 'inprogress' : 'todo')}>← Back</button>
                                  )}
                                  {col.key !== 'done' && (
                                    <button className="btn btn-ghost btn-sm" onClick={() => handleStatusChange(task, col.key === 'todo' ? 'inprogress' : 'done')}>
                                      {col.key === 'todo' ? '▶ Start' : '✓ Done'}
                                    </button>
                                  )}
                                  {isAdmin && (
                                    <>
                                      <button className="btn btn-ghost btn-sm" onClick={() => openEditTask(task)}>✏️</button>
                                      <button className="btn btn-ghost btn-sm" onClick={() => handleDeleteTask(task._id)}>🗑</button>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                        {colTasks.length === 0 && (
                          <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: 13, padding: '20px 0' }}>Empty</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {tab === 'members' && (
          <div style={{ maxWidth: 500 }}>
            <div className="card">
              <div className="flex-between" style={{ marginBottom: 16 }}>
                <div className="section-title" style={{ margin: 0 }}>Team Members</div>
                {isAdmin && (
                  <button className="btn btn-secondary btn-sm" onClick={() => setMemberModal(true)}>+ Add Member</button>
                )}
              </div>
              <div className="members-list">
                {project.members?.map((m, i) => {
                  const memberUser = m.user;
                  const isCurrentAdmin = project.admin?._id === memberUser?._id || project.admin === memberUser?._id;
                  return (
                    <div key={i} className="member-item">
                      <div className="avatar avatar-lg">{initials(memberUser?.name)}</div>
                      <div className="member-info">
                        <div className="member-name">{memberUser?.name}</div>
                        <div className="member-email">{memberUser?.email}</div>
                      </div>
                      <span className="member-role">{isCurrentAdmin ? 'Admin' : 'Member'}</span>
                      {isAdmin && !isCurrentAdmin && memberUser?._id !== user?._id && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleRemoveMember(memberUser._id)}>Remove</button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Task Modal */}
      {taskModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setTaskModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{editingTask ? 'Edit Task' : 'New Task'}</span>
              <button className="btn btn-ghost btn-icon" onClick={() => setTaskModal(false)}>✕</button>
            </div>
            <form onSubmit={handleTaskSubmit}>
              <div className="modal-body">
                {taskError && <div className="error-msg">{taskError}</div>}
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input type="text" className="form-input" placeholder="Task title" value={taskForm.title}
                    onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" placeholder="Task details..." value={taskForm.description}
                    onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} />
                </div>
                <div className="input-row">
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select className="form-select" value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-select" value={taskForm.status} onChange={e => setTaskForm({ ...taskForm, status: e.target.value })}>
                      <option value="todo">To Do</option>
                      <option value="inprogress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  </div>
                </div>
                <div className="input-row">
                  <div className="form-group">
                    <label className="form-label">Assign To</label>
                    <select className="form-select" value={taskForm.assignedTo} onChange={e => setTaskForm({ ...taskForm, assignedTo: e.target.value })}>
                      <option value="">Unassigned</option>
                      {project.members?.map((m, i) => (
                        <option key={i} value={m.user._id}>{m.user.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Due Date</label>
                    <input type="date" className="form-input" value={taskForm.dueDate}
                      onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setTaskModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ width: 'auto' }} disabled={taskSubmitting}>
                  {taskSubmitting ? 'Saving...' : editingTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Modal */}
      {memberModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setMemberModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">Add Members</span>
              <button className="btn btn-ghost btn-icon" onClick={() => setMemberModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group relative">
                <label className="form-label">Search by Email</label>
                <input
                  type="email"
                  ref={searchRef}
                  className="form-input"
                  placeholder="member@email.com"
                  value={memberSearch}
                  onChange={e => setMemberSearch(e.target.value)}
                />
                {memberResults.length > 0 && (
                  <div className="search-results">
                    {memberResults.map(u => (
                      <div key={u._id} className="search-result-item" onClick={() => handleAddMember(u._id)}>
                        <strong>{u.name}</strong> — {u.email}
                      </div>
                    ))}
                  </div>
                )}
                {memberSearching && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Searching...</div>}
                {memberSearch && !memberSearching && memberResults.length === 0 && (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>No users found (they must be registered)</div>
                )}
              </div>
              <div className="divider" />
              <div className="section-title">Current Members</div>
              <div className="members-list">
                {project.members?.map((m, i) => {
                  const mu = m.user;
                  const isCurrentAdmin = project.admin?._id === mu?._id;
                  return (
                    <div key={i} className="member-item">
                      <div className="avatar">{mu?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}</div>
                      <div className="member-info">
                        <div className="member-name">{mu?.name}</div>
                        <div className="member-email">{mu?.email}</div>
                      </div>
                      {!isCurrentAdmin && mu?._id !== user?._id && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleRemoveMember(mu._id)}>Remove</button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setMemberModal(false)}>Done</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
