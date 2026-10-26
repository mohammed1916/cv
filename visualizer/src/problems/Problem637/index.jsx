import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Root level', description: 'Begin at depth 0.' },
    { id: 'visit', label: 'Add node', description: 'Add each node value to the level sum.' },
    { id: 'level', label: 'Average level', description: 'Divide the sum by the level size.' },
    { id: 'done', label: 'Complete', description: 'Return the averages.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Tree (LeetCode level-order JSON array)',
  url: 'https://leetcode.com/problems/average-of-levels-in-binary-tree/',
  complexity: 'O(n) time and O(w) extra space, where w is the widest level.',
  examples: [
    { label: 'Three levels', input: '[3,9,20,null,null,15,7]' },
    { label: 'Mixed', input: '[3,9,20,15,7]' },
    { label: 'Single', input: '[2147483647]' },
  ],
}

export default function AverageOfLevels() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    step.seen?.forEach(id => { roles[id] = 'visited' })
    if (step.current !== null && step.current !== undefined) roles[step.current] = 'active'
    return <>
      <BinaryTreeLane title="Tree" root={run.root} roles={roles} />
      <output aria-label="Level averages">Averages so far: [{step.sums.map(v => Number(v.toFixed(2))).join(', ')}]</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Precision:</strong> sums can reach 2³¹ × 10,000, which JavaScript doubles hold exactly, so the average is exact before rounding.</p>
  </>} />
}
