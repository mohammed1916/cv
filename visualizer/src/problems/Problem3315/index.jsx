import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with an empty list of answers.' },
    { id: 'bit', label: 'Lowest zero', description: 'Find the index of the lowest zero bit of the prime.' },
    { id: 'candidate', label: 'Candidate', description: 'Clear the bit just below that zero, or record -1.' },
    { id: 'done', label: 'Complete', description: 'Report every answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Primes from 2 to 1000 (JSON object with nums)',
  url: 'https://leetcode.com/problems/construct-the-minimum-bitwise-array-ii/',
  complexity: 'O(n * log p) time, O(n) space. The visualization caps the list at 12 primes; the statement allows larger primes.',
  examples: [
    { label: 'Example', input: '{"nums":[11,13,31]}' },
    { label: 'Even prime', input: '{"nums":[2,3,5,7]}' },
  ],
}

export default function MinimumBitwiseArrayII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roleAt = index => (index === step.index ? 'current' : '')
    return <>
      <IndexedSequence label="Primes in nums" length={run.input.nums.length} valueAt={index => run.input.nums[index]}
        active={step.index} roleAt={roleAt} />
      <IndexedSequence label="Answers" length={run.result.length} valueAt={index => step.answers[index] ?? '-'}
        active={step.answers.length > 0 ? step.answers.length - 1 : -1} />
      <output aria-label="Lowest zero bit">{step.bit !== undefined ? `Lowest zero bit of ${step.prime}: index ${step.bit}` : 'No prime examined yet'}</output>
    </>
  }} renderReasoning={() => <>
    <p>If the lowest zero bit of p sits at index b, clearing bit b-1 gives x such that x OR (x + 1) equals p, and no smaller x works.</p>
    <p>The number 2 has bit 0 equal to zero, so no x exists and its answer is -1.</p>
  </>} />
}
