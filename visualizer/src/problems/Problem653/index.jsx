import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Root', description: 'Begin an in-order walk.' },
    { id: 'visit', label: 'Visit node', description: 'Remember its value and check later partners.' },
    { id: 'match', label: 'Pair found', description: 'A remembered value completes the sum.' },
    { id: 'done', label: 'Complete', description: 'Report whether a pair exists.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'BST and k (JSON object with root and k)',
  url: 'https://leetcode.com/problems/two-sum-iv-input-is-a-bst/',
  complexity: 'O(n) time and O(n) space for the set of seen values.',
  examples: [
    { label: 'Pair exists', input: '{"root":[5,3,6,2,4,null,7],"k":9}' },
    { label: 'No pair', input: '{"root":[5,3,6,2,4,null,7],"k":28}' },
    { label: 'Same value twice is not allowed', input: '{"root":[2,1,3],"k":4}' },
  ],
}

export default function TwoSumBST() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    step.visited.forEach(id => { roles[id] = 'visited' })
    if (step.current !== null && step.current !== undefined) roles[step.current] = step.phase === 'match' ? 'match' : 'active'
    return <>
      <BinaryTreeLane title="BST" root={run.root} roles={roles} />
      <output aria-label="Seen values">Seen: {step.seen.join(', ') || 'none'}{step.pair ? ` · pair ${step.pair.join(' + ')}` : ''}</output>
    </>
  }} renderReasoning={({ run, step }) => <>
    <p>{step.message}</p>
    <p><strong>Why a set works:</strong> every earlier node is already in the set, so each new node needs only one lookup for k − value.</p>
    <p>Target k = {run.input.k}.</p>
  </>} />
}
