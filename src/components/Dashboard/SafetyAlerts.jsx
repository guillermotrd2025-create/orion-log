/**
 * SafetyAlerts — Alertas de seguridad del dashboard
 */
export default function SafetyAlerts({ alertas }) {
  if (!alertas || alertas.length === 0) return null

  return (
    <div className="space-y-2 animate-fade-in">
      {alertas.map((alerta, i) => {
        const bgColor = alerta.color === 'red'
          ? 'bg-[#E24B4A1A] border-[#E24B4A33]'
          : alerta.color === 'amber'
            ? 'bg-[#BA75171A] border-[#BA751733]'
            : 'bg-[#378ADD1A] border-[#378ADD33]'

        const textColor = alerta.color === 'red'
          ? 'text-[#E24B4A]'
          : alerta.color === 'amber'
            ? 'text-[#BA7517]'
            : 'text-[#378ADD]'

        const pulseClass = alerta.tipo === 'CRITICAL' ? 'animate-pulse-glow' : ''

        return (
          <div
            key={i}
            className={`flex items-start gap-3 p-3 rounded-lg border ${bgColor} ${pulseClass}`}
          >
            <span className="text-lg flex-shrink-0 mt-0.5">{alerta.icono}</span>
            <span className={`text-sm font-medium ${textColor}`}>{alerta.mensaje}</span>
          </div>
        )
      })}
    </div>
  )
}
