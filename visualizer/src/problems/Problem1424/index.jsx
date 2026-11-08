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
    { label: 'One value', input: '[[5]]' },
    { label: 'Equal rows', input: '[[2,2],[2,2]]' },
    { label: 'Largest row count: 50 rows', input: '[[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1],[1]]' },
    { label: 'Long run: 20 by 20', input: '[[35,7,4,-49,5,-4,31,-11,-48,-12,-27,14,41,6,-30,-48,8,-8,5,49],[42,-6,8,48,-2,-48,13,14,-28,25,-34,-26,2,24,-9,-14,36,27,31,26],[-34,-5,-35,10,28,-23,44,-11,16,41,-41,-22,-43,-19,-47,-34,-48,42,-31,-47],[13,22,41,5,24,4,44,39,29,40,34,49,-44,10,19,31,39,45,6,-11],[-5,-47,13,24,-25,22,5,19,-45,39,0,-29,-42,7,-14,5,-9,-46,27,49],[34,-39,45,-47,12,39,7,-8,-37,-13,45,3,8,5,4,31,9,3,1,17],[18,-10,-35,15,48,26,2,-3,44,-33,20,-17,-33,19,47,8,-35,-28,12,-4],[-39,-43,46,-8,-18,-3,31,35,15,-30,45,4,25,25,11,-36,-46,-17,-5,-5],[-47,36,-42,-25,-49,-7,-38,-23,-19,-6,-5,38,14,6,48,-44,24,35,36,1],[-25,38,41,-1,46,-2,-11,-47,45,44,15,42,12,-47,-16,-14,0,29,-42,11],[-15,34,-41,-11,14,-35,19,-12,-34,-46,13,-33,-19,-31,44,13,-7,11,-24,43],[12,-50,35,48,18,5,-20,22,32,7,11,30,-1,49,15,-19,36,-11,-43,-3],[28,-3,-30,42,19,1,-8,-9,19,47,-39,-29,-42,48,-20,26,12,-13,-46,-29],[11,8,0,-30,-25,40,-13,41,14,-47,49,33,30,-24,-32,1,-43,0,44,-19],[16,17,23,-11,7,6,12,-43,-29,27,-33,-10,-2,34,29,44,-4,-35,28,-26],[-8,27,-43,-21,20,-4,-36,-27,-22,-12,-3,49,1,-19,44,-10,2,1,-22,-45],[-10,-34,-12,-37,22,-18,-40,46,-28,9,32,17,-29,5,-38,-2,10,1,-25,-30],[26,-47,-49,4,-20,-24,20,43,-45,-23,20,-33,-30,25,-22,-50,-12,7,-37,28],[40,21,35,0,-15,-33,5,-40,44,-4,37,4,7,-46,-29,39,-41,-21,17,-9],[9,-22,19,-34,11,25,-5,-40,19,34,-20,28,-33,-22,-22,16,26,44,37,-6]]' },
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
