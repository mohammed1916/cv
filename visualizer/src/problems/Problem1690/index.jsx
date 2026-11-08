import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1690',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Stone values (JSON array)',
  url: 'https://leetcode.com/problems/stone-game-vii/',
  complexity: 'O(n^2) time and O(n^2) space for the interval table.',
  examples: [
    { label: 'Four stones', input: '[4,9,2,7]' },
    { label: 'Five stones', input: '[3,1,8,2,6]' },
    { label: 'Single stone', input: '[5]' },
  { label: 'Two stones', input: '[1,100]' },
  { label: 'Equal stones', input: '[7,7,7,7]' },
  { label: 'Largest values', input: '[100,1,100,100,1,100]' },
  { label: 'Long run: 16 stones', input: '[90,57,98,23,72,26,80,94,24,67,60,8,51,46,88,22]' },
  ],
}

const cell = { padding: '4px 8px', border: '1px solid var(--border)', fontFamily: 'monospace', textAlign: 'center', color: 'var(--text)' }

export default function StoneGameVII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { table, interval, takeLeft, takeRight, stones } = step.snapshot
    const values = stones ?? run.input
    const n = values.length
    const [l, r] = interval ?? []
    return <>
      <div role="img" aria-label="Stones with the current interval" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
        {values.map((v, k) => {
          const inside = l !== undefined && k >= l && k <= r
          return <div key={k} style={{ minWidth: 40, padding: '6px 6px 14px', textAlign: 'center', fontFamily: 'monospace', position: 'relative', boxSizing: 'border-box',
            border: `2px solid ${inside ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 6,
            background: inside ? 'var(--surface2)' : 'var(--surface)', color: 'var(--text)' }}>
            {v}
            <small style={{ position: 'absolute', bottom: 1, left: 0, right: 0, fontSize: 10, color: 'var(--text-muted)' }}>{k}{k === l ? ' l' : ''}{k === r ? ' r' : ''}</small>
            {l === k && <span style={{ position: 'absolute', top: -16, left: 0, fontSize: 11, fontWeight: 700, color: 'var(--primary)' }}>l</span>}
            {r === k && <span style={{ position: 'absolute', top: -16, right: 0, fontSize: 11, fontWeight: 700, color: 'var(--primary)' }}>r</span>}
          </div>
        })}
      </div>
      {interval && takeLeft !== null && <p>Interval {l}..{r}: take left scores <strong>{takeLeft}</strong>, take right scores <strong>{takeRight}</strong>. The better one is kept.</p>}
      <table aria-label="Interval scores" style={{ borderCollapse: 'collapse', marginTop: 8 }}>
        <thead><tr><th style={cell}>i \ j</th>{Array.from({ length: n }, (_, j) => <th key={j} style={cell}>{j}</th>)}</tr></thead>
        <tbody>{table.map((row, i) => <tr key={i}><th style={cell}>{i}</th>{row.map((v, j) => {
          const active = i === l && j === r
          return <td key={j} style={{ ...cell, background: active ? 'var(--primary)' : j >= i ? 'var(--surface)' : 'var(--surface2)', color: active ? 'var(--on-primary, var(--primary-contrast))' : 'var(--text)' }}>{j >= i ? v : ''}</td>
        })}</tr>)}</tbody>
      </table>
    </>
  }} renderReasoning={({ run }) => <>
    <p><strong>Key idea:</strong> whatever a player removes, the opponent then plays the remaining row. So each choice scores the remaining sum minus the opponent's best difference on that smaller row.</p>
    <p><strong>Table:</strong> the cell for the interval i..j only needs the two shorter intervals next to it, so we fill the table by growing length. {run.input.length === 1 ? 'A single stone scores 0.' : ''}</p>
  </>} />
}
