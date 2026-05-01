import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export default function TaskCard({ task, onClick }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { task }
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  const priorityConfig = {
    critical: { class: 'priority-critical', label: '🔴 Critical' },
    high: { class: 'priority-high', label: '🟠 High' },
    medium: { class: 'priority-medium', label: '🔵 Medium' },
    low: { class: 'priority-low', label: '🟢 Low' }
  }

  const p = priorityConfig[task.priority] || priorityConfig.medium

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done'

  const formatDate = (dateStr) => {
    if (!dateStr) return null
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick?.(task)}
      className="glass-sm p-4 cursor-grab active:cursor-grabbing hover:bg-white/8 transition-all duration-200 hover:scale-[1.02] group"
    >
      {/* Priority badge */}
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.class}`}>
          {p.label}
        </span>
        {isOverdue && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-neon-red/20 text-neon-red border border-neon-red/30 font-medium">
            Overdue
          </span>
        )}
      </div>

      <h4 className="text-sm font-semibold text-white mb-2 line-clamp-2">{task.title}</h4>
      {task.description && (
        <p className="text-xs text-white/40 mb-3 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center justify-between mt-auto">
        {task.assigned_to_name ? (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center text-[10px] font-bold text-white">
              {getInitials(task.assigned_to_name)}
            </div>
            <span className="text-xs text-white/50">{task.assigned_to_name.split(' ')[0]}</span>
          </div>
        ) : (
          <span className="text-xs text-white/30 italic">Unassigned</span>
        )}
        {task.due_date && (
          <span className={`text-xs ${isOverdue ? 'text-neon-red' : 'text-white/40'}`}>
            📅 {formatDate(task.due_date)}
          </span>
        )}
      </div>
    </div>
  )
}
