import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import ProjectModal from './ProjectModal'
import Toast from './Toast'
import api from '../api/axios'
import { Menu } from 'lucide-react'

export default function Layout({ children }) {
  const [projects, setProjects] = useState([])
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [toast, setToast] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects')
      setProjects(res.data.projects)
    } catch (err) {
      console.error('Failed to fetch projects:', err)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const handleCreateProject = async (data) => {
    const res = await api.post('/projects', data)
    setProjects([res.data.project, ...projects])
    setToast({ message: 'Project created successfully!', type: 'success' })
  }

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  return (
    <div className="flex h-screen w-screen bg-[#09090b] overflow-hidden">
      <Sidebar
        projects={projects}
        onNewProject={() => setShowProjectModal(true)}
        isOpen={isSidebarOpen}
      />

      {/* Main content area */}
      <main className="flex-1 h-full overflow-y-auto overflow-x-hidden">
        <div className="p-6 w-full relative">
          <button
            onClick={toggleSidebar}
            className="mb-4 flex items-center justify-center w-10 h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
            title="Toggle Sidebar"
          >
            <Menu size={20} />
          </button>

          {typeof children === 'function'
            ? children({ projects, refreshProjects: fetchProjects })
            : children
          }
        </div>
      </main>
      {showProjectModal && (
        <ProjectModal
          onClose={() => setShowProjectModal(false)}
          onSubmit={handleCreateProject}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
