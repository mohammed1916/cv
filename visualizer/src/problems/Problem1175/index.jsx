import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

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
    { label: 'Five', input: '5' },
    { label: 'Ten', input: '10' },
    { label: 'One', input: '1' },
  ],
}

export default function PrimeArrangements() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { n, x, primeCount, primeSlots, otherSlots, answer, marks } = step.snapshot
    const known = new Map(marks.map(mark => [mark.x, mark.prime]))
    return <>
      <div aria-label="Numbers from 1 to n" role="img" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxWidth: 560 }}>
        {Array.from({ length: n }, (_, i) => i + 1).map(value => {
          const prime = known.get(value)
          return <div key={value} data-value={value} style={{
            width: 40, height: 40, boxSizing: 'border-box', display: 'grid', placeItems: 'center', fontFamily: 'monospace',
            border: x === value ? '2px solid var(--text)' : '1px solid var(--border)',
            background: prime === true ? '#67e8f9' : 'transparent',
            color: prime === false ? 'var(--text-dim)' : 'var(--text)',
          }}>{value}</div>
        })}
      </div>
      <output aria-label="Group counts">
        {`Primes: ${primeCount} · prime slots: ${primeSlots ?? '-'} · other slots: ${otherSlots ?? '-'}${answer !== null ? ` · answer: ${answer}` : ''}`}
      </output>
    </>
  }} renderReasoning={() => <>
    <p><strong>Split the positions:</strong> of the positions 1 to n, p are prime-numbered and n − p are not.</p>
    <p><strong>Count:</strong> the p prime values fill the prime positions in p! ways, and the other values fill the rest in (n − p)! ways. Multiply the two, modulo 1,000,000,007.</p>
  </>} />
}
