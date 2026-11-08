import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2031',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Binary array (JSON)',
  url: 'https://leetcode.com/problems/count-subarrays-with-more-ones-than-zeros/',
  complexity: 'O(n^2) in this direct form (n capped at 40 here); a Fenwick tree over balances gives O(n log n).',
  examples: [
    { label: 'Mixed', input: '[1,0,1,1,0]' },
    { label: 'Single one', input: '[1]' },
    { label: 'Zeros first', input: '[0,0,1]' }, { label: "Single one", input: "[1]" }, { label: "All zeros tie", input: "[0,0,0]" }, { label: "Alternating 40", input: "[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]" }, { label: "Long run: 40 bits", input: "[1,0,1,1,0,1,0,0,1,0,1,0,1,0,1,1,0,1,0,1,1,1,1,0,1,1,0,0,0,1,0,1,0,0,1,1,0,0,0,1]" },
  ],
}

export default function CountSubarraysMoreOnes() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { nums, prefix, j, count } = step.snapshot
    return <>
      <table aria-label="Prefix balances" style={{ borderCollapse: 'collapse', fontFamily: 'monospace', color: 'var(--text)' }}>
        <tbody>
          <tr><th style={{ padding: '2px 6px', textAlign: 'left' }}>value</th>{nums.map((v, i) => <td key={i} style={{ border: '1px solid var(--border)', padding: '2px 6px', textAlign: 'center' }}>{v}</td>)}</tr>
          <tr><th style={{ padding: '2px 6px', textAlign: 'left' }}>prefix</th>{prefix.map((p, i) => <td key={i} style={{
            border: '1px solid var(--border)', padding: '2px 6px', textAlign: 'center',
            background: i === j ? 'var(--primary-glow)' : 'transparent',
          }}>{p}</td>)}</tr>
        </tbody>
      </table>
      <p>Current prefix <strong>{j}</strong> with balance <strong>{prefix[j]}</strong>. Subarrays with more ones so far: <strong>{count}</strong>.</p>
    </>
  }} renderReasoning={() => <p>A subarray has more ones than zeros exactly when the balance difference between its two prefix boundaries is positive, so each boundary counts the earlier boundaries with a smaller balance.</p>} />
}
