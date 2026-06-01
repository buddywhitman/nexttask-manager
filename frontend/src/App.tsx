import { useState, useEffect, useCallback } from 'react';
import { api, type User, type Task, type Stage } from './api';
import { KanbanBoard } from './components/KanbanBoard';
import { 
  Lock, 
  Mail, 
  User as UserIcon, 
  LogOut, 
  Plus, 
  X, 
  AlertCircle, 
  CheckCircle,
  Kanban
} from 'lucide-react';

export default function App() {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(localStorage.getItem('task_manager_token'));
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const [authEmail, setAuthEmail] = useState<string>('');
  const [authPassword, setAuthPassword] = useState<string>('');
  const [authName, setAuthName] = useState<string>('');

  // App data state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal control
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskTitle, setTaskTitle] = useState<string>('');
  const [taskDesc, setTaskDesc] = useState<string>('');
  const [taskStage, setTaskStage] = useState<Stage>('TODO');

  // Verify and fetch profile on load
  useEffect(() => {
    if (token) {
      setIsLoading(true);
      api.getProfile()
        .then(({ user }) => {
          setUser(user);
          fetchTasks();
        })
        .catch(() => {
          handleLogout();
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [token]);

  const fetchTasks = useCallback(() => {
    setIsLoading(true);
    api.getTasks()
      .then(setTasks)
      .catch((err) => setError(err.message || 'Failed to load tasks'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('task_manager_token');
    setTokenState(null);
    setUser(null);
    setTasks([]);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isRegisterMode) {
        const data = await api.register(authEmail, authPassword, authName);
        localStorage.setItem('task_manager_token', data.token);
        setTokenState(data.token);
        setUser(data.user);
        setSuccess('Registration successful!');
      } else {
        const data = await api.login(authEmail, authPassword);
        localStorage.setItem('task_manager_token', data.token);
        setTokenState(data.token);
        setUser(data.user);
        setSuccess('Login successful!');
      }
      setAuthPassword('');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const openAddTaskModal = () => {
    setEditingTask(null);
    setTaskTitle('');
    setTaskDesc('');
    setTaskStage('TODO');
    setIsModalOpen(true);
  };

  const openEditTaskModal = (task: Task) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskDesc(task.description || '');
    setTaskStage(task.stage);
    setIsModalOpen(true);
  };

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) {
      setError('Task title is required');
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsModalOpen(false);

    try {
      if (editingTask) {
        const updated = await api.updateTask(editingTask.id, {
          title: taskTitle,
          description: taskDesc,
          stage: taskStage,
        });
        setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
        setSuccess('Task updated successfully');
      } else {
        const created = await api.createTask(taskTitle, taskDesc, taskStage);
        setTasks(prev => [created, ...prev]);
        setSuccess('Task created successfully');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save task');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    setIsLoading(true);
    setError(null);

    try {
      await api.deleteTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
      setSuccess('Task deleted successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to delete task');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoveTaskStage = async (id: string, newStage: Stage) => {
    try {
      // Optimistic update
      setTasks(prev => prev.map(t => t.id === id ? { ...t, stage: newStage } : t));
      await api.updateTask(id, { stage: newStage });
    } catch (err: any) {
      setError(err.message || 'Failed to update task stage');
      fetchTasks(); // rollback
    }
  };

  // Render Auth View
  if (!user) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <Kanban size={40} className="brand-icon" style={{ margin: '0 auto' }} />
            <h2>{isRegisterMode ? 'Create Account' : 'Welcome Back'}</h2>
            <p>{isRegisterMode ? 'Sign up to start tracking your tasks' : 'Log in to access your task board'}</p>
          </div>

          <form className="auth-form" onSubmit={handleAuthSubmit}>
            {isRegisterMode && (
              <div className="form-group">
                <label htmlFor="authName">Full Name</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="authName"
                    className="auth-input"
                    placeholder="Enter your name"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    required
                  />
                  <UserIcon size={16} className="input-icon" />
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="authEmail">Email Address</label>
              <div className="input-wrapper">
                <input
                  type="email"
                  id="authEmail"
                  className="auth-input"
                  placeholder="name@example.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  required
                />
                <Mail size={16} className="input-icon" />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="authPassword">Password</label>
              <div className="input-wrapper">
                <input
                  type="password"
                  id="authPassword"
                  className="auth-input"
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  required
                />
                <Lock size={16} className="input-icon" />
              </div>
            </div>

            {error && (
              <div className="auth-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" className="btn-auth-submit" disabled={isLoading}>
              {isLoading ? (
                <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
              ) : isRegisterMode ? (
                'Register Now'
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="auth-footer">
            <span>
              {isRegisterMode ? 'Already have an account?' : "Don't have an account?"}
            </span>
            <button
              className="auth-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setError(null);
              }}
            >
              {isRegisterMode ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render Dashboard View
  return (
    <div className="app-container">
      <header className="app-header">
        <div className="brand">
          <Kanban size={28} className="brand-icon" />
          <h1 className="brand-title">NextTask</h1>
        </div>

        <div className="user-profile">
          <span className="user-name">Hello, <strong>{user.name}</strong></span>
          <button className="btn-logout" onClick={handleLogout}>
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {error && (
        <div className="alert-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
          <button className="btn-alert-close" onClick={() => setError(null)}>
            <X size={16} />
          </button>
        </div>
      )}

      {success && (
        <div className="alert-banner" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#a7f3d0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={16} style={{ color: '#10b981' }} />
            <span>{success}</span>
          </div>
          <button className="btn-alert-close" style={{ color: '#a7f3d0' }} onClick={() => setSuccess(null)}>
            <X size={16} />
          </button>
        </div>
      )}

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="board-actions">
          <div className="board-info">
            <h2>Task Board</h2>
            <p>Manage your tasks across standard stages by dragging cards or using arrows.</p>
          </div>
          <button className="btn-add-task" onClick={openAddTaskModal}>
            <Plus size={16} />
            <span>Add Task</span>
          </button>
        </div>

        {isLoading && tasks.length === 0 ? (
          <div className="loading-screen">
            <div className="spinner"></div>
            <p style={{ color: 'var(--text-muted)' }}>Loading board details...</p>
          </div>
        ) : (
          <KanbanBoard 
            tasks={tasks}
            onEditTask={openEditTaskModal}
            onDeleteTask={handleDeleteTask}
            onMoveTask={handleMoveTaskStage}
          />
        )}
      </main>

      {/* Task Modal (Create & Edit) */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{editingTask ? 'Edit Task' : 'Create Task'}</h3>
              <button className="btn-close-modal" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form className="task-form" onSubmit={handleTaskSubmit}>
              <div className="form-group">
                <label htmlFor="taskTitle">Task Title</label>
                <input
                  type="text"
                  id="taskTitle"
                  placeholder="What needs to be done?"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  maxLength={100}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="taskDesc">Description (Optional)</label>
                <textarea
                  id="taskDesc"
                  placeholder="Provide details or notes about this task..."
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  maxLength={1000}
                />
              </div>

              <div className="form-group">
                <label htmlFor="taskStage">Board Lane Stage</label>
                <select
                  id="taskStage"
                  value={taskStage}
                  onChange={(e) => setTaskStage(e.target.value as Stage)}
                >
                  <option value="TODO">Todo</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
