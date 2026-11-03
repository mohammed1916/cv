import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, phases, code, python } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Grid (JSON array of rows)',
  complexity: 'O(rows + columns) time and O(1) extra space. The walk never revisits a cell.',
  examples: [
    { label: 'Sample', input: '[[4,3,-1],[3,1,-2],[2,-1,-3]]' },
    { label: 'Positive', input: '[[5,2],[3,1]]' },
    { label: 'Negative', input: '[[-1,-2],[-3,-4]]' },
  ],
}

function GridView({ snapshot }) {
  const { grid, r, c, counted, focus } = snapshot
  const isCounted = (row, col) => counted.some(([cr, cc]) => cr === row && cc === col)
  return <table className="algorithm-grid-table">
    <tbody>{grid.map((row, rowIndex) => <tr key={rowIndex}>{row.map((value, colIndex) => {
      const here = rowIndex === r && colIndex === c
      const focused = focus && focus[0] === rowIndex && focus[1] === colIndex
      return <td key={colIndex} className={[here ? 'is-walker' : '', isCounted(rowIndex, colIndex) ? 'is-counted' : ''].join(' ').trim()}
        data-focus={focused ? 'true' : undefined}>
        {value}{here ? ' ◀' : ''}
      </td>
    })}</tr>)}</tbody>
  </table>
}

export default function CountNegativesInSortedMatrix() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <>
      <GridView snapshot={step.snapshot} />
      <p>Negative cells counted: <strong>{step.snapshot.count}</strong></p>
    </>}
    renderReasoning={({ step }) => <p>{step.message}</p>} />
}
