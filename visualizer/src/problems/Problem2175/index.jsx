import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python, phases, sample } from './algorithm'
import { meta } from './meta'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Teams and point changes as JSON: {"team_points":[...],"points_change":[...]}',
  url: 'https://leetcode.com/problems/the-change-in-global-rankings/',
  complexity: 'Knowledge-derived walkthrough: two rankings of at most 10 teams, joined by team.',
  examples: [{ label: 'Sample tables', input: JSON.stringify(sample) }],
}

function RowTable({ rows, label }) {
  if (!rows.length) return <p>No rows yet.</p>
  const columns = Object.keys(rows[0])
  return <table aria-label={label}>
    <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
    <tbody>{rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column}>{String(row[column] ?? '')}</td>)}</tr>)}</tbody>
  </table>
}

export default function ChangeInGlobalRankings() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <h3>Working table</h3>
    <RowTable rows={step.rows} label={`${meta.title} working table`} />
  </>} renderReasoning={() => <>
    <p>Knowledge-derived walkthrough written for this visualizer. The sample tables are invented.</p>
    <p>The ranking is done twice: once before the changes and once after. A tie in points is broken by name in both rankings.</p>
    <p>A positive rank difference means the team climbed, because its old rank number was larger than its new one.</p>
  </>} />
}
