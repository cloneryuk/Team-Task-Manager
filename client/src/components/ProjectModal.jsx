import { useState } from 'react'

export default function ProjectModal({ onClose, onSubmit, project = null }) {
  const [name, setName] = useState(project?.name || '')
  const [description, setDescription] = useState(project?.description || '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) { setError('Project name is required'); return }
    setLoading(true)
    setError('')
    try {
      await onSubmit({ name: name.trim(), description: description.trim() })
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-md glass p-8 animate-slide-up" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-heading font-bold gradient-text mb-6">
          {project ? 'Edit Project' : 'New Project'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">Project Name</label>
            <input
              id="project-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Website Redesign"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/30 transition-all"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">Description</label>
            <textarea
              id="project-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe your project..."
              rows="3"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/30 transition-all resize-none"
            />
          </div>
          {error && <p className="text-sm text-neon-red">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl bg-white/5 text-white/60 hover:bg-white/10 transition-all font-medium">Cancel</button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple text-white font-semibold hover:shadow-lg hover:shadow-neon-blue/25 transition-all disabled:opacity-50"
            >
              {loading ? '...' : project ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
