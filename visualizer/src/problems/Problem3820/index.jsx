import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: 3820,
  phases: [
    { id: 'distances', label: 'Distances', description: 'One breadth-first search from each target node.' },
    { id: 'check', label: 'Check', description: 'Sort the three distances and test the squared sum.' },
    { id: 'done', label: 'Result', description: 'Report how many nodes passed.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n, edges (pairs), and three distinct targets x, y, z',
  url: 'https://leetcode.com/problems/pythagorean-distance-nodes-in-a-tree/',
  complexity: 'O(n) time: three breadth-first searches and one pass over the nodes.',
  examples: [
    { label: 'Star', input: '{"n":5,"edges":[[0,1],[0,2],[0,3],[3,4]],"x":1,"y":2,"z":4}' },
    { label: 'Path', input: '{"n":5,"edges":[[4,0],[0,1],[1,2],[2,3]],"x":4,"y":3,"z":2}' },
  ],
}

const GAP_X = 70, GAP_Y = 80, PAD = 36

// Layered drawing of the tree rooted at node 0; each depth is one row.
function layout(n, edges) {
  const adj = Array.from({ length: n }, () => [])
  for (const [a, b] of edges) { adj[a].push(b); adj[b].push(a) }
  const depth = Array(n).fill(-1), parent = Array(n).fill(-1)
  depth[0] = 0
  const order = [0]
  for (let k = 0; k < order.length; k++) {
    const v = order[k]
    for (const w of adj[v]) if (depth[w] < 0) { depth[w] = depth[v] + 1; parent[w] = v; order.push(w) }
  }
  const rows = []
  order.forEach(v => { (rows[depth[v]] ??= []).push(v) })
  const pos = new Map()
  rows.forEach(row => row.forEach((v, i) => pos.set(v, { x: PAD + (i + 0.5) * GAP_X, y: PAD + depth[v] * GAP_Y })))
  return { pos, parent, width: PAD * 2 + Math.max(...rows.map(r => r.length)) * GAP_X, height: PAD * 2 + (rows.length - 1) * GAP_Y }
}

// Tree with the three targets labelled X, Y, Z, the node under review, and the nodes that already passed.
function TreeTargets({ n, edges, x, y, z, current, special }) {
  const { pos, parent, width, height } = layout(n, edges)
  const labels = new Map([[x, 'X'], [y, 'Y'], [z, 'Z']])
  return <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} role="img" aria-label={`Tree of ${n} nodes with targets X ${x}, Y ${y}, Z ${z}`}>
    {Array.from({ length: n }, (_, v) => v).filter(v => parent[v] >= 0).map(v => {
      const a = pos.get(parent[v]), b = pos.get(v)
      return <line key={v} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--text-muted)" strokeWidth="1.5" />
    })}
    {Array.from({ length: n }, (_, v) => v).map(v => {
      const p = pos.get(v)
      const isTarget = labels.has(v)
      return <g key={v}>
        <circle cx={p.x} cy={p.y} r="18" fill={special.includes(v) ? 'var(--primary)' : 'var(--surface2)'}
          stroke={current === v ? 'var(--text)' : 'var(--text-muted)'} strokeWidth={current === v ? 4 : isTarget ? 2.5 : 1} />
        <text x={p.x} y={p.y + 5} textAnchor="middle" fontSize="12" fill={special.includes(v) ? 'var(--surface)' : 'var(--text)'}>{isTarget ? labels.get(v) : v}</text>
      </g>
    })}
  </svg>
}

export default function PythagoreanDistanceNodes() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const special = step.table.filter(row => row.special).map(row => row.u)
    const sorted = step.dist
    return <>
      <p className="tree-legend">Targets are marked X, Y and Z. A filled node is special; a ring marks the node being checked.</p>
      <TreeTargets n={run.input.n} edges={run.input.edges} x={run.input.x} y={run.input.y} z={run.input.z} current={step.at} special={special} />
      {sorted && <output aria-label="Sorted distances">{`Node ${step.at}: sorted distances ${sorted[0]}, ${sorted[1]}, ${sorted[2]} → ${sorted[0]}² + ${sorted[1]}² ${step.special ? '=' : '≠'} ${sorted[2]}²`}</output>}
      <table aria-label="Distances per node">
        <thead><tr><th>node</th><th>to x, y, z</th><th>sorted check</th></tr></thead>
        <tbody>{step.table.map(row => <tr key={row.u} data-special={row.special ? 'yes' : undefined} data-current={step.at === row.u ? 'yes' : undefined}>
          <td>{row.u}</td><td>{row.distances.join(', ')}</td><td>{row.special ? 'special' : 'no'}</td></tr>)}</tbody>
      </table>
      <output aria-label="Count so far">{`special so far: ${step.count}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Each target contributes one breadth-first search, which gives the exact distance from every node to that target.</p>
    <p>Sorting the three distances puts the candidate legs first and the candidate hypotenuse last, so one squared comparison decides each node. A zero distance is allowed.</p>
  </>} />
}
