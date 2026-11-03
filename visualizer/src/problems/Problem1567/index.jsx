import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1567',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array of integers (JSON)',
  url: 'https://leetcode.com/problems/maximum-length-of-subarray-with-positive-product/',
  complexity: 'O(n) time and O(1) extra space: one pass that keeps two running lengths.',
  examples: [
    { label: 'Mixed signs', input: '[2,-3,4,-1,5]' },
    { label: 'Zero splits', input: '[3,-1,-2,0,5,-4]' },
    { label: 'All negative', input: '[-4,-2,-7]' },
  ],
}

const tile = active => ({
  minWidth: 48, boxSizing: 'border-box', padding: '6px 8px', textAlign: 'center', fontFamily: 'monospace',
  border: `${active ? 2 : 1}px solid ${active ? 'var(--text)' : 'var(--border)'}`,
})

export default function MaxPositiveProductSubarray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { index, pos, neg, best } = step.snapshot
    return <>
      <div role="img" aria-label="Input values" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {run.input.map((v, i) => <div key={i} data-index={i} style={tile(i === index)}>{v}<small> {i}</small></div>)}
      </div>
      <table aria-label="Running lengths" style={{ fontFamily: 'monospace', borderCollapse: 'collapse', marginTop: 12 }}>
        <tbody>
          <tr><th style={{ textAlign: 'left', paddingRight: 12 }}>pos (positive product)</th><td>{pos}</td></tr>
          <tr><th style={{ textAlign: 'left', paddingRight: 12 }}>neg (negative product)</th><td>{neg}</td></tr>
          <tr><th style={{ textAlign: 'left', paddingRight: 12 }}>best so far</th><td>{best}</td></tr>
        </tbody>
      </table>
    </>
  }} renderReasoning={() => <>
    <p><strong>Two running lengths:</strong> pos and neg are the longest subarrays ending at the current position with a positive and a negative product. A zero resets both.</p>
    <p><strong>Why swap on negatives:</strong> multiplying by a negative number flips the sign, so the new positive run comes from the old negative run.</p>
  </>} />
}
