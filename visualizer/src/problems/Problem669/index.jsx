import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Range', description: 'Keep values between low and high.' },
    { id: 'prune', label: 'Prune node', description: 'Out of range: replace it with the subtree that may hold values in range.' },
    { id: 'keep', label: 'Keep node', description: 'In range: trim both subtrees.' },
    { id: 'done', label: 'Complete', description: 'Return the trimmed tree.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'BST and range (JSON object with root, low and high)',
  url: 'https://leetcode.com/problems/trim-a-binary-search-tree/',
  complexity: 'O(n) time and O(h) recursion depth.',
  examples: [
    { label: 'Trim low', input: '{"root":[1,0,2],"low":1,"high":2}' },
    { label: 'Trim both', input: '{"root":[3,0,4,null,2,null,null,1],"low":1,"high":3}' },
  ],
}

export default function TrimBST() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    step.pruned.forEach(id => { roles[id] = 'pruned' })
    if (step.current !== null && step.current !== undefined && !roles[step.current]) roles[step.current] = 'active'
    return <>
      <BinaryTreeLane title={step.phase === 'done' ? 'Trimmed tree' : 'Original tree (pruned nodes dashed)'} root={run.root} roles={roles} />
      <output aria-label="Level order">[{(step.result ?? []).map(v => (v === null ? 'null' : v)).join(', ')}]</output>
    </>
  }} renderReasoning={({ run, step }) => <>
    <p>{step.message}</p>
    <p><strong>Why splice:</strong> a value below low can only lie in its right subtree, and a value above high only in its left subtree.</p>
    <p>Range [{run.input.low}, {run.input.high}].</p>
  </>} />
}
