import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import KanbanBoard from '../components/KanbanBoard'
import MemberPanel from '../components/MemberPanel'
import TaskModal from '../components/TaskModal'
import Toast from '../components/Toast'
import api from '../api/axios'

export default function ProjectView() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [showMembers, setShowMembers] = useState(false)
  const [toast, setToast] = useState(null)

  const fetchProject = useCallback(async () => {
    try {
      const [projRes, tasksRes, membersRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/projects/${id}/tasks`),
        api.get(`/projects/${id}/members`)
      ])
      setProject(projRes.data.project)
      setTasks(tasksRes.data.tasks)
      setMembers(membersRes.data.members)
    } catch (err) {
      console.error('Failed to load project:', err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    setLoading(true)
    fetchProject()
  }, [fetchProject])

  const handleTaskUpdate = (taskId, updates) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t))
  }

  const handleCreateTask = async (data) => {
    const res = await api.post(`/projects/${id}/tasks`, data)
    setTasks([res.data.task, ...tasks])
    setToast({ message: 'Task created!', type: 'success' })
  }

  const handleEditTask = async (data) => {
    const res = await api.put(`/projects/${id}/tasks/${editingTask.id}`, data)
    setTasks(prev => prev.map(t => t.id === editingTask.id ? res.data.task : t))
    setEditingTask(null)
    setToast({ message: 'Task updated!', type: 'success' })
  }

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return
    try {
      await api.delete(`/projects/${id}/tasks/${taskId}`)
      setTasks(prev => prev.filter(t => t.id !== taskId))
      setEditingTask(null)
      setToast({ message: 'Task deleted', type: 'info' })
    } catch (err) {
      setToast({ message: err.response?.data?.error || 'Failed to delete', type: 'error' })
    }
  }

  const handleTaskClick = (task) => {
    setEditingTask(task)
  }

  const isAdmin = project?.user_role === 'admin'

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-8 h-8 border-2 border-neon-blue border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    )
  }

  if (!project) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[60vh] text-white/30">
          <p className="text-4xl mb-4">😢</p>
          <p>Project not found</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="w-full animate-fade-in">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-heading font-bold text-3xl text-white">{project.name}</h1>
            {project.description && (
              <p className="text-white/40 mt-1 max-w-2xl">{project.description}</p>
            )}
            <div className="flex items-center gap-4 mt-3">
              <span className="text-xs px-3 py-1 rounded-full bg-white/5 text-white/40">
                {tasks.length} tasks
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-white/5 text-white/40">
                {members.length} members
              </span>
              <span className={`text-xs px-3 py-1 rounded-full ${isAdmin ? 'bg-neon-purple/15 text-neon-purple' : 'bg-white/5 text-white/40'}`}>
                {isAdmin ? '👑 Admin' : '👤 Member'}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowMembers(!showMembers)}
              className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm font-medium hover:bg-white/10 transition-all"
            >
              👥 Team
            </button>
            <button
              onClick={() => setShowTaskModal(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple text-white text-sm font-semibold hover:shadow-lg hover:shadow-neon-blue/25 transition-all"
            >
              + New Task
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          <div className={`flex-1 transition-all duration-300 ${showMembers ? 'mr-0' : ''}`}>
            <KanbanBoard
              tasks={tasks}
              projectId={id}
              onTaskUpdate={handleTaskUpdate}
              onTaskClick={handleTaskClick}
            />
          </div>

          {/* Member Panel Sidebar */}
          {showMembers && (
            <div className="w-80 flex-shrink-0 animate-slide-in-right">
              <MemberPanel
                projectId={id}
                members={members}
                onMembersChange={setMembers}
                isAdmin={isAdmin}
              />
            </div>
          )}
        </div>
      </div>
      {showTaskModal && (
        <TaskModal
          onClose={() => setShowTaskModal(false)}
          onSubmit={handleCreateTask}
          members={members}
        />
      )}

      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setEditingTask(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg glass p-8 animate-slide-up max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-heading font-bold gradient-text">Edit Task</h2>
              {isAdmin && (
                <button
                  onClick={() => handleDeleteTask(editingTask.id)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-neon-red/10 text-neon-red border border-neon-red/20 hover:bg-neon-red/20 transition-all"
                >
                  Delete
                </button>
              )}
            </div>
            <TaskModalForm
              task={editingTask}
              members={members}
              onSubmit={handleEditTask}
              onClose={() => setEditingTask(null)}
            />
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </Layout>
  )
}

function TaskModalForm({ task, members, onSubmit, onClose }) {
  const [title, setTitle] = useState(task?.title || '')
  const [description, setDescription] = useState(task?.description || '')
  const [priority, setPriority] = useState(task?.priority || 'medium')
  const [status, setStatus] = useState(task?.status || 'todo')
  const [assignedTo, setAssignedTo] = useState(task?.assigned_to || '')
  const [dueDate, setDueDate] = useState(task?.due_date ? task.due_date.split('T')[0] : '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) { setError('Title is required'); return }
    setLoading(true)
    try {
      await onSubmit({
        title: title.trim(), description: description.trim(),
        priority, status, assigned_to: assignedTo || null, due_date: dueDate || null
      })
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/30 transition-all'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-white/60 mb-2">Title</label>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className="block text-sm font-medium text-white/60 mb-2">Description</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} rows="3" className={`${inputClass} resize-none`} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white/60 mb-2">Priority</label>
          <select value={priority} onChange={e => setPriority(e.target.value)} className={inputClass}>
            <option value="low">Low</option><option value="medium">Medium</option>
            <option value="high">High</option><option value="critical">Critical</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-white/60 mb-2">Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)} className={inputClass}>
            <option value="todo">To Do</option><option value="in_progress">In Progress</option>
            <option value="review">Review</option><option value="done">Done</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white/60 mb-2">Assign To</label>
          <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} className={inputClass}>
            <option value="">Unassigned</option>
            {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-white/60 mb-2">Due Date</label>
          <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={inputClass} />
        </div>
      </div>
      {error && <p className="text-sm text-neon-red">{error}</p>}
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl bg-white/5 text-white/60 hover:bg-white/10 transition-all font-medium">Cancel</button>
        <button type="submit" disabled={loading} className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple text-white font-semibold hover:shadow-lg hover:shadow-neon-blue/25 transition-all disabled:opacity-50">
          {loading ? '...' : 'Update'}
        </button>
      </div>
    </form>
  )
}
