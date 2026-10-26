import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Begin backtracking at digit 0.' },
    { id: 'push', label: 'Take segment', description: 'Accept a segment into the sequence.' },
    { id: 'reject', label: 'Prune', description: 'Leading zero, overflow, or wrong sum.' },
    { id: 'pop', label: 'Backtrack', description: 'Undo the last segment and try a longer one.' },
    { id: 'done', label: 'Complete', description: 'Return the sequence, or an empty list.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Digit string (JSON)',
  url: 'https://leetcode.com/problems/split-array-into-fibonacci-sequence/',
  complexity: 'Only the first two numbers branch (at most 10 digits each); the rest are forced by the sum, so about O(n^2 * n) time. The recursion stack is O(n).',
  examples: [
    { label: 'Example 1', input: '"1101111"' },
    { label: 'Example 2', input: '"112358130"' },
    { label: 'Example 3', input: '"0123"' },
    { label: 'Long sequence', input: '"123456579"' },
  ],
}
export default function SplitFibonacci() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Digits" length={run.input.length} active={step.j} valueAt={i => run.input[i]} roleAt={i => (step.i >= 0 && step.j >= 0 && i >= step.i && i <= step.j ? 'segment' : '')} />
    <IndexedSequence label="Sequence so far" length={step.res.length} active={step.res.length - 1} valueAt={i => step.res[i]} />
    <output aria-label="Result">{step.phase === 'done' ? `Result: [${run.result.join(', ')}]` : `${step.res.length} numbers chosen`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why prune by sum:</strong> once two numbers are fixed the third is forced, so a candidate that is too small needs more digits and one that is too big (or exceeds 2^31 - 1) can never recover, since longer segments only increase the value.</p>
    <p>Backtracking guarantees that if any valid split exists the search finds it.</p>
  </>} />
}
