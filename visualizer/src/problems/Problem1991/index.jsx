import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1991',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Integer array (JSON)',
  url: 'https://leetcode.com/problems/find-the-middle-index-in-array/',
  complexity: 'O(n) time and O(1) extra space: one total and one running left sum.',
  examples: [
    { label: 'Middle found', input: '[6,1,2,3,0,4,3]' },
    { label: 'Zero balance', input: '[0,0,0]' },
    { label: 'No balance', input: '[1,2,3]' },
  ],
}

export default function FindMiddleIndex() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { nums, total, index, left, right, answer } = step.snapshot
    return <>
      <table aria-label="Sides around each index" style={{ borderCollapse: 'collapse', fontFamily: 'monospace', color: 'var(--text)' }}>
        <thead><tr><th style={{ padding: '2px 6px' }} /> {nums.map((_, i) => <th key={i} style={{ padding: '2px 6px' }}>{i}</th>)}</tr></thead>
        <tbody>
          <tr><th style={{ padding: '2px 6px', textAlign: 'left' }}>value</th>{nums.map((v, i) => <td key={i} style={{
            border: '1px solid var(--border)', padding: '2px 6px', textAlign: 'center',
            background: i === index ? 'var(--primary-glow)' : 'transparent',
          }}>{v}</td>)}</tr>
        </tbody>
      </table>
      <p>Total <strong>{total}</strong>. At index <strong>{index >= 0 ? index : '-'}</strong>: left sum <strong>{left}</strong>, right sum <strong>{right ?? '-'}</strong>.</p>
      {answer >= 0 && <p>Answer found: <strong>{answer}</strong>.</p>}
    </>
  }} renderReasoning={() => <p>The right sum is never summed again: it equals the total minus the left sum minus the current value, so each index is checked in constant time.</p>} />
}
