import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { treeFromLevelOrder } from '../../components/shared/treeLayout'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with an empty stack.' },
    { id: 'read', label: 'Read value', description: 'Read the next value and its depth.' },
    { id: 'pop', label: 'Pop', description: 'Drop ancestors that are too deep for this value.' },
    { id: 'attach', label: 'Attach', description: 'Hang the value under its parent.' },
    { id: 'done', label: 'Complete', description: 'Report the rebuilt tree.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with a dashed preorder traversal string (JSON)',
  url: 'https://leetcode.com/problems/recover-a-tree-from-preorder-traversal/',
  complexity: 'O(n) time and O(h) space for the stack. The visualization caps input at 15 values.',
  examples: [
    { label: 'Seven values', input: '{"traversal":"1-2--3--4-5--6--7"}' },
    { label: 'Left-heavy', input: '{"traversal":"1-401--349---90--88"}' },
  ],
}

export default function RecoverPreorder() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const roles = step.current === null ? {} : { [step.current]: 'active' }
    return <>
      <BinaryTreeLane title="Rebuilt tree" root={treeFromLevelOrder(step.shape)} roles={roles} />
      <output aria-label="Current value">{step.message}</output>
    </>
  }} renderReasoning={() => <>
    <p>The dashes before a value give its depth, which is how many ancestors it has.</p>
    <p>Keeping the current ancestor chain on a stack means the parent of any value is the stack entry one level above it.</p>
  </>} />
}
