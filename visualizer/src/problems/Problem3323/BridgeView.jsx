import './BridgeView.css'

const W = 640
const PAD = 40
const ROW = 22

// Raw intervals sit in rows; the merged groups sit on one lane; a dashed bridge shows the candidate insertion.
export default function BridgeView({ run, step }) {
  if (!run || !step) return <section className="bridge-view"><p>Press Play to sort, merge and sweep the bridges.</p></section>

  const { sorted, k } = run
  const top = 26
  const groupY = top + sorted.length * ROW + 36
  const bridgeY = groupY + 46
  const height = bridgeY + 34
  const hi = Math.max(1, ...sorted.flat()) + 1
  const x = v => PAD + (v / hi) * (W - PAD * 2)
  const comps = step.components
  const inWindow = idx => step.i >= 0 && idx >= step.i && idx <= step.j
  const bridge = step.bridge
  const bridgeLength = bridge ? bridge[1] - bridge[0] : 0

  return (
    <section className="bridge-view" aria-label="Interval bridge sweep">
      <svg viewBox={`0 0 ${W} ${height}`} role="img" aria-label={`Intervals merge into ${comps.length} groups; k is ${k}`}>
        {sorted.map(([s, e], idx) => (
          <g key={`raw-${idx}`} className={step.cursor === idx ? 'bridge-view__raw bridge-view__raw--active' : 'bridge-view__raw'}>
            <line x1={x(s)} x2={x(e)} y1={top + idx * ROW} y2={top + idx * ROW} />
            <text x={x(s) - 4} y={top + idx * ROW + 4} textAnchor="end">{`[${s},${e}]`}</text>
          </g>
        ))}
        <text x={PAD} y={groupY - 26} className="bridge-view__label">Groups after merging (shared points join)</text>
        {comps.map(([s, e], idx) => (
          <g key={`group-${idx}`} className={inWindow(idx) ? 'bridge-view__group bridge-view__group--window' : 'bridge-view__group'}>
            <rect x={x(s)} y={groupY - 9} width={Math.max(4, x(e) - x(s))} height={18} rx={4} />
            <text x={(x(s) + x(e)) / 2} y={groupY + 4} textAnchor="middle">{`G${idx + 1}`}</text>
          </g>
        ))}
        {bridge && (
          <g className={step.rejected ? 'bridge-view__bridge bridge-view__bridge--rejected' : 'bridge-view__bridge'}>
            <line x1={x(bridge[0])} x2={x(bridge[1])} y1={bridgeY} y2={bridgeY} />
            <text x={(x(bridge[0]) + x(bridge[1])) / 2} y={bridgeY - 6} textAnchor="middle">
              {`length ${bridgeLength}${step.rejected ? ` > k=${k}` : ` <= k=${k}`}`}
            </text>
          </g>
        )}
        <text x={PAD} y={bridgeY + 24} className="bridge-view__label">Candidate inserted bridge</text>
      </svg>
      <dl className="bridge-view__stats">
        <div><dt>k</dt><dd>{k}</dd></div>
        <div><dt>Groups</dt><dd>{comps.length}</dd></div>
        <div><dt>Window</dt><dd>{step.i >= 0 ? `G${step.i + 1} to G${Math.max(step.i, step.j) + 1}` : 'none'}</dd></div>
        <div><dt>Best saved</dt><dd>{step.best}</dd></div>
        <div><dt>Answer</dt><dd>{step.groups ?? 'pending'}</dd></div>
      </dl>
    </section>
  )
}
