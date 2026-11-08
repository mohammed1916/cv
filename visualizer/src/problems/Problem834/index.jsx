import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import RootedTreeDiagram from '../../components/shared/RootedTreeDiagram'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Root the tree', description: 'Choose node 0 as root and initialise sizes and sums.' },
    { id: 'up', label: 'Gather upward', description: 'Merge a child subtree into its parent.' },
    { id: 'root', label: 'Root is final', description: 'The root answer is complete after the upward pass.' },
    { id: 'down', label: 'Re-root downward', description: 'Derive a child answer from its parent answer.' },
    { id: 'done', label: 'Complete', description: 'Return all answers.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Object with n and edges (JSON)',
  url: 'https://leetcode.com/problems/sum-of-distances-in-tree/',
  complexity: 'O(n) time and space: two DFS passes over the n - 1 edges.',
  examples: [
    { label: 'Own case 1', input: '{"n":6,"edges":[[2,5],[2,4],[2,3],[0,2],[0,1]]}' },
    { label: 'Single node', input: '{"n":1,"edges":[]}' },
    { label: 'Two nodes', input: '{"n":2,"edges":[[1,0]]}' },
    { label: 'Symmetric path of five', input: '{"n":5,"edges":[[0,1],[1,2],[2,3],[3,4]]}' },
    { label: 'Star with three leaves', input: '{"n":4,"edges":[[0,1],[0,2],[0,3]]}' },
    { label: 'Longest path, 12 nodes', input: '{"n":12,"edges":[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11]]}' },
    { label: 'Long run: random tree of 12 nodes', input: '{"n":12,"edges":[[0,1],[1,2],[0,3],[3,4],[0,5],[1,6],[4,7],[6,8],[4,9],[2,10],[5,11]]}' },
  ],
}
export default function SumOfDistancesInTree() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    if (step.u >= 0) roles[step.u] = 'focus'
    if (step.v >= 0) roles[step.v] = 'target'
    return <>
      <RootedTreeDiagram title="Tree rooted at 0" root={run.root} roles={roles} />
      <IndexedSequence label="count: subtree size" length={run.input.n} active={step.v >= 0 ? step.v : step.u} valueAt={i => step.count[i]} />
      <IndexedSequence label={step.stage === 'up' ? 'res: distance sum inside subtree' : 'res: distance sum to all nodes'} length={run.input.n} active={step.v >= 0 ? step.v : step.u} valueAt={i => step.res[i]}
        roleAt={i => step.stage === 'down' && (i === 0 || step.phase === 'done' || step.res[i] !== 0) ? 'final' : ''} />
    </>
  }} renderReasoning={({ run, step }) => <>
    <p>Running a BFS from every node costs O(n^2). Instead, one rooted pass gives subtree sizes, and a second pass re-roots the answer along each edge.</p>
    <p>Moving the root across edge (u, v): nodes inside v's subtree get one step closer, all {run.input.n} minus those get one step farther.</p>
    {step.v >= 0 && <p>Current edge: {step.u} to {step.v}.</p>}
  </>} />
}
