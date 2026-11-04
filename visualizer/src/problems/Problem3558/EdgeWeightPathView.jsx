import DPDependencyView from '../../components/shared/DPDependencyView'
import RootedTreeDiagram from '../../components/shared/RootedTreeDiagram'

const nodeChip = { display: 'inline-grid', placeItems: 'center', minWidth: 30, height: 30, borderRadius: '50%', border: '2px solid var(--primary)', background: 'var(--surface2)', color: 'var(--text)', fontWeight: 700, fontSize: 13 }
const heading = { margin: '0 0 6px', fontSize: '.95rem', color: 'var(--text)' }

function treeRoles(step) {
  const roles = {}
  for (const id of step.visited) roles[id] = 'new'
  for (const id of step.candidates) roles[id] = 'target'
  for (const id of step.path) roles[id] = 'best'
  if (step.neighbour !== null) roles[step.neighbour] = 'target'
  if (step.current !== null) roles[step.current] = 'focus'
  return roles
}

function Levels({ step }) {
  const levels = []
  for (const [id, depth] of Object.entries(step.depth)) (levels[depth] ??= []).push(id)
  return <section aria-label="Search state" style={{ display: 'grid', gap: 4, fontSize: 14, color: 'var(--text)' }}>
    <div><strong>Queue:</strong> {step.queue.length ? step.queue.join(' → ') : 'empty'}</div>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>{levels.map((ids, depth) => <span key={depth} data-depth={depth}><strong>Depth {depth}:</strong> {ids.join(', ')}</span>)}</div>
  </section>
}

// The chosen path as a chain. Each edge shows its choices; on the last frame, which edges are free and which is forced.
function PathLane({ step, done }) {
  const nodes = [...step.path].reverse()
  const complete = nodes[0] === 1
  return <section aria-label="Root to deepest path" style={{ color: 'var(--text)' }}>
    <h3 style={heading}>Path from {complete ? 'the root' : 'the deepest node, going up'}</h3>
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', rowGap: 10 }}>
      {nodes.map((id, index) => {
        const edge = index
        const last = complete && edge === nodes.length - 1
        const label = !complete ? '' : done ? (last ? 'forced' : 'free ×2') : edge < step.edgeAt ? 'counted' : edge === step.edgeAt ? 'now' : '1 or 2'
        return <span key={id} style={{ display: 'inline-flex', alignItems: 'center' }}>
          {index > 0 && <span data-edge={edge} data-label={label} style={{ display: 'inline-block', minWidth: 58, textAlign: 'center', fontSize: 12, borderBottom: `3px solid ${complete && edge <= step.edgeAt ? (done && last ? 'var(--success)' : 'var(--primary)') : 'var(--border)'}`, margin: '0 4px', paddingBottom: 2, color: 'var(--text-muted)' }}>{label || ' '}</span>}
          <span style={nodeChip}>{id}</span>
        </span>
      })}
    </div>
  </section>
}

function Weightings({ step }) {
  if (step.edgeAt === 0) return null
  if (!step.listing) return <p style={{ margin: 0, color: 'var(--text-muted)' }}>{`After ${step.edgeAt} edges there are 2^${step.edgeAt} weightings, too many to list. Half of them are odd.`}</p>
  const oddCount = step.listing.filter(item => item.odd).length
  const wanted = step.phase === 'done' ? true : step.filling === 'odd'
  return <section aria-label="All weightings so far" style={{ color: 'var(--text)' }}>
    <h3 style={heading}>Every weighting of the first {step.edgeAt} edge{step.edgeAt === 1 ? '' : 's'}: {oddCount} odd, {step.listing.length - oddCount} even</h3>
    <ul style={{ display: 'flex', flexWrap: 'wrap', gap: 6, listStyle: 'none', margin: 0, padding: 0 }}>
      {step.listing.map(item => {
        const lit = item.odd === wanted
        return <li key={item.weights.join('')} data-odd={item.odd} style={{ padding: '3px 8px', borderRadius: 6, fontSize: 13, background: 'var(--surface2)', border: `2px solid ${lit ? 'var(--primary)' : 'var(--border)'}`, color: lit ? 'var(--text)' : 'var(--text-muted)', fontWeight: lit ? 700 : 400 }}>
          {item.weights.join(' + ')} = {item.cost}
        </li>
      })}
    </ul>
  </section>
}

export default function EdgeWeightPathView({ run, step }) {
  return <section aria-label="Edge weight counting" style={{ display: 'grid', gap: 14 }}>
    <RootedTreeDiagram title="Tree rooted at node 1" root={run.tree} roles={treeRoles(step)} />
    <p style={{ margin: 0, display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 13, color: 'var(--text-muted)' }}>
      <span>green: visited</span><span>blue outline: visiting now</span><span>orange outline: just found, or also deepest</span><span>filled: on the path</span>
    </p>
    {step.path.length === 0 && <Levels step={step} />}
    {step.path.length > 0 && <PathLane step={step} done={step.phase === 'done'} />}
    {step.dp && <DPDependencyView title="Ways to reach each parity" {...step.dp} />}
    <Weightings step={step} />
    <output aria-label="Current counts" style={{ fontWeight: 600, color: 'var(--text)' }}>
      {step.even === null ? `Deepest so far: node ${step.deepest}, depth ${step.depth[step.deepest]}` : `even = ${step.even}, odd = ${step.odd}`}
    </output>
  </section>
}
