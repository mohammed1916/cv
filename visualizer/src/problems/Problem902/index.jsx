import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Read n and the digit set.' },
    { id: 'shorter', label: 'Shorter lengths', description: 'Count all strings with fewer digits than n.' },
    { id: 'position', label: 'Count smaller', description: 'Count set digits smaller than the digit of n at this position.' },
    { id: 'match', label: 'Match prefix', description: 'The digit of n is in the set; keep following n.' },
    { id: 'stop', label: 'Stop', description: 'The digit of n is not in the set; no longer prefix can match.' },
    { id: 'full', label: 'n itself', description: 'Every digit matched, so n is counted.' },
    { id: 'done', label: 'Complete', description: 'Return the count.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'Object {digits, n} (JSON)',
  url: 'https://leetcode.com/problems/numbers-at-most-n-given-digit-set/',
  complexity: 'O(k * d) time for k digits in n and d set digits, O(k) space.',
  examples: [
    { label: 'Example 1', input: '{"digits":["1","3","5","7"],"n":100}' },
    { label: 'Example 2', input: '{"digits":["1","4","9"],"n":1000000000}' },
    { label: 'Example 3', input: '{"digits":["7"],"n":8}' },
    { label: 'Prefix stops', input: '{"digits":["1","3"],"n":5231}' },
  ],
}

export default function NumbersAtMostN() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Digits of n" length={String(run.input.n).length} active={step.pos ?? -1} valueAt={i => String(run.input.n)[i]}
      roleAt={i => i < (step.pos ?? -1) ? 'matched' : ''} />
    <IndexedSequence label="Digit set" length={run.input.digits.length} valueAt={i => run.input.digits[i]}
      roleAt={i => step.pos >= 0 && run.input.digits[i] < String(run.input.n)[step.pos] ? 'smaller' : ''} />
    <output aria-label="Total">{step.phase === 'done' ? 'Answer' : 'Total so far'}: {step.total}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Numbers shorter than n are free. For equal length, fix the longest prefix that equals n; at each position, any smaller digit makes the rest unconstrained.</p>
  </>} />
}
