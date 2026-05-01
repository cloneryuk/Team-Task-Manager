import { useEffect, useRef } from 'react'

export default function StatCard({ label, value, icon: Icon, delay = 0 }) {
  const valueRef = useRef(null)

  useEffect(() => {
    if (!valueRef.current) return
    const target = parseInt(value) || 0
    let current = 0
    const duration = 600
    const step = Math.max(1, Math.ceil(target / (duration / 16)))
    const timer = setInterval(() => {
      current = Math.min(current + step, target)
      if (valueRef.current) valueRef.current.textContent = current
      if (current >= target) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [value])

  return (
    <div 
      className="flex items-center gap-3 px-4 py-3 bg-[#18181b] border border-[#27272a] rounded-lg shadow-sm"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-center w-8 h-8 rounded-md bg-[#27272a] text-zinc-400">
        {Icon && <Icon size={16} />}
      </div>
      <div className="flex flex-col">
        <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-0.5">{label}</p>
        <p ref={valueRef} className="text-xl font-bold text-zinc-100 leading-none">0</p>
      </div>
    </div>
  )
}
