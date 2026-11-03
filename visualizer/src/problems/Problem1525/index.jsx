import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1525',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Lowercase letters a to z',
  url: 'https://leetcode.com/problems/number-of-good-ways-to-split-a-string/',
  complexity: 'O(n) time and O(n) space: distinct-letter counts for every prefix and suffix are computed once.',
  examples: [
    { label: 'Mixed', input: 'abcabc' },
    { label: 'Repeated', input: 'aaaa' },
    { label: 'Short', input: 'xyzxzy' },
  ],
}

export default function GoodSplits() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { pos, split, left, right, good, matched } = step.snapshot
    const s = run.input.s
    return <>
      <div role="img" aria-label="String positions" style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {[...s].map((ch, i) => <div key={i} style={{
          minWidth: 34, padding: '4px 6px', textAlign: 'center', fontFamily: 'monospace', boxSizing: 'border-box',
          border: `${i === pos ? 2 : 1}px solid ${i === pos ? 'var(--text)' : 'var(--border)'}`,
          marginRight: i === split ? 14 : 0,
        }}><div>{ch}</div><small>{i}</small></div>)}
      </div>
      <table aria-label="Distinct letter counts" style={{ fontFamily: 'monospace', borderCollapse: 'collapse', marginTop: 8 }}>
        <thead><tr><th>pos</th><th>letter</th><th>left prefix</th><th>right suffix</th></tr></thead>
        <tbody>{[...s].map((ch, i) => <tr key={i} style={{ background: i === split ? 'var(--surface2)' : 'transparent' }}>
          <td>{i}</td><td>{ch}</td><td>{left[i] ?? '-'}</td><td>{right[i] ?? '-'}</td>
        </tr>)}</tbody>
      </table>
      <p>Good splits so far: <strong>{good}</strong>{split != null && matched != null ? ` · split after ${split}: ${matched ? 'equal' : 'not equal'}` : ''}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Two scans:</strong> one pass from the left and one from the right give the distinct-letter count for every prefix and suffix.</p>
    <p><strong>Split rule:</strong> a split after position i is good when the prefix through i and the suffix from i + 1 have the same distinct count.</p>
  </>} />
}
