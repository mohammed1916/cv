import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'count', label: 'Count', description: 'Tally how often each letter appears.' },
    { id: 'rank', label: 'Rank', description: 'Take the k letters with the largest counts.' },
    { id: 'tie', label: 'Ties', description: 'Letters sharing the k-th count can be swapped in.' },
    { id: 'done', label: 'Result', description: 'Multiply the choices, modulo 1e9+7.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s and k',
  url: 'https://leetcode.com/problems/count-k-subsequences-of-a-string-with-maximum-beauty/',
  complexity: 'O(n + sigma log sigma) time for n characters over an alphabet of size sigma.',
  examples: [
    { label: 'Example', input: '{"s":"wwwtxxyy","k":2}' },
    { label: 'Tied letters', input: '{"s":"gggeeff","k":2}' },
    { label: "Single letter", input: "{\"s\":\"a\",\"k\":1}" },
    { label: "Same letter repeated", input: "{\"s\":\"qqqqqq\",\"k\":26}" },
    { label: "Alphabet once, k 26", input: "{\"s\":\"abcdefghijklmnopqrstuvwxyz\",\"k\":26}" },
    { label: "Long run: 60 seeded letters", input: "{\"s\":\"lapclanurqnijwvexwhabcfopunmtwrsfudmbwbqrahmzulczylyjidybevu\",\"k\":5}" },
  ],
}

function letterCounts(s) {
  const counts = new Map()
  for (const c of s) counts.set(c, (counts.get(c) || 0) + 1)
  return [...counts].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))
}

const cell = { padding: '4px 8px', borderBottom: '1px solid var(--surface2)', color: 'var(--text)', textAlign: 'left' }

// Bars show f(c) for each letter. Chosen letters are the k largest; the tied band is every letter sharing the k-th frequency.
function FrequencyBars({ s, k, chosen }) {
  const letters = letterCounts(s)
  const top = letters.length ? letters[0][1] : 1
  const v = letters.length >= k ? letters[k - 1][1] : null
  return <table aria-label="Letter frequencies" style={{ borderCollapse: 'collapse', width: '100%' }}>
    <thead><tr>{['letter', 'f(c)', 'bar', 'role'].map(h => <th key={h} scope="col" style={{ ...cell, borderBottom: '2px solid var(--border, currentColor)' }}>{h}</th>)}</tr></thead>
    <tbody>{letters.map(([c, f]) => {
      const isChosen = chosen?.includes(c)
      const isTied = v !== null && f === v
      return <tr key={c} data-chosen={isChosen ? 'yes' : 'no'} style={{ background: isChosen ? 'var(--surface2)' : 'transparent' }}>
        <td style={cell}><strong>{c}</strong></td><td style={cell}>{f}</td>
        <td style={cell}><div style={{ height: 10, width: `${(f / top) * 100}%`, minWidth: 4, borderRadius: 4, background: isChosen ? 'var(--primary)' : 'var(--border, currentColor)' }} /></td>
        <td style={cell}>{isChosen ? (isTied ? 'chosen, tied at k-th' : 'chosen') : isTied ? 'tied, may replace' : 'not used'}</td>
      </tr>
    })}</tbody>
  </table>
}

export default function CountKSubsequencesMaximumBeauty() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <FrequencyBars s={run.input.s} k={run.input.k} chosen={step.chosen} />
    <output aria-label="Count status" style={{ color: 'var(--text)' }}>{`k = ${run.input.k}. ${step.message ?? ''}`}</output>
  </>} renderReasoning={() => <>
    <p>A k-subsequence with distinct letters has a beauty equal to the sum of the letter counts it uses, so the best choice takes the k largest counts.</p>
    <p>Letters that tie with the k-th count are interchangeable. Choose how many of them are needed, then one index from each chosen letter.</p>
  </>} />
}
