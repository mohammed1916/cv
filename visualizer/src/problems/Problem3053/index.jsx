import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with a Triangles table'
const complexity = 'O(t) for t rows, with a constant number of comparisons per row. The visualizer caps Triangles at 12 rows.'
const examples = [{
  label: 'Sample',
  input: '{"Triangles":[{"A":7,"B":7,"C":7},{"A":6,"B":8,"C":8},{"A":4,"B":9,"C":6},{"A":2,"B":3,"C":9},{"A":6,"B":6,"C":12}]}',
}]

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, sql, python, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity, examples,
}

function Rows({ columns = [], rows = [] }) {
  return <div style={{ overflowX: 'auto' }}>
    <table>
      <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
      <tbody>{rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column}>{String(row[column] ?? '')}</td>)}</tr>)}</tbody>
    </table>
  </div>
}

export default function KnowledgeDerivedSqlVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <p>The CASE expression tests the triangle inequality first, because a set of lengths that cannot close a triangle is labelled Not A Triangle whatever its equal sides. Only then are equal sides counted.</p>} />
}
