import RecordStateTable from '../../components/shared/RecordStateTable'

const SIZE = 340
const PAD = 34

// The plane holds the geometry; the two tables hold the counts it is reduced to.
export default function ParallelSegmentsView({ run, step }) {
  const { points } = run.input
  const xs = points.map(p => p[0]), ys = points.map(p => p[1])
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys)
  const span = Math.max(maxX - minX, maxY - minY, 1)
  const scale = (SIZE - PAD * 2) / span
  const X = x => PAD + (x - minX) * scale
  const Y = y => SIZE - PAD - (y - minY) * scale
  const seg = s => ({ x1: X(points[s.a][0]), y1: Y(points[s.a][1]), x2: X(points[s.b][0]), y2: Y(points[s.b][1]) })
  // A segment's whole line, long enough to leave the viewport, so parallel rails read as rails.
  const rail = s => {
    const [px, py] = points[s.a]
    const length = Math.hypot(s.dx, s.dy)
    const far = (span * 3) / length
    return { x1: X(px - s.dx * far), y1: Y(py - s.dy * far), x2: X(px + s.dx * far), y2: Y(py + s.dy * far) }
  }
  const recorded = run.segments.slice(0, step.recorded)
  const shapePoints = shape => shape.map(i => `${X(points[i][0])},${Y(points[i][1])}`).join(' ')
  const lit = new Set([...step.active, ...step.earlier, ...(step.current ? [step.current] : [])].flatMap(s => [s.a, s.b]))
  return <section aria-label="Parallel segments" style={{ color: 'var(--text)', display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' }}>
    <figure style={{ margin: 0 }}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={`${points.length} points and ${step.recorded} recorded segments`} style={{ maxWidth: '100%', height: 'auto', background: 'var(--surface2)', borderRadius: 8 }}>
        {step.extended.map((s, i) => <line key={`rail${i}`} {...rail(s)} stroke="var(--text-muted)" strokeWidth="1" strokeDasharray="4 5" opacity="0.6" />)}
        {step.shapes.map((shape, i) => <polygon key={`shape${i}`} data-shape={shape.join('-')} points={shapePoints(shape)} fill="var(--warning)" fillOpacity="0.22" stroke="var(--warning)" strokeWidth="2" />)}
        {recorded.map((s, i) => <line key={`seg${i}`} {...seg(s)} stroke="var(--border)" strokeWidth="1" />)}
        {step.earlier.map((s, i) => <line key={`early${i}`} data-role="earlier" {...seg(s)} stroke="var(--info)" strokeWidth="4" strokeLinecap="round" />)}
        {step.active.map((s, i) => <line key={`act${i}`} data-role="active" {...seg(s)} stroke="var(--primary)" strokeWidth="4" strokeLinecap="round" />)}
        {step.current && <line data-role="current" {...seg(step.current)} stroke="var(--primary)" strokeWidth="4" strokeLinecap="round" />}
        {step.midpoint && <g data-role="midpoint">
          <circle cx={X(step.midpoint[0])} cy={Y(step.midpoint[1])} r="6" fill="var(--surface)" stroke="var(--warning)" strokeWidth="3" />
        </g>}
        {points.map(([x, y], i) => <g key={i} data-point={i}>
          <circle cx={X(x)} cy={Y(y)} r={lit.has(i) ? 7 : 5} fill={lit.has(i) ? 'var(--primary)' : 'var(--text-muted)'} />
          <text x={X(x) + 9} y={Y(y) - 8} fontSize="11" fill="var(--text)">P{i} ({x}, {y})</text>
        </g>)}
      </svg>
      <figcaption style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 12, marginTop: 6, color: 'var(--text-muted)' }}>
        <span><b style={{ color: 'var(--primary)' }}>▬</b> current</span>
        <span><b style={{ color: 'var(--info)' }}>▬</b> seen earlier</span>
        <span><b style={{ color: 'var(--warning)' }}>■</b> parallelogram</span>
      </figcaption>
    </figure>
    <div style={{ flex: '1 1 300px', minWidth: 260, display: 'grid', gap: 12 }}>
      <output aria-label="Running total" style={{ fontWeight: 700, fontSize: 18 }}>
        total = {step.total}{step.seen !== null ? ` · seen ${step.seen} × count ${step.count}` : ''}
      </output>
      <RecordStateTable label="Direction, then line" columns={['direction', 'line', 'segments']} rows={step.lineRows} activeRow={step.activeLineRow} />
      <RecordStateTable label="Midpoint, then direction" columns={['midpoint', 'direction', 'segments']} rows={step.midRows} activeRow={step.activeMidRow} />
    </div>
  </section>
}
