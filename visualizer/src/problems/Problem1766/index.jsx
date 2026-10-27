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
    { label: 'Example 1', input: '{"nums":[2,3,3,2],"edges":[[0,1],[1,2],[1,3]]}' },
    { label: 'Example 2', input: '{"nums":[5,6,10,2,3,6,15],"edges":[[0,1],[0,2],[1,3],[1,4],[2,5],[2,6]]}' },
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
