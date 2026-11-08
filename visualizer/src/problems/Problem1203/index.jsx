import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with an empty answer.' },
    { id: 'assign', label: 'Groups', description: 'Give ungrouped items private group ids.' },
    { id: 'graph', label: 'Edges', description: 'Build the item and group dependency graphs.' },
    { id: 'groups', label: 'Group order', description: 'Topologically sort the groups.' },
    { id: 'items', label: 'Item order', description: 'Topologically sort the items.' },
    { id: 'emit', label: 'Emit', description: 'Append items group by group.' },
    { id: 'fail', label: 'Cycle', description: 'A cycle means no valid order exists.' },
    { id: 'done', label: 'Complete', description: 'Report the answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n, m, group and before_items (JSON)',
  url: 'https://leetcode.com/problems/sort-items-by-groups-respecting-dependencies/',
  complexity: 'O(n + m + d) time for d dependencies, using two topological sorts. The visualization caps n at 8.',
  examples: [
    { label: 'Example 1', input: '{"n":8,"m":2,"group":[-1,-1,1,0,0,1,0,-1],"before_items":[[],[6],[5],[6],[3,6],[],[],[]]}' },
    { label: 'Cycle', input: '{"n":8,"m":2,"group":[-1,-1,1,0,0,1,0,-1],"before_items":[[],[6],[5],[6],[3],[],[4],[]]}' },
    { label: 'Single item, one group', input: '{\"n\":1,\"m\":1,\"group\":[0],\"before_items\":[[]]}' },
    { label: 'No group ids, chain of dependencies', input: '{\"n\":3,\"m\":1,\"group\":[-1,-1,-1],\"before_items\":[[],[0],[1]]}' },
    { label: 'Long run: eight items in a chain', input: '{\"n\":8,\"m\":8,\"group\":[0,1,2,3,4,5,6,7],\"before_items\":[[],[0],[1],[2],[3],[4],[5],[6]]}' },
  ],
}

export default function SortItemsByGroups() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Item groups" length={run.input.n} valueAt={i => run.groups[i]}
      active={step.item ?? -1} roleAt={i => (run.input.group[i] === -1 ? 'no group' : '')} />
    <IndexedSequence label="Answer so far" length={step.list.length} valueAt={i => step.list[i]} />
    <section aria-label="Prerequisite map" className="algorithm-sequence">
      <h3>Each item and the items it needs first (its prerequisites)</h3>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 4 }}>
        {run.input.before_items.map((list, item) => {
          const placed = step.list.includes(item)
          return <li key={item} data-state={placed ? 'processed' : 'pending'} style={{ padding: '4px 8px', border: '1px solid var(--border)', borderRadius: 6, background: placed ? 'var(--surface2)' : 'transparent', color: placed ? 'var(--text)' : 'var(--text-muted)' }}>
            <strong>{item}</strong> {'->'} {list.length ? list.join(', ') : 'no prerequisite'} <em>{placed ? 'placed' : 'waiting'}</em>
          </li>
        })}
      </ul>
    </section>
  </>} renderReasoning={() => <>
    <p>Items in one group must stay together, and every dependency must come before the item that needs it.</p>
    <p>Ordering the groups and then the items inside each group satisfies both rules. A cycle at either level means no valid order exists.</p>
  </>} />
}
