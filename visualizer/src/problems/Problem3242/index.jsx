import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'build', label: 'Build', description: 'Record the row and column of every value.' },
    { id: 'locate', label: 'Locate', description: 'Find the cell holding the queried value.' },
    { id: 'sum', label: 'Sum', description: 'Add the values in the chosen neighbour cells.' },
    { id: 'done', label: 'Answers', description: 'Every query has an answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with grid (square, distinct values) and calls ([method, value] pairs)',
  url: 'https://leetcode.com/problems/design-neighbor-sum-service/description/',
  complexity: 'O(n^2) to build the position table, O(1) per query.',
  examples: [
    { label: 'Example', input: '{"grid":[[5,1,6],[2,8,3],[7,0,4]],"calls":[["adjacentSum",8],["diagonalSum",3]]}' },
    { label: 'Corner', input: '{"grid":[[4,0,3,8],[1,6,2,7],[5,9,10,11],[12,13,14,15]],"calls":[["diagonalSum",0],["adjacentSum",15]]}' },
  ],
}

export default function DesignNeighborSumService() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const n = run.input.grid.length
    const isNeighbour = (r, c) => (step.neighbours || []).some(x => x.at[0] === r && x.at[1] === c)
    const isCell = (r, c) => step.cell && step.cell[0] === r && step.cell[1] === c
    return <>
      <div role="table" aria-label="Grid" style={{ display: 'grid', gridTemplateColumns: `repeat(${n}, 56px)`, gap: 6, margin: '12px 0' }}>
        {run.input.grid.flatMap((row, r) => row.map((v, c) => <div key={`${r}-${c}`} role="cell" style={{ height: 56, display: 'grid', placeItems: 'center', borderRadius: 6, border: '2px solid #be185d', background: isCell(r, c) ? '#be185d' : isNeighbour(r, c) ? 'rgba(190,24,93,0.25)' : 'transparent', color: isCell(r, c) ? '#fff' : 'inherit', fontWeight: 600 }}>{v}</div>))}
      </div>
      <output aria-label="Neighbour sums">{`answers: ${step.answers.map(a => (a === null ? 'null' : a)).join(', ')}${step.sum !== null && step.sum !== undefined ? ` (this sum: ${step.sum})` : ''}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>The grid never changes, so the only expensive part, finding a value, is done once when the object is built.</p>
    <p>Each query then looks at at most eight cells around one position, and checks the bounds before reading each one.</p>
  </>} />
}
