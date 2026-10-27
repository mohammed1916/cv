import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin at n with cost n.' },
    { id: 'settle', label: 'Expand number', description: 'Take the cheapest number and try one-digit changes.' },
    { id: 'relax', label: 'Digit change', description: 'Try raising or lowering one digit; primes are skipped.' },
    { id: 'done', label: 'Complete', description: 'Report the cheapest total cost, or -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Two numbers n and m with the same digit count (JSON)',
  url: 'https://leetcode.com/problems/digit-operations-to-make-two-integers-equal/',
  complexity: 'O(10^d * d log 10^d) time for d-digit numbers. The visualization caps input at 3 digits.',
  examples: [
    { label: 'Example', input: '{"n":10,"m":12}' },
    { label: 'Blocked', input: '{"n":4,"m":8}' },
  ],
}

export default function DigitOperations() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const width = String(run.input.n).length
    const digits = String(step.value).padStart(width, '0').split('')
    return <>
      <IndexedSequence label={`Digits of the current value ${step.value}`} length={width} active={-1} valueAt={i => digits[i]} roleAt={i => `place ${i + 1}`} />
      <output aria-label="Cost">{step.phase === 'done' ? `Answer: ${run.result}` : `Running cost: ${step.cost ?? '-'}`}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Every value on the path is added to the cost, so the cheapest route is a Dijkstra search with the new value as the edge weight. Primes are simply removed from the graph.</p>
  </>} />
}
