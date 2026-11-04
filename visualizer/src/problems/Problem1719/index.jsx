import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RootedTreeDiagram from '../../components/shared/RootedTreeDiagram'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Pairs', description: 'Build the related-pairs graph.' },
    { id: 'group', label: 'Find related', description: 'Find values related to every other value in a group.' },
    { id: 'chain', label: 'Chain', description: 'Stack the fully related values as a chain.' },
    { id: 'split', label: 'Split', description: 'Solve each unrelated part separately.' },
    { id: 'zero', label: 'No tree', description: 'A group with no fully related value cannot form a tree.' },
    { id: 'done', label: 'Complete', description: 'Report the number of ways, capped at two.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with pairs of values, each [x, y] with x less than y (JSON)',
  url: 'https://leetcode.com/problems/number-of-ways-to-reconstruct-a-tree/',
  complexity: 'O(p + n^2) time for p pairs and n values, since each level scans its group. The visualization caps input at 8 values.',
  examples: [
    { label: 'One way', input: '{"pairs":[[1,2],[2,3]]}' },
    { label: 'Two ways', input: '{"pairs":[[1,2],[2,3],[1,3]]}' },
  ],
}

// Build the rooted tree from the parent links drawn so far. Each link is [child, parent], and the root has parent null.
function treeFrom(links) {
  const children = new Map()
  let root = null
  for (const [child, above] of links) {
    if (above === null) root = child
    else children.set(above, [...(children.get(above) ?? []), child])
  }
  if (root === null) return null
  const build = id => ({ id, children: (children.get(id) ?? []).map(build) })
  return build(root)
}

// Adjacency list: each value with every value it is paired with.
function relatedList(pairs) {
  const map = new Map()
  for (const [x, y] of pairs) {
    map.set(x, [...(map.get(x) ?? []), y].sort((a, b) => a - b))
    map.set(y, [...(map.get(y) ?? []), x].sort((a, b) => a - b))
  }
  return [...map.entries()].sort((a, b) => a[0] - b[0])
}

export default function ReconstructTree() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const tree = treeFrom(step.links)
    const roles = {}
    for (const id of step.universal ?? []) roles[id] = 'focus'
    return <>
      <output aria-label="Pairs" style={{ display: 'block', fontFamily: 'monospace', marginBottom: 8 }}>{`Pairs: ${run.input.pairs.map(([x, y]) => `${x}-${y}`).join(', ')}`}</output>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ margin: '0 0 4px', color: 'var(--text)' }}>Related values</h3>
          <table aria-label="Related values" style={{ borderCollapse: 'collapse', fontFamily: 'monospace' }}>
            <tbody>{relatedList(run.input.pairs).map(([value, others]) => <tr key={value} style={{ background: step.group?.includes(value) ? 'var(--surface2)' : undefined }}>
              <th scope="row" style={{ padding: '2px 8px', border: '1px solid var(--border)', color: 'var(--text)' }}>{value}</th>
              <td style={{ padding: '2px 8px', border: '1px solid var(--border)', color: 'var(--text)' }}>{others.join(', ')}</td>
            </tr>)}</tbody>
          </table>
        </div>
        <div style={{ minWidth: 220 }}>
          {tree ? <RootedTreeDiagram root={tree} roles={roles} title="Tree built so far" />
            : <p style={{ color: 'var(--text-muted, var(--text))' }}>No links yet. The first chain will become the top of the tree.</p>}
        </div>
      </div>
      <output aria-label="Current group" style={{ display: 'block', marginTop: 10 }}>{`Group: ${step.group?.join(', ') || 'none'}. ${step.message}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>In a rooted tree, a value related to every other value must lie on the path from the root, so those values form a chain at the top.</p>
    <p>Removing that chain leaves groups that are unrelated to one another, and each group is solved the same way. Two or more values in one chain means the chain could be ordered two ways.</p>
  </>} />
}
