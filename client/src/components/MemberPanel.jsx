import { useState } from 'react'
import api from '../api/axios'

export default function MemberPanel({ projectId, members, onMembersChange, isAdmin }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await api.post(`/projects/${projectId}/members`, { email: email.trim(), role: 'member' })
      onMembersChange([...members, res.data.member])
      setEmail('')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add member')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/projects/${projectId}/members/${userId}`, { role: newRole })
      onMembersChange(members.map(m => m.id === userId ? { ...m, role: newRole } : m))
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update role')
    }
  }

  const handleRemove = async (userId) => {
    if (!confirm('Remove this member from the project?')) return
    try {
      await api.delete(`/projects/${projectId}/members/${userId}`)
      onMembersChange(members.filter(m => m.id !== userId))
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to remove member')
    }
  }

  const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  const colors = [
    'from-neon-blue to-neon-purple',
    'from-neon-green to-neon-cyan',
    'from-neon-orange to-neon-pink',
    'from-neon-purple to-neon-pink',
    'from-neon-cyan to-neon-blue'
  ]

  return (
    <div className="glass p-6 space-y-4">
      <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
        👥 Team Members
        <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-white/10 text-white/50">{members.length}</span>
      </h3>
      <div className="space-y-3">
        {members.map((member, i) => (
          <div key={member.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-all">
            <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${colors[i % colors.length]} flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}>
              {getInitials(member.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{member.name}</p>
              <p className="text-xs text-white/40 truncate">{member.email}</p>
            </div>
            {isAdmin ? (
              <div className="flex items-center gap-2 flex-shrink-0">
                <select
                  value={member.role}
                  onChange={e => handleRoleChange(member.id, e.target.value)}
                  className="text-xs px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white/70 focus:outline-none"
                >
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                </select>
                <button
                  onClick={() => handleRemove(member.id)}
                  className="text-xs text-neon-red/60 hover:text-neon-red transition-colors p-1"
                  title="Remove member"
                >✕</button>
              </div>
            ) : (
              <span className={`text-xs px-2 py-1 rounded-full ${member.role === 'admin' ? 'bg-neon-purple/20 text-neon-purple' : 'bg-white/10 text-white/50'}`}>
                {member.role}
              </span>
            )}
          </div>
        ))}
      </div>

      {isAdmin && (
        <form onSubmit={handleAdd} className="flex gap-2 pt-2">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Add by email..."
            className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-neon-blue/50 transition-all"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple text-white text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? '...' : 'Add'}
          </button>
        </form>
      )}

      {error && <p className="text-xs text-neon-red">{error}</p>}
    </div>
  )
}
