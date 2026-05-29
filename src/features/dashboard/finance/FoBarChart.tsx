import type { FoMonthlyLoan } from './foHelpers'

interface Props { data: FoMonthlyLoan[]; height?: number }

export default function FoBarChart({ data, height = 130 }: Props) {
  const w = 320
  if (data.length === 0) {
    return (
      <svg width="100%" viewBox={`0 0 ${w} ${height + 28}`} preserveAspectRatio="xMidYMid meet">
        <rect x="12" y="0" width={w - 24} height={height} rx="10" fill="#f8fafc" />
        <text x={w / 2} y={height / 2} textAnchor="middle" fill="#94a3b8" fontSize="11">No data yet</text>
      </svg>
    )
  }
  const max = Math.max(...data.map((d) => d.count), 1)
  const barW = Math.floor((w - 24) / data.length) - 4
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${height + 28}`} preserveAspectRatio="xMidYMid meet">
      {data.map((d, i) => {
        const bh = Math.max(3, (d.count / max) * height)
        const x = 12 + i * ((w - 24) / data.length)
        const y = height - bh
        return (
          <g key={d.month}>
            <rect x={x} y={y} width={barW} height={bh} rx="3" fill="#3b82f6" opacity="0.85" />
            <text x={x + barW / 2} y={height + 14} textAnchor="middle" fill="#9ca3af" fontSize="9">{d.month}</text>
            <text x={x + barW / 2} y={y - 4} textAnchor="middle" fill="#6b7280" fontSize="8">{d.count}</text>
          </g>
        )
      })}
    </svg>
  )
}
