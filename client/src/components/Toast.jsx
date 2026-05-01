import { useState, useEffect } from 'react'

export default function Toast({ message, type = 'success', onClose }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 300)
    }, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  const colors = {
    success: 'border-neon-green bg-neon-green/10 text-neon-green',
    error: 'border-neon-red bg-neon-red/10 text-neon-red',
    info: 'border-neon-blue bg-neon-blue/10 text-neon-blue'
  }

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ'
  }

  return (
    <div
      className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl border backdrop-blur-xl transition-all duration-300 ${colors[type]} ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
    >
      <span className="text-lg font-bold">{icons[type]}</span>
      <span className="text-sm font-medium">{message}</span>
      <button onClick={() => { setVisible(false); setTimeout(onClose, 300) }} className="ml-2 opacity-60 hover:opacity-100 transition-opacity">✕</button>
    </div>
  )
}
