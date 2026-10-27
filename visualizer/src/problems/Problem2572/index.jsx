import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty subset', description: 'Only the empty subset exists before any number is used.' },
    { id: 'number', label: 'Use number', description: 'Extend each earlier prime pattern that shares no prime with this number.' },
    { id: 'skip', label: 'Skip', description: 'A number with a squared prime factor cannot join any square-free subset.' },
    { id: 'done', label: 'Complete', description: 'Report the non-empty square-free subsets.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Numbers (JSON object with nums as values from 1 to 30)',
  url: 'https://leetcode.com/problems/count-the-number-of-square-free-subsets/',
  complexity: 'O(n * 2^10) time with a bitmask of the ten primes up to 29. The visualization caps input at 8 numbers.',
  examples: [
    { label: 'Example 1', input: '{"nums":[3,4,4,5]}' },
    { label: 'Ones', input: '{"nums":[1,1,1]}' },
  ],
}

export default function SquareFree() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Numbers" length={run.nums.length} active={step.index}
      valueAt={i => run.nums[i]}
      roleAt={i => (i < step.index ? 'processed' : i === step.index ? (step.skipped ? 'skipped' : 'current') : 'pending')} />
    <output aria-label="Status">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>A square-free product uses each prime at most once. So each number is a set of primes, and a subset is counted by the prime pattern it uses.</p>
    <p>The DP keeps how many subsets use each prime pattern. A number joins a pattern only when the two share no prime. The answer excludes the empty subset.</p>
  </>} />
}
