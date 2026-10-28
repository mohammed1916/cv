import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Start the running total at zero.' },
    { id: 'number', label: 'Number', description: 'Count the divisors of this number and decide whether to add it.' },
    { id: 'done', label: 'Complete', description: 'Report the total divisor sum.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with nums, an array of 1 to 20 integers from 1 to 10000, for example {"nums":[21,4,7]}',
  url: 'https://leetcode.com/problems/four-divisors/',
  complexity: 'O(n * sqrt(max)) time for n numbers.',
  examples: [
    { label: 'Example 1', input: '{"nums":[21,4,7]}' },
    { label: 'Example 2', input: '{"nums":[21,21]}' },
  ],
}

export default function FourDivisors() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Numbers" length={run.input.nums.length} valueAt={index => run.input.nums[index]} roleAt={index => (step.qualifies.includes(index) ? 'four divisors' : '')} active={step.index ?? -1} />
    <output aria-label="Running total">{`Running total: ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>A number with exactly four divisors is either a product of two distinct primes or a cube of a prime. Counting divisors directly is enough for these small inputs.</p>
    <p>Each qualifying number adds the sum of its divisors to the total.</p>
  </>} />
}
