import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { parseInput, buildTrace, code, python, phases } from './algorithm'

const definition = {
  number: '970',
  title: 'Powerful Integers',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with x, y and bound: whole numbers, with x and y from 1 to 20 and bound up to 500',
  url: 'https://leetcode.com/problems/powerful-integers/',
  complexity: 'O(log_x(bound) * log_y(bound)) pairs, plus a sort of the distinct sums.',
  examples: [
    { label: 'Bases 2 and 3', input: JSON.stringify({ x: 2, y: 3, bound: 12 }) },
    { label: 'Base 1 on one side', input: JSON.stringify({ x: 1, y: 4, bound: 20 }) },
    { label: 'Bases 3 and 4', input: JSON.stringify({ x: 3, y: 4, bound: 30 }) },
  ],
}

const CELL_STYLE = {
  new: { background: 'var(--primary-glow)', color: 'var(--text)' },
  repeat: { background: 'var(--surface2)', color: 'var(--text-muted)' },
  over: { background: 'transparent', color: 'var(--text-muted)', textDecoration: 'line-through' },
}

export default function Problem970() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <table aria-label="Pairs of powers" style={{ borderCollapse: 'collapse', width: 'max-content' }}>
      <thead><tr><th scope="col">x^i \ y^j</th>{step.cols.map((b, j) => <th key={j} scope="col" style={{ padding: 6, color: 'var(--text-muted)' }}>{b}</th>)}</tr></thead>
      <tbody>{step.rows.map((a, i) => <tr key={i}>
        <th scope="row" style={{ padding: 6, color: 'var(--text-muted)' }}>{a}</th>
        {step.cols.map((b, j) => {
          const cell = step.cells.find(c => c.i === i && c.j === j)
          const current = step.current && step.current[0] === i && step.current[1] === j
          return <td key={j} data-status={cell ? cell.status : 'pending'} style={{
            padding: '8px 12px', border: '1px solid var(--border)', textAlign: 'center',
            outline: current ? '2px solid var(--primary)' : 'none',
            ...(cell ? CELL_STYLE[cell.status] : { color: 'var(--text-muted)' }),
          }}>{a + b}</td>
        })}
      </tr>)}</tbody>
    </table>
    <p style={{ margin: 0, color: 'var(--text)' }}>Distinct sums so far: {step.found.length ? step.found.join(', ') : 'none'}.</p>
    <p style={{ margin: 0, color: 'var(--text-muted)' }}>Shaded cells are new sums. Struck cells are over the bound. Grey cells repeat a sum already found.</p>
  </>} renderReasoning={({ step }) => <p>{step.message}</p>} />
}
