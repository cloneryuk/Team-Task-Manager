import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import TaskCard from './TaskCard'

const columnConfig = {
  todo: { label: 'To Do', icon: '📋', color: 'border-white/20' },
  in_progress: { label: 'In Progress', icon: '⚡', color: 'border-neon-blue/40' },
  review: { label: 'Review', icon: '👀', color: 'border-neon-orange/40' },
  done: { label: 'Done', icon: '✅', color: 'border-neon-green/40' }
}

export default function KanbanColumn({ status, tasks, onTaskClick }) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  const config = columnConfig[status] || columnConfig.todo
  const taskIds = tasks.map(t => t.id)

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col min-h-[400px] rounded-2xl border bg-white/[0.02] transition-all duration-200 ${config.color} ${isOver ? 'bg-white/[0.06] scale-[1.01]' : ''}`}
    >
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-lg">{config.icon}</span>
          <h3 className="font-heading font-semibold text-white text-sm">{config.label}</h3>
        </div>
        <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/10 text-white/60">
          {tasks.length}
        </span>
      </div>

      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[calc(100vh-280px)]">
          {tasks.length === 0 ? (
            <div className="flex items-center justify-center h-24 text-white/20 text-sm italic">
              No tasks
            </div>
          ) : (
            tasks.map(task => (
              <TaskCard key={task.id} task={task} onClick={onTaskClick} />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  )
}
