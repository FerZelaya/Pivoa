interface DonutSegment {
  value: number
  color: string
}

interface DonutChartProps {
  segments: DonutSegment[]
  label: string
  value: string
  className?: string
}

const RADIUS = 62
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function DonutChart({ segments, label, value, className = 'w-36 h-36' }: DonutChartProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0)
  let offset = 0

  return (
    <div className="relative flex items-center justify-center">
      <svg className={`${className} -rotate-90`} viewBox="0 0 160 160">
        <circle cx="80" cy="80" fill="transparent" r={RADIUS} stroke="#e5eeff" strokeWidth="16" />
        {total > 0 &&
          segments.map((segment, i) => {
            const length = (segment.value / total) * CIRCUMFERENCE
            const circle = (
              <circle
                key={i}
                cx="80"
                cy="80"
                fill="transparent"
                r={RADIUS}
                stroke={segment.color}
                strokeWidth="16"
                strokeDasharray={`${Math.max(0, length - 1.5)} ${CIRCUMFERENCE}`}
                strokeDashoffset={-offset}
                className="transition-all duration-700"
              />
            )
            offset += length
            return circle
          })}
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">{label}</span>
        <span className="font-label-numeric-md text-label-numeric-md font-bold text-on-surface">{value}</span>
      </div>
    </div>
  )
}
