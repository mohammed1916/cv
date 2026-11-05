import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Collect sums', description: 'Start the bottom-up pass over the tree.' },
    { id: 'subtree', label: 'Subtree sum', description: 'A node’s subtree sum is its value plus both child sums.' },
    { id: 'check', label: 'Look for half', description: 'Half the total must appear as a subtree sum below the root.' },
    { id: 'done', label: 'Answer', description: 'Report whether one cut makes two equal halves.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Tree (LeetCode level-order JSON array)',
  url: 'https://leetcode.com/problems/equal-tree-partition/',
  complexity: 'O(n) time and O(n) space for the subtree sums and the recursion.',
  examples: [
    { label: 'Split', input: '[6,3,3,null,null,2,4]' },
    { label: 'Odd total', input: '[3,1,1]' },
    { label: 'Single', input: '[6]' },
  ],
}

export default function EqualTreePartition() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    const tags = {}
    step.sums.forEach(({ id, total }) => { tags[id] = String(total) })
    if (step.node !== null && step.node !== undefined) roles[step.node] = 'current'
    if (step.target !== null) step.sums.forEach(({ id, total }) => { if (total === step.target && id !== run.root?.id) roles[id] = 'found' })
    return <>
      <BinaryTreeLane title="Tree with subtree sums" root={run.root} roles={roles} tags={tags}
        note={step.sum === null ? '' : `total ${step.sum}${step.target !== null ? `, half ${step.target}` : ''}`} />
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why a subtree sum:</strong> removing the edge above a subtree leaves the rest of the tree with total minus that subtree sum.</p>
  </>} />
}
