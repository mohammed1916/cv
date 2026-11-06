import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
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

export default function MaxPositiveProductSubarray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { index, pos, neg, best } = step.snapshot
    return <>
      <IndexedSequence label="Input array (current index i)" length={run.input.length} active={index ?? -1} valueAt={i => run.input[i]} />
      <table aria-label="Running lengths" style={{ fontFamily: 'monospace', borderCollapse: 'collapse', marginTop: 12, color: 'var(--text)' }}>
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
