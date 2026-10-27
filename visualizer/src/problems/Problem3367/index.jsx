import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RootedTreeDiagram from '../../components/shared/RootedTreeDiagram'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'order', label: 'Root', description: 'Root the tree at node 0 and process children before parents.' },
    { id: 'combine', label: 'Combine', description: 'Choose which child edges to keep, up to k per node.' },
    { id: 'done', label: 'Complete', description: 'Report the best total weight from the root.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Weighted tree with n nodes and the limit k (JSON object)',
  url: 'https://leetcode.com/problems/maximize-sum-of-weights-after-edge-removals/',
  complexity: 'O(n log n) time for the sorts and O(n) space. The visualization caps the tree at 10 nodes.',
  examples: [
    { label: 'Path', input: '{"n":3,"edges":[[0,1,5],[1,2,3]],"k":1}' },
    { label: 'Star', input: '{"n":4,"edges":[[0,1,4],[0,2,9],[0,3,6]],"k":2}' },
  ],
}

export default function MaximizeSumOfWeights() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    if (step.current !== null) roles[step.current] = 'focus'
    return <>
      <RootedTreeDiagram title="Weighted tree, rooted at node 0" root={run.tree} roles={roles} />
      <output aria-label="Current totals">{step.current !== null
        ? `Node ${step.current}: free ${step.free[step.current]}, linked ${step.linked[step.current]}`
        : `Best total so far: ${step.free[0] ?? 'pending'}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>For each node, track two totals: the best subtree weight when the edge to its parent is removed, and when it is kept. Keeping the parent edge leaves one fewer slot for child edges.</p>
    <p>At each node, the child edges worth keeping are the largest positive gains, taken up to the slot limit.</p>
  </>} />
}
