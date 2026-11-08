import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RootedTreeDiagram from '../../components/shared/RootedTreeDiagram'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'root', label: 'Root', description: 'Root the tree and record its order.' },
    { id: 'trip', label: 'Trip', description: 'Count the nodes a trip uses.' },
    { id: 'dp', label: 'Tree DP', description: 'Compare keeping and halving each node, children first.' },
    { id: 'done', label: 'Result', description: 'Report the minimum total price.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n, edges, price (even, 2 to 20) and trips [s,t]',
  url: 'https://leetcode.com/problems/minimize-the-total-price-of-the-trips/',
  complexity: 'O(n * trips) time for path counting plus O(n) tree DP. The visualization caps n at 8.',
  examples: [
    { label: 'Example', input: '{"n":4,"edges":[[0,1],[1,2],[1,3]],"price":[2,2,10,6],"trips":[[0,3],[2,1],[2,3]]}' },
    { label: 'Pair', input: '{"n":2,"edges":[[0,1]],"price":[2,4],"trips":[[0,1]]}' },
    { label: 'Trip from a node to itself', input: '{"n":3,"edges":[[0,1],[1,2]],"price":[4,4,4],"trips":[[1,1]]}' },
    { label: 'Equal prices on a star', input: '{"n":4,"edges":[[0,1],[0,2],[0,3]],"price":[6,6,6,6],"trips":[[1,2],[2,3]]}' },
    { label: 'Largest tree: 8 nodes, prices 20', input: '{"n":8,"edges":[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7]],"price":[20,20,20,20,20,20,20,20],"trips":[[0,7],[7,0],[3,4],[2,6]]}' },
    { label: 'Long run: 8 nodes, mixed prices', input: '{"n":8,"edges":[[1,0],[2,1],[3,1],[4,2],[5,3],[6,4],[7,0]],"price":[14,4,10,8,16,2,6,10],"trips":[[7,5],[6,3],[4,0],[2,7]]}' },
  ],
}

export default function MinimizeTripPrice() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    if (step.node >= 0) roles[step.node] = 'focus'
    step.path.forEach(v => { roles[v] = 'target' })
    return <>
      <RootedTreeDiagram root={run.root} roles={roles} title="Tree rooted at 0" />
      <output aria-label="Tree DP">{step.keep === null ? `Trip path: ${step.path.join(' ') || '(none)'}` : `Node ${step.node}: keep ${step.keep}, halve ${step.halve}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Each node’s total use is the number of trips passing through it. Halving a node saves half of that cost on every trip.</p>
    <p>Because halved nodes cannot be adjacent, the tree DP keeps two values per node: the best cost when it is kept, and the best cost when it is halved.</p>
  </>} />
}
