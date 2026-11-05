import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1968',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON array of distinct integers (e.g. [6,2,0,9,7])',
  url: 'https://leetcode.com/problems/array-with-elements-not-equal-to-average-of-neighbors/',
  complexity: 'O(n log n) time for the sort and O(n) for the interleave.',
  examples: [
    { label: 'Five values', input: '[6,2,0,9,7]' },
    { label: 'Sorted four', input: '[1,2,3,4]' },
  ],
}

export default function Problem1968Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ step }) => <>
      <div aria-label="Sorted values split at the midpoint" style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {step.sorted.map((v, i) => <span key={i} style={{ minWidth: 40, textAlign: 'center', padding: '6px 8px', borderRadius: 6, border: '1px solid var(--border)', background: i < step.half ? 'color-mix(in srgb, var(--primary) 14%, var(--surface2))' : 'color-mix(in srgb, var(--success, #16a34a) 14%, var(--surface2))' }}>{v}</span>)}
      </div>
      <p>Blue: lower half. Green: upper half. Every upper value is larger than every lower value.</p>
      <div aria-label="Result so far" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <strong>Result:</strong>
        {step.ans.map((v, i) => <span key={i} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface2)' }}>{v}</span>)}
      </div>
    </>}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
