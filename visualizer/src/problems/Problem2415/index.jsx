import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Read the tree in level order.' },
    { id: 'level', label: 'Reverse level', description: 'Reverse the values on one odd depth.' },
    { id: 'done', label: 'Complete', description: 'Report the level order after all odd depths are reversed.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with root (level-order array of a perfect tree)',
  url: 'https://leetcode.com/problems/reverse-odd-levels-of-binary-tree/',
  complexity: 'O(n) time and O(n) space for the level-order copy. The visualization caps input at 15 nodes.',
  examples: [
    { label: 'Example 1', input: '{"root":[2,3,5,8,13,21,34]}' },
    { label: 'Example 2', input: '{"root":[7,13,11]}' },
    { label: 'Four levels', input: '{"root":[0,1,2,0,0,0,0,1,1,1,1,2,2,2,2]}' },
  ],
}

export default function ReverseOddLevels() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    for (let i = step.first; i <= step.last; i++) roles[i] = 'active'
    return <>
      <BinaryTreeLane title="Tree (current values)" root={run.root} roles={roles} />
      <output aria-label="Values">{`Level order: ${step.values.join(', ')}`}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Each depth of a perfect tree is a contiguous block of the level-order array, so reversing an odd depth means reversing one slice.</p>
  </>} />
}
