const SIZE = 360
const C = SIZE / 2
const R = 136
const INNER = 92

const angleOf = (i, n) => -Math.PI / 2 + (2 * Math.PI * i) / n
const at = (radius, i, n) => [C + radius * Math.cos(angleOf(i, n)), C + radius * Math.sin(angleOf(i, n))]

function travelPath(from, jump, rest, n) {
  if (rest === 0) return null
  const [x1, y1] = at(INNER, from, n)
  const to = jump > 0 ? from + rest : from - rest
  const [x2, y2] = at(INNER, to, n)
  const large = rest * 2 > n ? 1 : 0
  const sweep = jump > 0 ? 1 : 0
  return `M ${x1} ${y1} A ${INNER} ${INNER} 0 ${large} ${sweep} ${x2} ${y2}`
}

// The array as a real ring: a seam marks where the last index meets the first, and an arc shows the trip of this call.
export default function CircularGeneratorView({ run, step }) {
  const { arr, steps } = run.input
  const n = arr.length
  const moving = step.from !== null && step.jump !== null
  const arc = moving ? travelPath(step.from, step.jump, step.rest, n) : null
  const fullLapsOnly = moving && step.rest === 0 && step.jump !== 0
  const nodeRadius = Math.min(21, (Math.PI * R) / n - 2)
  const fontFor = value => (String(value).length > 3 || n > 16 ? 10 : 14)
  const seamAngle = n > 1 ? angleOf(n - 0.5, n) : null
  const calls = [{ label: 'gen.next()', call: 0 }, ...steps.map((jump, i) => ({ label: `gen.next(${jump})`, call: i + 1 }))]
  return <section aria-label="Circular generator" style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'flex-start', color: 'var(--text)' }}>
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width={SIZE} height={SIZE} role="img" style={{ maxWidth: '100%', height: 'auto' }}
      aria-label={`Ring of ${n} values; current index ${step.index}`}>
      <defs>
        <marker id="ring-2757-head" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 Z" fill="var(--primary)" />
        </marker>
      </defs>
      <circle cx={C} cy={C} r={R} fill="none" stroke="var(--border)" strokeWidth="2" />
      {seamAngle !== null && <g>
        <line x1={C + (R - 26) * Math.cos(seamAngle)} y1={C + (R - 26) * Math.sin(seamAngle)} x2={C + (R + 26) * Math.cos(seamAngle)} y2={C + (R + 26) * Math.sin(seamAngle)}
          stroke={step.wraps > 0 && step.phase !== 'yield' ? 'var(--warning)' : 'var(--text-muted)'} strokeWidth={step.wraps > 0 && step.phase !== 'yield' ? 4 : 2} strokeDasharray="5 4" />
        <text x={C + (R + 16) * Math.cos(seamAngle) + 14} y={C + (R + 16) * Math.sin(seamAngle) - 14} textAnchor="middle" fontSize="11" fill="var(--text-muted)">seam</text>
      </g>}
      {arc && <path d={arc} fill="none" stroke="var(--primary)" strokeWidth="4" markerEnd="url(#ring-2757-head)" />}
      {fullLapsOnly && <circle cx={C} cy={C} r={INNER} fill="none" stroke="var(--primary)" strokeWidth="3" strokeDasharray="8 5" />}
      {arr.map((value, i) => {
        const [x, y] = at(R, i, n)
        const [lx, ly] = at(R + 31, i, n)
        const current = i === step.index
        const origin = moving && i === step.from && !current
        return <g key={i} data-index={i} data-role={current ? 'current' : origin ? 'origin' : ''}>
          <circle cx={x} cy={y} r={nodeRadius} fill={current ? 'var(--primary)' : 'var(--surface2)'} stroke={origin ? 'var(--primary)' : 'var(--border)'} strokeWidth={origin ? 3 : 1.5} strokeDasharray={origin ? '4 3' : undefined} />
          <text x={x} y={y + 5} textAnchor="middle" fontSize={fontFor(value)} fontWeight="700" fill={current ? 'var(--text-inverse)' : 'var(--text)'}>{value}</text>
          <text x={lx} y={ly + 4} textAnchor="middle" fontSize="11" fill="var(--text-muted)">[{i}]</text>
        </g>
      })}
      <text x={C} y={C - 16} textAnchor="middle" fontSize="13" fill="var(--text-muted)">{moving ? `jump ${step.jump}` : 'index'}</text>
      <text x={C} y={C + 8} textAnchor="middle" fontSize="20" fontWeight="700" fill="var(--text)">{moving ? `${step.from} → ${step.index}` : step.index}</text>
      {moving && <text x={C} y={C + 30} textAnchor="middle" fontSize="12" fill="var(--text-muted)">{step.laps ? `${step.laps} lap${step.laps === 1 ? '' : 's'} + ${step.rest}` : `${step.rest} step${step.rest === 1 ? '' : 's'}`}</text>}
    </svg>
    <div style={{ flex: '1 1 220px', minWidth: 200 }}>
      {moving && <p style={{ fontFamily: 'var(--font-mono, monospace)', margin: '0 0 12px' }}>({step.from} + {step.jump < 0 ? `(${step.jump})` : step.jump}) mod {n} = {step.index}</p>}
      <table aria-label="Calls and yielded values" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead><tr><th scope="col" style={{ textAlign: 'left', padding: '3px 8px' }}>call</th><th scope="col" style={{ textAlign: 'left', padding: '3px 8px' }}>yields</th></tr></thead>
        <tbody>{calls.map(({ label, call }) => {
          const active = call === step.call && step.phase !== 'create' && step.phase !== 'done'
          return <tr key={call} data-call={call} style={{ background: active ? 'var(--surface2)' : 'transparent', fontWeight: active ? 700 : 400 }}>
            <td style={{ padding: '3px 8px', fontFamily: 'var(--font-mono, monospace)' }}>{label}</td>
            <td style={{ padding: '3px 8px' }}>{call < step.output.length ? step.output[call] : '·'}</td>
          </tr>
        })}</tbody>
      </table>
    </div>
  </section>
}
