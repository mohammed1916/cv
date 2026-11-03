import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1304',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Integer n (JSON)',
  url: 'https://leetcode.com/problems/find-n-unique-integers-sum-up-to-zero/',
  complexity: 'O(n) time and O(n) space for the output.',
  examples: [
    { label: 'Odd count', input: '5' },
    { label: 'Even count', input: '4' },
    { label: 'Single', input: '1' },
  ],
}

export default function SumToZero() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { answer, n, total } = step.snapshot
    return <>
      <p>Target count {n} · running sum {total}</p>
      <div role="img" aria-label="Integers built so far" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {answer.length === 0 ? <span>empty</span> : answer.map((v, i) => <div key={i} style={{ minWidth: 44, padding: '6px 8px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace', border: '1px solid var(--border)', color: '#1c1917', background: v === 0 ? '#e0f2fe' : v > 0 ? '#dcfce7' : '#fee2e2' }}>{v}</div>)}
      </div>
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Cancel in pairs:</strong> each positive value i with -i contributes nothing, so the sum stays zero.</p>
    <p><strong>Distinctness:</strong> the pairs use different magnitudes, and zero is added at most once, so no value repeats.</p>
    <p>{step.message}</p>
  </>} />
}
