import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RootedTreeDiagram from '../../components/shared/RootedTreeDiagram'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Build the tree and start at node 0.' },
    { id: 'visit', label: 'Visit', description: 'Enter a node with its ancestors on the stack.' },
    { id: 'scan', label: 'Scan ancestors', description: 'Check ancestors from nearest to farthest.' },
    { id: 'found', label: 'Found', description: 'A coprime ancestor is recorded.' },
    { id: 'none', label: 'None', description: 'No ancestor is coprime; record -1.' },
    { id: 'done', label: 'Result', description: 'Report every node’s answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (1-50) and edges (tree, n - 1 pairs)',
  url: 'https://leetcode.com/problems/tree-of-coprimes/',
  complexity: 'O(n * h) time for ancestor scans with a stack, O(n) space. The visualization caps n at 12.',
  examples: [
    { label: 'Own case 1', input: '{"nums":[2,3,3,2],"edges":[[1,3],[1,2],[0,1]]}' },
    { label: 'Own case 2', input: '{"nums":[15,6,3,2,10,6,5],"edges":[[2,6],[2,5],[1,4],[1,3],[0,2],[0,1]]}' },
  { label: 'Single node', input: "{\"nums\":[7],\"edges\":[]}" },
  { label: 'Equal values on a path', input: "{\"nums\":[6,6,6],\"edges\":[[0,1],[1,2]]}" },
  { label: 'Largest values on a path', input: "{\"nums\":[50,1,50,1,50,1,50,1,50,1,50,1],\"edges\":[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11]]}" },
  { label: 'Long run: 12 nodes', input: "{\"nums\":[41,27,19,22,20,23,22,3,16,39,25,15],\"edges\":[[0,1],[1,2],[0,3],[1,4],[4,5],[3,6],[4,7],[5,8],[6,9],[7,10],[9,11]]}" },
  ],
}

export default function TreeOfCoprimes() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    if (step.node >= 0) roles[step.node] = 'focus'
    if (step.target >= 0) roles[step.target] = 'target'
    return <>
      <RootedTreeDiagram root={run.root} roles={roles} title="Tree (node ids)" />
      <output aria-label="Answers">{`Answers so far: [${step.answer.join(', ')}]`}</output>
    </>
  }} renderReasoning={() => <>
    <p>A depth-first walk keeps the ancestors of the current node on a stack, nearest last.</p>
    <p>Scanning that stack from the top finds the nearest ancestor that shares no factor with the current value.</p>
  </>} />
}
