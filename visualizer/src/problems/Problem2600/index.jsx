import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'setup', label: 'Setup', description: 'Start with an empty total and k picks to spend.' },
    { id: 'ones', label: 'Ones', description: 'Take as many +1 items as the budget allows.' },
    { id: 'zeros', label: 'Zeros', description: 'Spend what is left on zero-valued items.' },
    { id: 'negatives', label: 'Negatives', description: 'Only then take -1 items, and subtract them.' },
    { id: 'done', label: 'Result', description: 'Return the total value of the chosen bag.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Bag object (JSON, e.g. {"numOnes": 3, "numZeros": 2, "numNegOnes": 0, "k": 2})',
  url: 'https://leetcode.com/problems/k-items-with-the-maximum-sum/',
  complexity: 'O(1) time and O(1) space. The bag is drawn item by item for visibility, with at most 150 items.',
  examples: [
    { label: 'Only ones', input: '{"numOnes": 3, "numZeros": 2, "numNegOnes": 0, "k": 2}' },
    { label: 'Negatives forced', input: '{"numOnes": 3, "numZeros": 2, "numNegOnes": 3, "k": 4}' },
  ],
}

export default function KItemsWithMaximumSum() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { numOnes, numZeros, numNegOnes } = run.input
    const bag = [...Array(numOnes).fill(1), ...Array(numZeros).fill(0), ...Array(numNegOnes).fill(-1)]
    const onesEnd = numOnes
    const zerosEnd = numOnes + numZeros
    const takenOnes = step.picked
    const takenZeros = step.zeros
    const takenNegatives = step.negatives
    const roleAt = i => {
      if (i < onesEnd) return i < takenOnes ? 'picked' : ''
      if (i < zerosEnd) return i - onesEnd < takenZeros ? 'picked' : ''
      return i - zerosEnd < takenNegatives ? 'picked' : ''
    }
    return <>
      <IndexedSequence label="bag" length={bag.length} valueAt={i => bag[i]} active={-1} roleAt={roleAt} />
      <output aria-label="Bag state">{`k = ${run.input.k}; +1 taken ${takenOnes}, 0 taken ${takenZeros}, -1 taken ${takenNegatives}; total ${step.total}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Spend the budget greedily in value order: first the +1 items, then the zeros, and only if the budget still exceeds both, the -1 items.</p>
    <p>Each group is taken with a single min(), so the answer is computed in constant time.</p>
  </>} />
}
