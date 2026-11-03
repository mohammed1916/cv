import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1524',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON array of positive integers',
  url: 'https://leetcode.com/problems/number-of-sub-arrays-with-odd-sum/',
  complexity: 'O(n) time and O(1) space: only the counts of even and odd prefix parities are kept.',
  examples: [
    { label: 'Small array', input: '[1,2,3]' },
    { label: 'Even start', input: '[4,5,6,7]' },
    { label: 'Mixed', input: '[2,2,1,8,3]' },
  ],
}

export default function OddSumSubarrays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { index, value, parity, odd, even, total, added } = step.snapshot
    return <>
      <div role="img" aria-label="Array values" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {run.input.arr.map((v, i) => <div key={i} style={{
          minWidth: 46, padding: '6px 8px', textAlign: 'center', fontFamily: 'monospace', boxSizing: 'border-box',
          border: `${i === index ? 2 : 1}px solid ${i === index ? 'var(--text)' : 'var(--border)'}`,
        }}><div>{v}</div><small>{i}</small></div>)}
      </div>
      <p>Prefix parity: <strong>{parity === 1 ? 'odd' : 'even'}</strong>{value != null ? ` after value ${value}` : ''}</p>
      <p>Even prefixes stored: <strong>{even}</strong> · Odd prefixes stored: <strong>{odd}</strong></p>
      <p>Subarrays added here: <strong>{added ?? 0}</strong> · Total: <strong>{total}</strong></p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Prefix sums:</strong> a subarray has odd sum exactly when its two prefix sums have different parity.</p>
    <p><strong>Counting pairs:</strong> at each position, every earlier prefix with the opposite parity closes an odd-sum subarray.</p>
  </>} />
}
