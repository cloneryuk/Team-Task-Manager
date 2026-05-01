import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, Plus, LogOut, Folder, FolderDot } from 'lucide-react'

export default function Sidebar({ projects = [], onNewProject, isOpen = true }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <aside
      className="h-full flex-shrink-0 border-zinc-800 bg-[#09090b] z-40 transition-all duration-300 ease-in-out"
      style={{
        width: isOpen ? '260px' : '0px',
        overflow: 'hidden',
        borderRightWidth: isOpen ? '1px' : '0px'
      }}
    >
      <div className="flex flex-col h-full" style={{ width: '260px' }}>
        <div className="p-5 border-b border-zinc-800">
          <h1 className="font-heading font-bold text-xl text-zinc-100 flex items-center gap-2">
            <LayoutDashboard size={20} className="text-zinc-400" />
            TaskFlow
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5 ml-7">Task Management</p>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${isActive ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
              }`
            }
          >
            <LayoutDashboard size={16} />
            Dashboard
          </NavLink>
          <div className="pt-6">
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Projects</span>
              <button
                onClick={onNewProject}
                className="w-6 h-6 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 flex items-center justify-center transition-all"
                title="New Project"
              >
                <Plus size={14} />
              </button>
            </div>

            {projects.map(project => (
              <NavLink
                key={project.id}
                to={`/projects/${project.id}`}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${isActive ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                  }`
                }
              >
                <Folder size={14} className="shrink-0" />
                <span className="truncate">{project.name}</span>
                <span className="ml-auto text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">{project.task_count}</span>
              </NavLink>
            ))}

            {projects.length === 0 && (
              <p className="px-3 py-2 text-xs text-zinc-500 italic">No projects yet</p>
            )}
          </div>
        </nav>
        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300 flex-shrink-0">
              {getInitials(user?.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-200 truncate">{user?.name}</p>
              <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-zinc-500 hover:text-zinc-300 transition-colors"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
