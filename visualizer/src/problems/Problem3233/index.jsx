import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with no special numbers.' },
    { id: 'candidate', label: 'Candidate', description: 'Take the next p and its square.' },
    { id: 'special', label: 'Special', description: 'p is prime and its square lies in range.' },
    { id: 'skip', label: 'Skip', description: 'The square is not special or out of range.' },
    { id: 'done', label: 'Result', description: 'Subtract the special count from the total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with integers l and r (1 <= l <= r <= 200)',
  url: 'https://leetcode.com/problems/find-the-count-of-numbers-which-are-not-special/',
  complexity: 'O(sqrt(r) * sqrt(r)) time with trial division. The visualization caps r at 200.',
  examples: [
    { label: 'Example', input: '{"l":1,"r":10}' },
    { label: 'Short', input: '{"l":5,"r":8}' },
  ],
}

export default function NotSpecialNumbers() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => (
    <>
      <IndexedSequence label={`Numbers ${run.input.l} to ${run.input.r}`} length={run.input.r - run.input.l + 1}
        valueAt={i => run.input.l + i} active={step.found.length ? step.found[step.found.length - 1] - run.input.l : -1}
        roleAt={i => (step.found.includes(run.input.l + i) ? 'special' : '')} />
      <output aria-label="Special count">{`Special so far: ${step.special}`}</output>
    </>
  )} renderReasoning={() => <>
    <p>A number has exactly three divisors when it is the square of a prime: 1, the prime, and the square.</p>
    <p>So every prime p whose square falls in the range is special, and the answer is the interval length minus that count.</p>
  </>} />
}
