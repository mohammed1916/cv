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
    { label: 'Single value', input: '[7]' },
    { label: 'Repeated values', input: '[3,3,3,3]' },
    { label: 'Value limits', input: '[100,1,100,1]' },
    { label: 'Long run: 100 values', input: '[4,59,47,82,17,9,83,57,67,12,48,4,32,78,9,85,100,51,75,12,79,31,84,18,94,38,3,58,4,10,84,92,9,70,64,64,26,48,83,70,86,77,72,67,40,82,22,40,78,28,97,37,85,62,72,74,80,87,15,28,44,82,55,31,62,16,29,98,27,85,35,35,43,35,36,66,4,3,88,7,83,99,8,86,32,13,81,67,98,65,59,81,50,11,68,22,7,20,68,2]' },
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
