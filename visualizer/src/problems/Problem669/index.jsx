import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start at root', description: 'Each node is compared with the range [low, high].' },
    { id: 'cut', label: 'Cut a node', description: 'A node outside the range is replaced by one of its subtrees.' },
    { id: 'keep', label: 'Keep a node', description: 'A node in range stays, and both children are trimmed.' },
    { id: 'done', label: 'Trimmed', description: 'The remaining tree is in range.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'BST and range (JSON object with root, low and high)',
  url: 'https://leetcode.com/problems/trim-a-binary-search-tree/',
  complexity: 'O(n) time for n nodes and O(h) recursion space.',
  examples: [
    { label: 'Left cut', input: '{"root":[6,2,8,1,4,null,9],"low":3,"high":7}' },
    { label: 'Right cut', input: '{"root":[5,1,9,null,3,8],"low":2,"high":6}' },
    { label: 'Whole kept', input: '{"root":[4,2,5],"low":1,"high":9}' },
  ],
}

export default function TrimBst() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    step.removed.forEach(id => { roles[id] = 'removed' })
    if (step.current !== null) roles[step.current] = step.phase === 'cut' ? 'current-cut' : 'current'
    return <>
      <BinaryTreeLane title={`Original tree, keep ${run.input.low} to ${run.input.high}`} root={run.original} roles={roles}
        note={step.phase === 'done' ? `trimmed to [${step.result.map(v => (v === null ? 'null' : v)).join(', ')}]` : `${step.removed.length} removed`} />
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why one subtree survives:</strong> the BST order means a node out of range can only have the other side's subtree still in range.</p>
  </>} />
}
