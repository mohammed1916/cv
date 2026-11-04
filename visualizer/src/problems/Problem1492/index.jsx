import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1492',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n and k (JSON)',
  url: 'https://leetcode.com/problems/the-kth-factor-of-n/',
  complexity: 'O(n) time and O(1) extra space for the scan, or O(sqrt n) with paired divisors when a faster method is needed.',
  examples: [
    { label: 'Twelve, third', input: '{"n":12,"k":3}' },
    { label: 'Seven, second', input: '{"n":7,"k":2}' },
    { label: 'Too few factors', input: '{"n":7,"k":3}' },
  ],
}

export default function KthFactor() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { n, k } = run.input
    const { candidate, count, factors } = step.snapshot
    const cells = Array.from({ length: n }, (_, i) => i + 1)
    return <>
      <div role="img" aria-label="Candidates from 1 to n" style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {cells.map(d => <div key={d} data-candidate={d} style={{
          width: 30, textAlign: 'center', fontFamily: 'monospace', boxSizing: 'border-box', color: 'var(--text)',
          border: `${d === candidate ? 2 : 1}px solid ${d === candidate ? 'var(--text)' : 'var(--border)'}`,
          background: factors.includes(d) ? '#bbf7d0' : 'transparent',
        }}>{d}</div>)}
      </div>
      <p>Factors found in ascending order: {factors.length ? factors.join(', ') : 'none yet'}. Target: factor number {k}. Count so far: {count}.</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Ascending order is free:</strong> testing candidates from 1 upward finds factors in sorted order, so the kth one found is the answer.</p>
    <p><strong>Stop early:</strong> once the count reaches k, the rest of the scan is unnecessary.</p>
  </>} />
}
