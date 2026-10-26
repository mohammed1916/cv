import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Root minimum', description: 'The root holds the minimum value.' },
    { id: 'visit', label: 'Visit node', description: 'Keep the smallest value above the minimum.' },
    { id: 'done', label: 'Complete', description: 'Return the second minimum, or −1.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Special tree (LeetCode level-order JSON array)',
  url: 'https://leetcode.com/problems/second-minimum-node-in-a-binary-tree/',
  complexity: 'O(n) time and O(h) stack space.',
  examples: [
    { label: 'Second is 5', input: '[2,2,5,null,null,5,7]' },
    { label: 'No second', input: '[2,2,2]' },
    { label: 'Deep', input: '[2,2,3,null,null,3,3]' },
  ],
}

export default function SecondMinimum() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    step.seen?.forEach(id => { roles[id] = 'visited' })
    if (step.current !== null && step.current !== undefined) roles[step.current] = 'active'
    return <>
      <BinaryTreeLane title="Tree" root={run.root} roles={roles} />
      <output aria-label="Second minimum">Second minimum so far: {step.second ?? 'none'}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why the root suffices:</strong> each parent is the smaller of its children, so the root is the global minimum, and every other value is at least as large as it.</p>
  </>} />
}
