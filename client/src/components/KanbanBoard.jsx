import { useState } from 'react'
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import KanbanColumn from './KanbanColumn'
import TaskCard from './TaskCard'
import api from '../api/axios'

const STATUSES = ['todo', 'in_progress', 'review', 'done']

export default function KanbanBoard({ tasks, projectId, onTaskUpdate, onTaskClick }) {
  const [activeTask, setActiveTask] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  // Group tasks by status
  const columns = {}
  STATUSES.forEach(s => { columns[s] = [] })
  tasks.forEach(t => {
    if (columns[t.status]) columns[t.status].push(t)
  })

  const findTaskById = (id) => tasks.find(t => t.id === id)
  const findContainer = (id) => {
    // Check if id is a column status
    if (STATUSES.includes(id)) return id
    // Otherwise find the task's status
    const task = findTaskById(id)
    return task?.status || null
  }

  const handleDragStart = (event) => {
    const task = findTaskById(event.active.id)
    setActiveTask(task || null)
  }

  const handleDragEnd = async (event) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const activeId = active.id
    const overId = over.id
    const task = findTaskById(activeId)
    if (!task) return

    // Determine the target status
    let targetStatus = null
    if (STATUSES.includes(overId)) {
      targetStatus = overId
    } else {
      const overTask = findTaskById(overId)
      targetStatus = overTask?.status || null
    }

    if (!targetStatus || targetStatus === task.status) return

    // Optimistic update
    const oldStatus = task.status
    onTaskUpdate(activeId, { status: targetStatus })

    try {
      await api.put(`/projects/${projectId}/tasks/${activeId}`, { status: targetStatus })
    } catch (err) {
      console.error('Failed to update task status:', err)
      onTaskUpdate(activeId, { status: oldStatus })
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATUSES.map(status => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={columns[status]}
            onTaskClick={onTaskClick}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="drag-overlay w-[280px]">
            <TaskCard task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
