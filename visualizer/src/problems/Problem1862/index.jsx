import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Prefix counts', description: 'Count how many numbers are at most each value.' },
    { id: 'divide', label: 'Divide', description: 'Use one number as the divisor and count the blocks of quotients.' },
    { id: 'done', label: 'Complete', description: 'Report the sum modulo 1000000007.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with nums, 1 to 20 integers from 1 to 100, for example {"nums":[2,5,9]}',
  url: 'https://leetcode.com/problems/sum-of-floored-pairs/',
  complexity: 'O(M log M) time for largest value M. The visualization caps values at 100.',
  examples: [
    { label: 'Example 1', input: '{"nums":[2,5,9]}' },
    { label: 'Equal values', input: '{"nums":[7,7,7,7,7,7,7]}' },
  ],
}

export default function FloredPairs() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Divisors, one per position" length={run.input.nums.length} valueAt={index => run.input.nums[index]} active={step.index ?? -1} />
    <output aria-label="Running sum">{`Added by this divisor: ${step.added}. Running sum: ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>For a fixed divisor d, the quotient is k for every number in the block from k times d up to just below (k plus 1) times d.</p>
    <p>Prefix counts give the size of each block in one lookup, so the total is a sum over blocks rather than over every pair.</p>
  </>} />
}
