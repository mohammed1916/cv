import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sorted values', description: 'An in-order walk lists the BST values in increasing order.' },
    { id: 'move', label: 'Move a pointer', description: 'A small sum moves l right; a large sum moves r left.' },
    { id: 'hit', label: 'Pair found', description: 'The two pointers sum to k.' },
    { id: 'done', label: 'Answer', description: 'Report whether a pair exists.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'BST and target (JSON object with root and k)',
  url: 'https://leetcode.com/problems/two-sum-iv-input-is-a-bst/',
  complexity: 'O(n) time and O(n) space for the in-order list; O(h) stack space for the walk.',
  examples: [
    { label: 'Pair', input: '{"root":[4,2,6,1,3,null,7],"k":9}' },
    { label: 'No pair', input: '{"root":[4,2,6,1,3,null,7],"k":20}' },
    { label: 'Single node', input: '{"root":[3],"k":6}' },
  ],
}

export default function TwoSumBst() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Sorted values from the in-order walk" length={step.sorted.length} active={-1}
      valueAt={i => step.sorted[i]}
      roleAt={i => (i === step.l && i === step.r ? 'l = r' : i === step.l ? 'l' : i === step.r ? 'r' : '')} />
    <output aria-label="Pointer sum">{step.sum === null || step.sum === undefined ? `Target ${step.k}` : `${step.sorted[step.l]} + ${step.sorted[step.r]} = ${step.sum} (target ${step.k})`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why two pointers:</strong> the in-order values are sorted, so the same argument as a sorted array search applies.</p>
  </>} />
}
