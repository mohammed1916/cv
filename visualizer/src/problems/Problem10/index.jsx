import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '10',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with text and pattern (JSON)',
  url: 'https://leetcode.com/problems/regular-expression-matching/',
  complexity: 'O(m * n) time and space for text length m and pattern length n, with each cell computed once.',
  examples: [
    { label: 'Starred run', input: '{"text":"aab","pattern":"c*a*b"}' },
    { label: 'Middle star', input: '{"text":"abbc","pattern":"ab*c"}' },
    { label: 'Dot star', input: '{"text":"xy","pattern":".*y"}' },
    { label: 'No match', input: '{"text":"ab","pattern":".*c"}' },
  ],
}

const cellStyle = (value, active) => ({
  width: 34, height: 30, boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace', fontSize: '.8rem',
  border: `${active ? 2 : 1}px solid ${active ? 'var(--text)' : 'var(--border)'}`,
  background: value === true ? '#bbf7d0' : value === false ? '#fecaca' : 'transparent',
  color: value === true || value === false ? '#1c1917' : 'var(--text)', display: 'grid', placeItems: 'center',
})

export default function RegexMatching() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { text, pattern, table, cell } = step.snapshot
    const label = ['""', ...text.split('')]
    const plabel = ['""', ...pattern.split('')]
    const [ci, cj] = cell ?? [-1, -1]
    return <>
      <div role="table" aria-label="Match table" style={{ display: 'grid', gridTemplateColumns: `repeat(${pattern.length + 2}, 34px)`, gap: 3, width: 'max-content' }}>
        <div />{plabel.map((token, j) => <div key={`p${j}`} style={{ textAlign: 'center', fontFamily: 'monospace' }}>{token}</div>)}
        {table.map((row, i) => <Row key={i} label={label[i]} row={row} i={i} ci={ci} cj={cj} />)}
      </div>
      <p>{step.message}</p>
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Cell meaning:</strong> the cell at row i and column j says whether the first i text characters match the first j pattern tokens.</p>
    <p><strong>Starred token:</strong> the table looks two columns back for zero copies, and one row up for one more copy when the text character matches.</p>
  </>} />
}

function Row({ label, row, i, ci, cj }) {
  return <>
    <div style={{ fontFamily: 'monospace', textAlign: 'right', paddingRight: 4 }}>{label}</div>
    {row.map((value, j) => <div key={j} data-cell={`${i},${j}`} style={cellStyle(value, i === ci && j === cj)}>{value === null ? '' : value ? 'T' : 'F'}</div>)}
  </>
}
