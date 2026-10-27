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
  ],
}

export default function SortItemsByGroups() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Item groups" length={run.input.n} valueAt={i => run.groups[i]}
      active={step.item ?? -1} roleAt={i => (run.input.group[i] === -1 ? 'no group' : '')} />
    <IndexedSequence label="Answer so far" length={step.list.length} valueAt={i => step.list[i]} />
  </>} renderReasoning={() => <>
    <p>Items in one group must stay together, and every dependency must come before the item that needs it.</p>
    <p>Ordering the groups and then the items inside each group satisfies both rules. A cycle at either level means no valid order exists.</p>
  </>} />
}
