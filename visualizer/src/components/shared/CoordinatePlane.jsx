const SIZE = 320
const PAD = 26

/**
 * Integer points and axis-aligned rectangles on a plane, optionally with a viewing wedge.
 * points: [{ x, y, label?, role? }], rects: [{ x1, y1, x2, y2, label?, role? }] (closed corners),
 * wedge: { cx, cy, startDeg, widthDeg, label? }. Roles: 'active', 'kept', 'excluded'.
 */
export default function CoordinatePlane({ title = 'Plane', points = [], rects = [], wedge = null }) {
  const xs = [...points.map(p => p.x), ...rects.flatMap(r => [r.x1, r.x2]), ...(wedge ? [wedge.cx] : [])]
  const ys = [...points.map(p => p.y), ...rects.flatMap(r => [r.y1, r.y2]), ...(wedge ? [wedge.cy] : [])]
  const minX = Math.min(0, ...xs), maxX = Math.max(1, ...xs)
  const minY = Math.min(0, ...ys), maxY = Math.max(1, ...ys)
  const span = Math.max(maxX - minX, maxY - minY, 1)
  const scale = (SIZE - PAD * 2) / span
  const X = x => PAD + (x - minX) * scale
  const Y = y => SIZE - PAD - (y - minY) * scale
  const wedgePath = () => {
    const r = Math.max(span, 1) * 0.9 * scale
    const toRad = d => (d * Math.PI) / 180
    const a = toRad(wedge.startDeg), b = toRad(wedge.startDeg + wedge.widthDeg)
    const cx = X(wedge.cx), cy = Y(wedge.cy)
    const large = wedge.widthDeg > 180 ? 1 : 0
    return `M ${cx} ${cy} L ${cx + r * Math.cos(a)} ${cy - r * Math.sin(a)} A ${r} ${r} 0 ${large} 0 ${cx + r * Math.cos(b)} ${cy - r * Math.sin(b)} Z`
  }
  return <section className="coordinate-plane" aria-label={title}>
    <h3>{title}</h3>
    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={`${title}: ${points.length} points, ${rects.length} rectangles`}
      style={{ maxWidth: '100%', height: 'auto', background: 'var(--surface, transparent)' }}>
      <line x1={PAD} x2={SIZE - PAD} y1={Y(0)} y2={Y(0)} stroke="currentColor" opacity="0.25" />
      <line x1={X(0)} x2={X(0)} y1={PAD} y2={SIZE - PAD} stroke="currentColor" opacity="0.25" />
      {wedge && <path d={wedgePath()} fill="#0ea5e9" fillOpacity="0.12" stroke="#0ea5e9" strokeDasharray="4 3" />}
      {rects.map((r, i) => <g key={`r${i}`} data-role={r.role ?? ''}>
        <rect x={Math.min(X(r.x1), X(r.x2))} y={Math.min(Y(r.y1), Y(r.y2))} width={Math.abs(X(r.x2) - X(r.x1))} height={Math.abs(Y(r.y2) - Y(r.y1))}
          fill={r.role === 'active' ? '#f59e0b' : '#0ea5e9'} fillOpacity="0.15" stroke={r.role === 'active' ? '#b45309' : '#0369a1'} strokeWidth="2" />
        {r.label && <text x={X(r.x1) + 4} y={Y(r.y2) + 14} fontSize="11">{r.label}</text>}
      </g>)}
      {points.map((p, i) => <g key={`p${i}`} data-role={p.role ?? ''}>
        <circle cx={X(p.x)} cy={Y(p.y)} r={p.role === 'active' ? 7 : 5}
          fill={p.role === 'active' ? '#dc2626' : p.role === 'excluded' ? '#94a3b8' : '#2563eb'} />
        <text x={X(p.x) + 8} y={Y(p.y) - 6} fontSize="11">{p.label ?? `(${p.x}, ${p.y})`}</text>
      </g>)}
    </svg>
  </section>
}
