import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1987',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Binary string (JSON)',
  url: 'https://leetcode.com/problems/number-of-unique-good-subsequences/',
  complexity: 'O(n) time and O(1) space: two running counts and a flag.',
  examples: [
    { label: 'Leading zero', input: '{"binary":"001"}' },
    { label: 'Ones and zeros', input: '{"binary":"1011"}' },
    { label: 'One then zero', input: '{"binary":"10"}' },
  ],
}

export default function UniqueGoodSubsequences() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { binary, index, endsOne, endsZero, hasZero, total } = step.snapshot
    return <>
      <div aria-label="Binary string" style={{ display: 'flex', gap: 4, fontFamily: 'monospace' }}>
        {[...binary].map((ch, i) => <span key={i} style={{
          border: `${i === index ? 2 : 1}px solid ${i === index ? 'var(--primary)' : 'var(--border)'}`,
          padding: '2px 8px', color: 'var(--text)', background: i < index ? 'var(--surface2)' : 'transparent',
        }}>{ch}</span>)}
      </div>
      <table aria-label="Counts of good subsequences" style={{ borderCollapse: 'collapse', color: 'var(--text)' }}>
        <tbody>
          <tr><td style={{ padding: '2px 8px' }}>Good, start with 1, end with 1</td><td><strong>{endsOne}</strong></td></tr>
          <tr><td style={{ padding: '2px 8px' }}>Good, start with 1, end with 0</td><td><strong>{endsZero}</strong></td></tr>
          <tr><td style={{ padding: '2px 8px' }}>Lone "0" seen</td><td><strong>{hasZero ? 'yes' : 'no'}</strong></td></tr>
        </tbody>
      </table>
      <p>Distinct good subsequences so far: <strong>{total}</strong>.</p>
    </>
  }} renderReasoning={() => <p>A string with a leading 0 is never good unless it is exactly "0", so a 0 may only extend strings that already start with 1.</p>} />
}
