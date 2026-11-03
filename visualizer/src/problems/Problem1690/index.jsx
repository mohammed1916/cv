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
  ],
}

export default function StoneGameVII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { table, interval } = step.snapshot
    const n = run.input.length
    const [si, sj] = interval ?? []
    const cell = { padding: '4px 8px', border: '1px solid var(--border)', fontFamily: 'monospace', textAlign: 'center' }
    return <>
      <table aria-label="Interval scores" style={{ borderCollapse: 'collapse' }}>
        <thead><tr><th style={cell}>i \ j</th>{Array.from({ length: n }, (_, j) => <th key={j} style={cell}>{j}</th>)}</tr></thead>
        <tbody>{table.map((row, i) => <tr key={i}><th style={cell}>{i}</th>{row.map((v, j) => {
          const active = i === si && j === sj
          return <td key={j} style={{ ...cell, background: active ? '#bbf7d0' : j >= i ? 'transparent' : 'var(--surface2)', color: '#1c1917' }}>{j >= i ? v : ''}</td>
        })}</tr>)}</tbody>
      </table>
    </>
  }} renderReasoning={({ run }) => <>
    <p><strong>Key idea:</strong> whatever a player removes, the opponent then plays the remaining row. So each choice scores the remaining sum minus the opponent's best difference on that smaller row.</p>
    <p><strong>Table:</strong> the cell for the interval i..j only needs the two shorter intervals next to it, so we fill the table by growing length.</p>
  </>} />
}
