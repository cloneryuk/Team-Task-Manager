import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import StatCard from '../components/StatCard'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { ClipboardList, Zap, CheckCircle2, AlertTriangle, Edit2, PartyPopper } from 'lucide-react'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/dashboard')
      setData(res.data)
    } catch (err) {
      console.error('Dashboard error:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const statusLabel = {
    todo: 'To Do',
    in_progress: 'In Progress',
    review: 'Review',
    done: 'Done'
  }

  const priorityConfig = {
    critical: 'priority-critical',
    high: 'priority-high',
    medium: 'priority-medium',
    low: 'priority-low'
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-6 h-6 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    )
  }

  const stats = data?.stats || {}

  return (
    <Layout>
      <div className="w-full animate-fade-in max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading font-semibold text-2xl text-zinc-100">
              Overview
            </h1>
            <p className="text-sm text-zinc-500 mt-1">Focus on your tasks across all projects</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <StatCard label="Total Tasks" value={stats.total || 0} icon={ClipboardList} delay={0} />
            <StatCard label="In Progress" value={stats.in_progress || 0} icon={Zap} delay={100} />
            <StatCard label="Completed" value={stats.done || 0} icon={CheckCircle2} delay={200} />
            <StatCard label="Overdue" value={stats.overdue || 0} icon={AlertTriangle} delay={300} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass lg:col-span-2 flex flex-col h-[calc(100vh-180px)]">
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="font-heading font-semibold text-zinc-100">My Active Tasks</h3>
              <span className="text-xs font-medium px-2 py-1 bg-zinc-800 text-zinc-400 rounded">
                {data?.myTasks?.length || 0} tasks
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {data?.myTasks?.length > 0 ? data.myTasks.map(task => {
                const isDone = task.status === 'done';
                return (
                  <div
                    key={task.id}
                    className={`group flex items-center gap-4 p-3 rounded-lg hover:bg-zinc-800/50 transition-all cursor-pointer border border-transparent hover:border-zinc-800 ${isDone ? 'opacity-50' : ''}`}
                  >
                    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-medium ${priorityConfig[task.priority]}`}>
                      {task.priority}
                    </span>

                    <div className="flex-1 min-w-0 flex items-center gap-3">
                      <p className={`text-sm font-medium truncate ${isDone ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                        {task.title}
                      </p>
                      <span className="text-xs text-zinc-600 truncate border-l border-zinc-800 pl-3">
                        {task.project_name}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded status-${task.status}`}>
                        {statusLabel[task.status]}
                      </span>
                      {task.due_date && (
                        <span className={`text-xs w-16 text-right ${new Date(task.due_date) < new Date() && !isDone ? 'text-red-400' : 'text-zinc-500'}`}>
                          {formatDate(task.due_date)}
                        </span>
                      )}
                      <button className="text-zinc-500 hover:text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Edit2 size={14} />
                      </button>
                    </div>
                  </div>
                )
              }) : (
                <div className="h-full flex flex-col items-center justify-center text-zinc-500">
                  <PartyPopper size={32} className="mb-3 opacity-20" />
                  <p className="text-sm">No active tasks — you're all caught up!</p>
                </div>
              )}
            </div>
          </div>
          <div className="glass flex flex-col h-[calc(100vh-180px)]">
            <div className="p-5 border-b border-zinc-800">
              <h3 className="font-heading font-semibold text-zinc-100">Recent Activity</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {data?.recentTasks?.map(task => (
                <div key={task.id} className="flex flex-col gap-2 p-3 rounded-lg hover:bg-zinc-800/50 transition-all border border-transparent hover:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded status-${task.status}`}>
                      {statusLabel[task.status]}
                    </span>
                    <span className="text-[10px] text-zinc-500">{formatDate(task.updated_at)}</span>
                  </div>
                  <p className="text-sm text-zinc-300 truncate">{task.title}</p>
                  <p className="text-xs text-zinc-500 truncate">
                    {task.project_name} <span className="mx-1">·</span> {task.assigned_to_name || 'Unassigned'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
