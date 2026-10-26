import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'The unsorted numbers.' },
    { id: 'sort', label: 'Sort', description: 'Sorting makes max and min positional.' },
    { id: 'powers', label: 'Powers of two', description: 'Precompute 2^i modulo 1e9+7.' },
    { id: 'term', label: 'Add contribution', description: 'Element i adds nums[i] * (2^i - 2^(n-1-i)).' },
    { id: 'done', label: 'Complete', description: 'Return the total width sum.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'nums (JSON array, up to 200 values)',
  url: 'https://leetcode.com/problems/sum-of-subsequence-widths/',
  complexity: 'O(n log n) time for sorting plus O(n) for the sum; O(n) space for powers of two.',
  examples: [
    { label: 'Official', input: '[2,1,3]' },
    { label: 'Single', input: '[2]' },
    { label: 'Duplicates', input: '[5,69,89,92,31,16,25,45,63,40,16,56,24,40,75,82,40,12,50,62,92,44,67,38,92,22,91,24,26,21,100,42,23,56,64,43,95,76,84,79,89,4,16,94,16,77,92,9,30,13]' },
  ],
}

export default function SumOfSubsequenceWidths() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <>
      <IndexedSequence label={step.phase === 'start' ? 'nums (unsorted)' : 'nums (sorted)'} length={step.nums.length} valueAt={i => step.nums[i]} active={step.index}
        roleAt={i => (step.index >= 0 && i < step.index ? 'done' : '')} />
      {step.phase !== 'start' && step.phase !== 'sort' && <IndexedSequence label="Powers of two mod 1e9+7" length={run.pow2.length} valueAt={i => run.pow2[i]} active={step.index} />}
      {step.contributions.length > 0 && <IndexedSequence label="Coefficient 2^i - 2^(n-1-i) mod p" length={step.contributions.length} valueAt={i => step.contributions[i]} active={step.index} />}
      <output aria-label="Running sum">Running sum: {step.ans}</output>
    </>}
    renderReasoning={({ step }) => <>
      <p>{step.message}</p>
      <p><strong>Counting argument:</strong> in the sorted array, element i is the maximum of every subsequence that uses it plus any subset of the i smaller elements (2^i of them), and the minimum for any subset of the n-1-i larger ones. Summing max minus min over all subsequences therefore weights nums[i] by 2^i - 2^(n-1-i).</p>
    </>} />
}
