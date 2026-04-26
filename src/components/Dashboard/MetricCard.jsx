/**
 * MetricCard — Card individual para métricas del dashboard
 */
export default function MetricCard({ label, value, suffix = '', icon, color = 'blue', subValue, className = '' }) {
  const colorClasses = {
    green: 'text-[#1D9E75]',
    red: 'text-[#E24B4A]',
    amber: 'text-[#BA7517]',
    blue: 'text-[#378ADD]',
    white: 'text-[#E8E9EC]',
  }

  return (
    <div className={`card animate-fade-in ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-[#6B7280] uppercase tracking-wider font-medium">{label}</span>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      <div className={`font-mono text-2xl font-bold ${colorClasses[color] || colorClasses.blue}`}>
        {typeof value === 'number' ? value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) : value}
        {suffix && <span className="text-sm ml-1 opacity-70">{suffix}</span>}
      </div>
      {subValue && (
        <div className="text-xs text-[#6B7280] mt-1">{subValue}</div>
      )}
    </div>
  )
}
