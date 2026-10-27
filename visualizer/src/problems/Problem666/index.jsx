import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Root', description: 'Start the depth-first walk at the root.' },
    { id: 'visit', label: 'Extend path', description: 'Append this node’s digit to the path number.' },
    { id: 'leaf', label: 'Leaf', description: 'A leaf adds its complete path number to the total.' },
    { id: 'done', label: 'Complete', description: 'Report the total of all root-to-leaf paths.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Three-digit codes (JSON array of strings)',
  url: 'https://leetcode.com/problems/path-sum-iv/',
  complexity: 'O(n) time and O(depth) stack space. The visualization caps input at 15 nodes.',
  examples: [
    { label: 'Example 1', input: '["113","215","221"]' },
    { label: 'Single root', input: '["117"]' },
  ],
}

export default function PathSumIV() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    for (const id of step.visited) roles[id] = 'visited'
    if (step.node !== null) roles[step.node] = 'active'
    const tags = Object.fromEntries(Object.entries(step.paths).map(([id, path]) => [id, `path ${path}`]))
    return <>
      <BinaryTreeLane title="Tree" root={run.root} roles={roles} tags={tags} note={`total ${step.total}`} />
      <output aria-label="Total">{`Sum so far: ${step.total}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Each three-digit code gives depth, position and value. A node’s parent is at depth minus one and position halved, rounded up.</p>
    <p>Walking down, every node extends the number formed so far by one digit. Each leaf finishes one root-to-leaf number, and those numbers are added.</p>
  </>} />
}
