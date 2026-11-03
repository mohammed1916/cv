import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with a Candidates table'
const complexity = 'O(r log r) for r skill rows, dominated by sorting the candidate ids. The visualizer caps Candidates at 12 rows.'
const examples = [{
  label: 'Sample',
  input: '{"Candidates":[{"candidate_id":1,"skill":"Python"},{"candidate_id":1,"skill":"Tableau"},{"candidate_id":1,"skill":"PostgreSQL"},{"candidate_id":2,"skill":"Python"},{"candidate_id":3,"skill":"PostgreSQL"},{"candidate_id":3,"skill":"Tableau"},{"candidate_id":3,"skill":"Python"},{"candidate_id":4,"skill":"Python"},{"candidate_id":4,"skill":"Tableau"},{"candidate_id":4,"skill":"PostgreSQL"},{"candidate_id":5,"skill":"Python"},{"candidate_id":5,"skill":"Python"}]}',
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
  </>} renderReasoning={() => <p>Rows that name other skills are ignored. Each candidate is then counted by distinct required skill, so a repeated skill does not count twice, and only candidates with all three remain.</p>} />
}
