import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No prime has been seen yet.' },
    { id: 'composite', label: 'Composite', description: 'A number with a divisor is skipped.' },
    { id: 'prime', label: 'Prime', description: 'A prime that does not improve the gap.' },
    { id: 'record', label: 'Record', description: 'A new closest pair of adjacent primes.' },
    { id: 'done', label: 'Complete', description: 'Report the closest pair.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with left and right (JSON), 1 <= left <= right <= 1000',
  url: 'https://leetcode.com/problems/closest-prime-numbers-in-range/',
  complexity: 'O(R sqrt(R)) time with trial division. The visualization caps the range at 1000.',
  examples: [
    { label: 'Example 1', input: '{"left":10,"right":19}' },
    { label: 'Example 2', input: '{"left":4,"right":6}' },
  ],
}

export default function ClosestPrimes() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Numbers in the range (prime cells are marked)" length={run.input.right - run.input.left + 1} valueAt={i => run.input.left + i} active={step.index}
      roleAt={i => {
        const x = run.input.left + i
        if (step.answer.includes(x) && step.answer[0] !== -1) return 'pair'
        if (step.previous === x) return 'previous'
        return step.primes.includes(x) ? 'prime' : ''
      }} />
    <output aria-label="Answer">{`Primes so far: ${step.primes.join(', ') || 'none'}. Best gap: ${step.best ?? 'unset'}. Answer: [${step.answer.join(', ')}]`}</output>
  </>} renderReasoning={() => <>
    <p>Only primes matter. Once the primes are listed in order, the closest pair is two neighbours in that list.</p>
    <p>Walking the range once and comparing each prime with the one before it finds that pair. A tie keeps the earlier pair because the comparison is strict.</p>
  </>} />
}
