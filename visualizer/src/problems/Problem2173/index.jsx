import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python, phases, sample } from './algorithm'
import { meta } from './meta'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Matches as JSON: {"matches":[{"player_id","match_day","result"}]}',
  url: 'https://leetcode.com/problems/longest-winning-streak/',
  complexity: 'Knowledge-derived walkthrough: one ordering of the matches, then one pass per player.',
  examples: [{ label: 'Sample matches', input: JSON.stringify(sample) }],
}

function RowTable({ rows, label }) {
  if (!rows.length) return <p>No rows yet.</p>
  const columns = Object.keys(rows[0])
  return <table aria-label={label}>
    <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
    <tbody>{rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column}>{String(row[column] ?? '')}</td>)}</tr>)}</tbody>
  </table>
}

export default function LongestWinningStreak() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <h3>Working table</h3>
    <RowTable rows={step.rows} label={`${meta.title} working table`} />
  </>} renderReasoning={() => <>
    <p>Knowledge-derived walkthrough written for this visualizer. The sample matches are invented.</p>
    <p>Only the player’s own matches count, so a day with no match is skipped rather than breaking the run.</p>
    <p>A win adds one to the current streak; a draw or loss resets it to zero. The longest value seen is kept for each player.</p>
  </>} />
}
