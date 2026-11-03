import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { sql, code, python, phases, inputLabel, complexity, examples, buildTrace, parseInput } from './algorithm'

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
      <tbody>{rows.map((row, index) => <tr key={index} style={{ opacity: row.status === 'dropped' ? 0.5 : 1 }}>
        {columns.map(column => <td key={column}>{String(row[column] ?? '')}</td>)}
      </tr>)}</tbody>
    </table>
  </div>
}

export default function InvalidTweets() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output ids: ${run.result.join(', ') || 'none'}` : `Kept so far: ${step.kept.join(', ') || 'none'}`}</output>
  </>} renderReasoning={() => <>
    <p><strong>Filter each row:</strong> the WHERE clause decides row by row, so the length of the content is the only thing that matters.</p>
    <p><strong>Boundary:</strong> the rule is a strict comparison, so content of exactly fifteen characters is dropped.</p>
  </>} />
}
