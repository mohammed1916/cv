import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1299',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array of integers (JSON)',
  url: 'https://leetcode.com/problems/replace-elements-with-greatest-element-on-right-side/',
  complexity: 'O(n) time and O(1) extra space: one backward pass with a running maximum.',
  examples: [
    { label: 'Mixed', input: '[3,9,2,7]' },
    { label: 'All negative', input: '[-4,-2,-7]' },
    { label: 'Single', input: '[5]' },
  ],
}

export default function ReplaceGreatestRight() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { arr, index, best, current } = step.snapshot
    return <>
      <div role="img" aria-label="Array being rewritten" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {arr.map((value, i) => <div key={i} data-index={i} style={{
          minWidth: 52, padding: '6px 8px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace',
          border: `${i === index ? 2 : 1}px solid ${i === index ? 'var(--text)' : 'var(--border)'}`,
          background: i === index ? 'var(--surface2)' : 'transparent', color: '#1c1917',
        }}><div>{value}</div><small>{i}</small></div>)}
      </div>
      <p>Running maximum to the right: {best === null ? "none" : best}{current !== null ? ` · reading ${current}` : ''}</p>
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Scan backward:</strong> when a position is written, every value to its right has already been folded into the running maximum.</p>
    <p><strong>Read before write:</strong> the current value is saved before it is overwritten, so it can still update the maximum.</p>
    <p>{step.message}</p>
  </>} />
}
