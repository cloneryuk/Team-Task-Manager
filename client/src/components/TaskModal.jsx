import { useState } from 'react'

export default function TaskModal({ onClose, onSubmit, task = null, members = [] }) {
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
    if (!title.trim()) { setError('Task title is required'); return }
    setLoading(true)
    setError('')
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        priority,
        status,
        assigned_to: assignedTo || null,
        due_date: dueDate || null
      })
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const priorities = [
    { value: 'low', label: 'Low', color: 'text-neon-green' },
    { value: 'medium', label: 'Medium', color: 'text-neon-blue' },
    { value: 'high', label: 'High', color: 'text-neon-orange' },
    { value: 'critical', label: 'Critical', color: 'text-neon-red' }
  ]

  const statuses = [
    { value: 'todo', label: 'To Do' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'review', label: 'Review' },
    { value: 'done', label: 'Done' }
  ]

  const inputClass = 'w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/30 transition-all'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg glass p-8 animate-slide-up max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-heading font-bold gradient-text mb-6">
          {task ? 'Edit Task' : 'New Task'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">Title</label>
            <input id="task-title" type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="What needs to be done?" className={inputClass} autoFocus />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">Description</label>
            <textarea id="task-description" value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Add details..." rows="3" className={`${inputClass} resize-none`} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Priority</label>
              <select id="task-priority" value={priority} onChange={e => setPriority(e.target.value)} className={inputClass}>
                {priorities.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Status</label>
              <select id="task-status" value={status} onChange={e => setStatus(e.target.value)} className={inputClass}>
                {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Assign To</label>
              <select id="task-assignee" value={assignedTo} onChange={e => setAssignedTo(e.target.value)} className={inputClass}>
                <option value="">Unassigned</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Due Date</label>
              <input id="task-due-date" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={inputClass} />
            </div>
          </div>
          {error && <p className="text-sm text-neon-red">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl bg-white/5 text-white/60 hover:bg-white/10 transition-all font-medium">Cancel</button>
            <button type="submit" disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple text-white font-semibold hover:shadow-lg hover:shadow-neon-blue/25 transition-all disabled:opacity-50">
              {loading ? '...' : task ? 'Update' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
