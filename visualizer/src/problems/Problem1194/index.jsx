import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python, phases, sample } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Players and matches as JSON',
  url: 'https://leetcode.com/problems/tournament-winners/',
  complexity: 'Knowledge-derived walkthrough: one pass over the matches plus a sort of the players.',
  examples: [{ label: 'Sample tables', input: JSON.stringify(sample) }],
}

function RowTable({ rows }) {
  if (!rows.length) return <p>No rows yet.</p>
  const columns = Object.keys(rows[0])
  return <table>
    <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
    <tbody>{rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column}>{String(row[column] ?? '')}</td>)}</tr>)}</tbody>
  </table>
}

export default function TournamentWinners() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <h3>Working table</h3>
    <RowTable rows={step.rows} />
  </>} renderReasoning={() => <>
    <p>Knowledge-derived walkthrough written for this visualizer. The sample tables are invented.</p>
    <p>A player appears on both sides of a match, so the points query stacks the first and second positions before summing.</p>
    <p>Players with no matches still appear, because the join starts from the players table and fills missing sums with zero.</p>
  </>} />
}
