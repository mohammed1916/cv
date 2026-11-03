import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python, phases, sample } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Employee table as JSON',
  url: 'https://leetcode.com/problems/find-the-team-size/',
  complexity: 'Knowledge-derived walkthrough: one count per team, then one lookup per employee.',
  examples: [{ label: 'Sample employees', input: JSON.stringify(sample) }],
}

function RowTable({ rows }) {
  if (!rows.length) return <p>No rows yet.</p>
  const columns = Object.keys(rows[0])
  return <table>
    <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
    <tbody>{rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column}>{String(row[column] ?? '')}</td>)}</tr>)}</tbody>
  </table>
}

export default function FindTheTeamSize() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <h3>Team sizes</h3>
    <RowTable rows={step.rows} />
  </>} renderReasoning={() => <>
    <p>Knowledge-derived walkthrough written for this visualizer. The table is invented.</p>
    <p>The team size is computed once per team and then reused for every employee on that team.</p>
    <p>A team of one still reports a size of one.</p>
  </>} />
}
