import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { phases, parseInput, buildTrace, code, python } from './algorithm'
import { Sequence, Vars } from './SeqKit'

const definition = {
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Number n (1 to 100)',
  url: 'https://leetcode.com/problems/prime-arrangements/',
  complexity: 'Trial division tests each number up to its square root, about O(n√n) in total. The two factorials take O(n) multiplications.',
  examples: [
    { label: 'Seven', input: '7' },
    { label: 'Ten', input: '10' },
    { label: 'One', input: '1' },
  ],
}

export default function PrimeArrangements() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { n, x, primeCount, primeSlots, otherSlots, answer, marks } = step.snapshot
    const known = new Map(marks.map(mark => [mark.x, mark.prime]))
    const values = Array.from({ length: n }, (_, i) => i + 1)
    const pointers = x === null || x === undefined ? {} : { x: x - 1 }
    const cellMarks = Object.fromEntries(values.map(value => [value - 1, known.get(value) === true ? 'written' : '']))
    return <>
      <Sequence label="Numbers 1 to n (green = prime)" values={values} pointers={pointers} marks={cellMarks} />
      <Vars vars={{ 'primes p': primeCount, 'other numbers n - p': n - primeCount, 'prime slots p!': primeSlots, 'other slots (n-p)!': otherSlots, answer }} />
      <output aria-label="Group counts">{step.message}</output>
      {run.result !== undefined && step.phase === 'done' && <p>Result: {run.result}</p>}
    </>
  }} renderReasoning={() => <>
    <p><strong>Split the positions:</strong> of the positions 1 to n, p are prime-numbered and n − p are not.</p>
    <p><strong>Count:</strong> the p prime values fill the prime positions in p! ways, and the other values fill the rest in (n − p)! ways. Multiply the two, modulo 1,000,000,007.</p>
  </>} />
}
