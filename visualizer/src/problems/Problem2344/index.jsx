import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'target', label: 'Target gcd', description: 'Take the gcd of every value in nums_divide.' },
    { id: 'scan', label: 'Scan sorted', description: 'Walk the sorted nums until one value divides the gcd.' },
    { id: 'done', label: 'Complete', description: 'Report the number of deletions, or -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and nums_divide (JSON)',
  url: 'https://leetcode.com/problems/minimum-deletions-to-make-array-divisible/',
  complexity: 'O(n log n) time for n values in nums, dominated by the sort. The visualization caps the sizes.',
  examples: [
    { label: 'Example 1', input: '{"nums":[2,3,2,4,3],"nums_divide":[9,6,9,3,15]}' },
    { label: 'Impossible', input: '{"nums":[4,3,6],"nums_divide":[8,2,6,10]}' },
  ],
}

export default function MinimumDeletionsDivisible() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <p><strong>Gcd of nums_divide:</strong> {step.g}</p>
    <IndexedSequence label="Sorted nums" length={run.sorted.length} valueAt={i => run.sorted[i]} active={step.index}
      roleAt={i => (step.index >= 0 && i < step.index ? 'deleted' : '')} />
    <output aria-label="Result">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>The kept minimum must divide every value in nums_divide, which is the same as dividing their gcd.</p>
    <p>Scanning sorted values from the smallest, the first divisor of the gcd is the best kept minimum, and every smaller value has to go.</p>
  </>} />
}
