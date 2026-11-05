import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '2245',
  phases: [
    { id: 'setup', label: 'Factors', description: 'Count the factors of 2 and 5 in each cell.' },
    { id: 'corner', label: 'Corner', description: 'Try each corner with its arms in every direction.' },
    { id: 'done', label: 'Result', description: 'Return the most trailing zeros found.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"grid": [[2, 5], [10, 1]]}',
  url: 'https://leetcode.com/problems/maximum-trailing-zeros-in-a-cornered-path/',
  complexity: 'O(m * n) time and O(m * n) space after the factor counts. Each cell is a corner tried with at most nine arm pairs.',
  examples: [
    { label: 'Small', input: '{"grid":[[2,5],[10,1]]}' },
    { label: 'Row', input: '{"grid":[[5,10,25,50]]}' },
  ],
}

export default function CorneredPath() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const grid = run.input.grid
    const onPath = new Set((step.path || []).map(([r, c]) => `${r},${c}`))
    return <>
      <table aria-label="Grid values">
        <tbody>{grid.map((row, r) => <tr key={r}>{row.map((v, c) => {
          const corner = step.corner && step.corner[0] === r && step.corner[1] === c
          const on = onPath.has(`${r},${c}`)
          return <td key={c} data-role={corner ? 'corner' : on ? 'path' : ''}
            style={{ minWidth: 44, textAlign: 'center', padding: 6, border: '1px solid var(--text-muted)', background: corner ? 'var(--primary)' : on ? 'var(--surface2)' : 'transparent', color: corner ? 'var(--surface)' : 'var(--text)', fontWeight: corner ? 700 : 400 }}>{v}</td>
        })}</tr>)}</tbody>
      </table>
      <output aria-label="Best so far">{`best ${step.best} trailing zeros`}</output>
      <p role="status">{step.message}</p>
    </>
  }} renderReasoning={() => <>
    <p>Trailing zeros of a product equal the smaller of its total factor 2 count and total factor 5 count. Both counts only grow as a path gets longer.</p>
    <p>So for each corner, the best path reaches the edge of the grid in each direction it uses. Try the corner with no arm, a left or right arm, combined with no arm, an up or down arm.</p>
  </>} />
}
