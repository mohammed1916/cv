import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2012',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Integer array of length 3 to 30 (JSON)',
  url: 'https://leetcode.com/problems/sum-of-beauty-in-the-array/',
  complexity: 'O(n) time with prefix maxima and suffix minima.',
  examples: [
    { label: 'Global beauty', input: '[1,2,5,3,6]' },
    { label: 'Increasing', input: '[1,2,3,4]' },
    { label: 'Decreasing', input: '[5,4,3,2]' },
  ],
}

export default function SumOfBeautyInArray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { nums, prefixMax, suffixMin, index, beauty, total } = step.snapshot
    return <>
      <table aria-label="Prefix maxima and suffix minima" style={{ borderCollapse: 'collapse', fontFamily: 'monospace', color: 'var(--text)' }}>
        <tbody>
          <tr><th style={{ padding: '2px 6px', textAlign: 'left' }}>value</th>{nums.map((v, i) => <td key={i} style={{
            border: '1px solid var(--border)', padding: '2px 6px', background: i === index ? 'var(--primary-glow)' : 'transparent',
          }}>{v}</td>)}</tr>
          <tr><th style={{ padding: '2px 6px', textAlign: 'left' }}>max left</th>{prefixMax.map((v, i) => <td key={i} style={{ border: '1px solid var(--border)', padding: '2px 6px' }}>{v}</td>)}</tr>
          <tr><th style={{ padding: '2px 6px', textAlign: 'left' }}>min right</th>{suffixMin.map((v, i) => <td key={i} style={{ border: '1px solid var(--border)', padding: '2px 6px' }}>{v}</td>)}</tr>
        </tbody>
      </table>
      <p>{index >= 0 ? <>Index <strong>{index}</strong> has beauty <strong>{beauty}</strong>.</> : 'Scanning the interior indices.'} Total: <strong>{total}</strong>.</p>
    </>
  }} renderReasoning={() => <p>An index is beautiful globally when everything to its left is smaller and everything to its right is larger; prefix maxima and suffix minima test that in constant time.</p>} />
}
