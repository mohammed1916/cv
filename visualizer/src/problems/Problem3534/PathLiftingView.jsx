import GraphTraversalView from '../../components/shared/GraphTraversalView'
import RecordStateTable from '../../components/shared/RecordStateTable'

const CELL = 52
const ARC_ROOM = 92
const BOX = 44

function Arc({ from, to, color, dashed, label, row = 0 }) {
  const x1 = from * CELL + CELL / 2
  const x2 = to * CELL + CELL / 2
  if (from === to) {
    return <g data-arc={`${from}-${to}`}>
      <circle cx={x1} cy={ARC_ROOM - 8} r="8" fill="none" stroke={color} strokeWidth="2" strokeDasharray={dashed ? '5 4' : undefined} />
      <text x={x1} y={ARC_ROOM - 20} textAnchor="middle" fontSize="11" fontWeight="700" fill={color}>{label}</text>
    </g>
  }
  const lift = Math.min(ARC_ROOM - 18, 22 + Math.abs(to - from) * 12 + row * 6)
  return <g data-arc={`${from}-${to}`}>
    <path d={`M ${x1} ${ARC_ROOM} Q ${(x1 + x2) / 2} ${ARC_ROOM - lift * 2 + 8} ${x2} ${ARC_ROOM}`} fill="none" stroke={color} strokeWidth="2" strokeDasharray={dashed ? '5 4' : undefined} />
    <text x={(x1 + x2) / 2} y={Math.max(11, ARC_ROOM - lift - 2)} textAnchor="middle" fontSize="11" fontWeight="700" fill={color}>{label}</text>
  </g>
}

// Nodes in sorted order: the window that defines a hop, and the hops a query takes on its way to b.
function SortedLine({ step }) {
  const { sorted, order, l, r, a, b, trial, jumps } = step
  const n = sorted.length
  const width = n * CELL
  const height = ARC_ROOM + BOX + 34
  const trialColor = trial?.take ? 'var(--success)' : 'var(--error)'
  return <div style={{ overflowX: 'auto' }}>
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Nodes sorted by value" style={{ display: 'block' }}>
      {l !== null && <rect data-window={`${l}-${r}`} x={l * CELL + 1} y={ARC_ROOM - 2} width={(r - l + 1) * CELL - 2} height={BOX + 8} rx="8" fill="var(--primary)" opacity="0.18" stroke="var(--primary)" />}
      {jumps.map((jump, i) => <Arc key={i} from={jump.from} to={jump.to} color="var(--primary)" label={`+${2 ** jump.k}`} />)}
      {trial && <Arc from={trial.from} to={trial.to} color={trialColor} dashed label={step.phase === 'lift' ? `${2 ** trial.k} hops` : `try ${2 ** trial.k}`} row={1} />}
      {sorted.map((value, p) => {
        const isA = a === p
        const isB = b === p
        const stroke = isA ? 'var(--primary)' : isB ? 'var(--success)' : 'var(--border)'
        return <g key={p} data-position={p}>
          <rect x={p * CELL + 4} y={ARC_ROOM + 2} width={BOX} height={BOX} rx="6" fill="var(--surface2)" stroke={stroke} strokeWidth={isA || isB ? 3 : 1} />
          <text x={p * CELL + CELL / 2} y={ARC_ROOM + 22} textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--text)">{value}</text>
          <text x={p * CELL + CELL / 2} y={ARC_ROOM + 38} textAnchor="middle" fontSize="10" fill="var(--text-muted)">node {order[p]}</text>
          <text x={p * CELL + CELL / 2} y={ARC_ROOM + BOX + 16} textAnchor="middle" fontSize="10" fill="var(--text-muted)">{p}</text>
          <text x={p * CELL + CELL / 2} y={ARC_ROOM + BOX + 30} textAnchor="middle" fontSize="11" fontWeight="700" fill={isA ? 'var(--primary)' : isB ? 'var(--success)' : 'var(--text)'}>
            {[l === p ? 'l' : null, r === p ? 'r' : null, isA ? 'a' : null, isB ? 'b' : null].filter(Boolean).join(' ')}
          </text>
        </g>
      })}
    </svg>
  </div>
}

function LiftTable({ step }) {
  const isSource = (k, p) => step.sources.some(s => s.k === k && s.p === p)
  const isCell = (k, p) => step.cell?.k === k && step.cell?.p === p
  const isTrial = (k, p) => step.phase !== 'lift' && step.trial && step.trial.k === k && step.trial.from === p
  const style = (k, p) => ({
    minWidth: 30, padding: '3px 6px', textAlign: 'center', border: '1px solid var(--border)', color: 'var(--text)',
    background: isCell(k, p) || isTrial(k, p) ? 'color-mix(in srgb, var(--primary) 28%, var(--surface2))' : isSource(k, p) ? 'color-mix(in srgb, var(--success) 26%, var(--surface2))' : 'var(--surface2)',
    fontWeight: isCell(k, p) || isTrial(k, p) ? 700 : 400,
  })
  return <div style={{ overflowX: 'auto', margin: '10px 0' }}>
    <table aria-label="Jump table" style={{ borderCollapse: 'collapse', fontSize: '.8rem' }}>
      <caption style={{ textAlign: 'left', fontWeight: 600, padding: '4px 0' }}>Jump table: where 2^k hops from position p land</caption>
      <thead><tr><th style={{ padding: '3px 6px' }} scope="col">hops \ p</th>{step.sorted.map((_, p) => <th key={p} scope="col" style={{ padding: '3px 6px' }}>{p}</th>)}</tr></thead>
      <tbody>{step.lift.map((row, k) => <tr key={k}>
        <th scope="row" style={{ padding: '3px 6px' }}>{2 ** k}</th>
        {row.map((value, p) => <td key={p} data-cell={`${k},${p}`} style={style(k, p)}>{value === null ? '·' : value}</td>)}
      </tr>)}</tbody>
    </table>
  </div>
}

export default function PathLiftingView({ run, step }) {
  const { nums, maxDiff, queries } = run.input
  const tags = Object.fromEntries(nums.map((value, node) => [node, `=${value}`]))
  const at = position => (position === null || position === undefined ? null : step.order[position])
  const graph = step.l !== null
    ? { current: at(step.l), neighbour: step.r === step.l ? null : at(step.r) }
    : step.trial && step.phase !== 'lift'
      ? { current: at(step.trial.from), neighbour: step.trial.to === step.trial.from ? null : at(step.trial.to) }
      : { current: at(step.a), neighbour: null }
  const endpoints = step.query === null ? [] : [...new Set(queries[step.query])]
  const landed = step.jumps.flatMap(jump => [at(jump.from), at(jump.to)])
  return <section aria-label="Graph, sorted hops and jump table" style={{ color: 'var(--text)' }}>
    <p style={{ margin: '0 0 6px' }}><strong>maxDiff = {maxDiff}</strong>{step.query !== null && <> · hops so far: <strong>{step.hops}</strong></>}</p>
    <SortedLine step={step} />
    <LiftTable step={step} />
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' }}>
      <div style={{ flex: '1 1 300px', minWidth: 0 }}>
        <GraphTraversalView title="The graph itself" n={nums.length} edges={step.edges} tags={tags} current={graph.current} neighbour={graph.neighbour}
          visited={landed} frontier={endpoints} showFrontier={false}
          legend={{ current: 'position in focus', neighbour: 'target of this hop', frontier: 'query endpoint', visited: 'landed on', done: 'unused' }} />
      </div>
      <div style={{ flex: '1 1 200px', minWidth: 0 }}>
        <RecordStateTable label="Queries" columns={['query', 'answer']} activeRow={step.query ?? -1}
          rows={queries.map(([u, v], i) => ({ query: `${u} to ${v}`, answer: step.answers[i] === null ? '·' : step.answers[i] }))} />
      </div>
    </div>
  </section>
}
