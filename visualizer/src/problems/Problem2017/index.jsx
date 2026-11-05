import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2017',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Two rows of points as JSON',
  url: 'https://leetcode.com/problems/grid-game/',
  complexity: 'O(n) time: one prefix pass over the two rows.',
  examples: [
    { label: 'Lower bottom row', input: '[[4,1,6],[2,3,1]]' },
    { label: 'Equal rows', input: '[[2,2],[2,2]]' },
    { label: 'Long top', input: '[[5,1,1,8],[1,3,4,2]]' },
  ],
}

export default function GridGame() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { grid, column, topRest, bottomTaken, best, bestColumn } = step.snapshot
    const cell = (v, r, c) => <td key={c} style={{
      border: '1px solid var(--border)', padding: '4px 10px', textAlign: 'center', fontFamily: 'monospace', color: 'var(--text)',
      background: column >= 0 && ((r === 0 && c > column) || (r === 1 && c < column)) ? 'var(--surface2)' : (c === column ? 'var(--primary-glow)' : 'transparent'),
    }}>{v}</td>
    return <>
      <table aria-label="Two-row grid" style={{ borderCollapse: 'collapse' }}>
        <tbody>{grid.map((row, r) => <tr key={r}>
          <th style={{ padding: '4px 8px', color: 'var(--text-muted)' }}>{r === 0 ? 'top' : 'bottom'}</th>
          {row.map((v, c) => cell(v, r, c))}
        </tr>)}</tbody>
      </table>
      <p>Shaded cells are left for the second robot when the first switches at column <strong>{column >= 0 ? column : '-'}</strong>.</p>
      <p>Top left for robot 2: <strong>{topRest}</strong> · Bottom skipped by robot 1: <strong>{bottomTaken}</strong> · Best so far: <strong>{best === Infinity ? '-' : best}</strong>{bestColumn >= 0 ? ` at column ${bestColumn}` : ''}.</p>
    </>
  }} renderReasoning={() => <p>Robot 1 switches rows at one column. Robot 2 then faces the top cells to the right of that column or the bottom cells to the left, and the better of these two totals decides the answer.</p>} />
}
