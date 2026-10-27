import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No pair is known yet.' },
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
    <IndexedSequence label="Numbers in range" length={run.input.right - run.input.left + 1} valueAt={i => run.input.left + i} active={step.index} roleAt={i => (step.answer.includes(run.input.left + i) ? 'in answer' : '')} />
    <output aria-label="Answer">{`Answer so far: [${step.answer.join(', ')}]`}</output>
  </>} renderReasoning={() => <>
    <p>The closest pair of primes is always two neighbours in the sorted list of primes in the range.</p>
    <p>Walking the range once and comparing each prime with the previous one finds that pair.</p>
  </>} />
}
