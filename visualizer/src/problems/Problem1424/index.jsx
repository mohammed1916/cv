import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { phases, parseInput, buildTrace, code, python, pythonLineMap } from './algorithm'

const definition = {
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: 'JSON array of rows, each row an array of integers (e.g. [[1, 2, 3], [4], [5, 6]])',
  url: 'https://leetcode.com/problems/diagonal-traverse-ii/',
  complexity: 'O(N) time and O(N) space for N values in total, from one pass into diagonal buckets and one read of each bucket.',
  examples: [
    { label: 'Ragged rows', input: '[[1, 2, 3], [4], [5, 6]]' },
    { label: 'Tall', input: '[[1], [2], [3], [4]]' },
    { label: 'Wide', input: '[[1, 2, 3, 4]]' },
  ],
}

function GridScene({ run, step }) {
  const snap = step.snapshot
  const rows = run.input
  const width = Math.max(...rows.map(row => row.length))
  const [ci, cj] = snap.cell ?? [-1, -1]
  return <>
    <table aria-label="Ragged grid, rows top to bottom" className="algorithm-sequence">
      <tbody>{rows.map((row, i) => <tr key={i}>
        <th>Row {i}</th>
        {Array.from({ length: width }, (_, j) => {
          if (j >= row.length) return <td key={j} />
          const onDiagonal = snap.diagonal >= 0 && i + j === snap.diagonal
          const current = i === ci && j === cj
          return <td key={j} data-current={current || undefined} className={onDiagonal ? 'is-active' : undefined}
            style={current ? { fontWeight: 700, outline: '2px solid currentColor' } : undefined}>{row[j]}</td>
        })}
      </tr>)}</tbody>
    </table>
    <p>Output so far: {snap.output.length ? snap.output.join(', ') : 'none yet'}</p>
  </>
}

export default function DiagonalTraverse() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <GridScene run={run} step={step} />}
      renderReasoning={({ step }) => <p>{phases.find(p => p.id === step.phase)?.description}</p>}
    />
  )
}
