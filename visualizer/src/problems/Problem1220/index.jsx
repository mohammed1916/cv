import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases,
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n (JSON)',
  complexity: 'O(n) time and O(1) extra space: five counters are rebuilt for each length.',
  examples: [
    { label: 'Several generations', input: '{"n":12}' },
    { label: 'One letter', input: '{"n":1}' },
    { label: 'Two letters', input: '{"n":2}' },
    { label: 'Long length', input: '{"n":60}' },
  ],
}

const VOWELS = ['a', 'e', 'i', 'o', 'u']
// Which letters may come before each vowel: a after e, i or u; e after a or i; i after e or o; o after i; u after i or o.
const BEFORE = { a: 'e i u', e: 'a i', i: 'e o', o: 'i', u: 'i o' }

export default function CountVowelsPermutation() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { length, counts, history = [] } = step.snapshot
    return <div aria-label="Vowel count table" style={{ display: 'grid', gap: 10, justifyItems: 'start' }}>
      <table aria-label="Strings by length and last vowel" style={{ borderCollapse: 'collapse', fontFamily: 'monospace' }}>
        <thead><tr>
          <th scope="col" style={{ padding: '2px 8px', textAlign: 'left' }}>length</th>
          {VOWELS.map(v => <th key={v} scope="col" style={{ padding: '2px 10px' }}>ends {v}</th>)}
        </tr></thead>
        <tbody>{history.map((row, r) => <tr key={r} data-row={r} style={{
          background: r + 1 === length ? 'color-mix(in srgb, var(--primary) 22%, transparent)' : 'transparent',
          outline: r + 1 === length ? '2px solid var(--text)' : 'none',
        }}>
          <th scope="row" style={{ padding: '2px 8px', textAlign: 'left' }}>{r + 1}</th>
          {row.map((value, c) => <td key={c} style={{ padding: '2px 10px', textAlign: 'center', color: 'var(--text)' }}>{value}</td>)}
        </tr>)}</tbody>
      </table>
      <p style={{ margin: 0 }}>Each ending vowel takes the counts of the letters that may come before it:</p>
      <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--text-dim)' }}>
        {VOWELS.map(v => <li key={v}>{v} follows {BEFORE[v]}</li>)}
      </ul>
      <div aria-label="Current counts" style={{ display: 'flex', gap: 8 }}>
        {VOWELS.map((v, i) => (
          <div key={v} data-vowel={v} style={{ width: 84, padding: 8, border: '1px solid var(--border)', textAlign: 'center', color: 'var(--text)' }}>
            <div style={{ fontWeight: 700 }}>{v}</div>
            <div style={{ fontFamily: 'monospace' }}>{counts[i]}</div>
          </div>
        ))}
      </div>
    </div>
  }} renderReasoning={({ step }) => <p>{step.message}</p>} />
}
