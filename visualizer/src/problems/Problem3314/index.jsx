import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with an empty list of answers.' },
    { id: 'pick', label: 'Candidate', description: 'Find the lowest unset bit and derive the candidate.' },
    { id: 'check', label: 'Check', description: 'Verify the candidate ORs with its successor to give the prime.' },
    { id: 'done', label: 'Complete', description: 'Report every answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Primes from 2 to 1000 (JSON object with nums)',
  url: 'https://leetcode.com/problems/construct-the-minimum-bitwise-array-i/',
  complexity: 'O(n * sqrt(p)) time including the prime check, O(n) space. The visualization caps the list at 12 primes.',
  examples: [
    { label: 'Example', input: '{"nums":[2,3,5,7]}' },
    { label: 'Single', input: '{"nums":[11]}' },
  ],
}

export default function MinimumBitwiseArrayI() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roleAt = index => (index === step.index ? 'current' : '')
    return <>
      <IndexedSequence label="Primes in nums" length={run.input.nums.length} valueAt={index => run.input.nums[index]}
        active={step.index} roleAt={roleAt} />
      <IndexedSequence label="Answers" length={run.result.length} valueAt={index => step.answers[index] ?? '-'}
        active={step.answers.length > 0 ? step.answers.length - 1 : -1} />
      <output aria-label="Current candidate">{step.candidate !== undefined ? `Candidate ${step.candidate} for prime ${step.prime}` : 'No candidate yet'}</output>
    </>
  }} renderReasoning={() => <>
    <p>Let low be the lowest bit that is 0 in p. Clearing the bit just below low gives the smallest x whose trailing ones, plus one, reproduce p under OR.</p>
    <p>If the check fails, no x works and the answer is -1, which happens for 2.</p>
  </>} />
}
