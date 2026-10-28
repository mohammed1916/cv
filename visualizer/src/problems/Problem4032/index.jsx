import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'extend', label: 'Extend', description: 'Add the next element and its new distinct primes.' },
    { id: 'shrink', label: 'Shrink', description: 'Drop the left element while more than k primes remain.' },
    { id: 'record', label: 'Record', description: 'Keep the longest window seen so far.' },
    { id: 'done', label: 'Complete', description: 'Report the longest valid subarray.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Numbers and k (JSON object with nums and k)',
  url: 'https://leetcode.com/problems/longest-subarray-with-at-most-k-distinct-prime-factors/',
  complexity: 'O(n · √M) time for distinct prime factors, plus O(n) window moves, and O(number of primes) space. The visualization caps input at 12 numbers.',
  examples: [
    { label: 'Example 1', input: '{"nums":[7,6,10,12,11],"k":3}' },
    { label: 'Example 2', input: '{"nums":[4,6,9,18],"k":4}' },
  ],
}

export default function LongestKPrimeSubarray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Numbers" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.right}
      roleAt={i => (i >= step.left && i <= step.right ? 'window' : '')} />
    <output aria-label="Window">{`Distinct primes ${step.distinct} of at most ${run.input.k}; best ${step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>Only the union of distinct primes in a window matters, so the window tracks how many windows each prime appears in.</p>
    <p>When the union grows past k, the left end moves right until the union is back within k.</p>
  </>} />
}
