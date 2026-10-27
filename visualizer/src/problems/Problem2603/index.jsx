import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Neighbors', description: 'Build the neighbor set of each node.' },
    { id: 'leaves', label: 'Leaves', description: 'Queue leaves that have no coin.' },
    { id: 'prune', label: 'Prune', description: 'Remove a coinless leaf and its edge.' },
    { id: 'layer', label: 'Layers', description: 'Remove two more layers of leaves.' },
    { id: 'count', label: 'Count', description: 'Count the nodes that remain.' },
    { id: 'done', label: 'Complete', description: 'Report twice the remaining edges.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with coins (0 or 1 per node) and edges (JSON)',
  url: 'https://leetcode.com/problems/collect-coins-in-a-tree/',
  complexity: 'O(n) time. The visualization caps the tree at 8 nodes.',
  examples: [
    { label: 'Path with coins at both ends', input: '{"coins":[1,0,0,0,0,1],"edges":[[0,1],[1,2],[2,3],[3,4],[4,5]]}' },
    { label: 'Star', input: '{"coins":[0,0,1,0,0],"edges":[[0,1],[1,2],[1,3],[3,4]]}' },
  ],
}

export default function CollectCoins() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Coins by node" length={run.input.coins.length} valueAt={i => run.input.coins[i]}
      active={step.current} roleAt={i => (step.alive[i] ? '' : 'removed')} />
    <output aria-label="Edges">{`Edges: ${run.input.edges.map(([a, b]) => `${a}-${b}`).join(' ')}`}</output>
  </>} renderReasoning={() => <>
    <p>A walk that returns to its start can collect every coin within distance two of each stop. Trim the tree first: coinless leaves go, and then two more layers go, because a collector two steps away from a leaf can still reach it.</p>
    <p>What remains is a tree that must be walked out and back, so each remaining edge costs two steps.</p>
  </>} />
}
