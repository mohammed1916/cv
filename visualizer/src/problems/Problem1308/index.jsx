import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python, phases, sample } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Score rows as JSON',
  url: 'https://leetcode.com/problems/running-total-for-different-genders/',
  complexity: 'Knowledge-derived walkthrough: one pass to group by gender and day, then one running sum per gender.',
  examples: [{ label: 'Sample scores', input: JSON.stringify(sample) }],
}

function RowTable({ rows }) {
  if (!rows.length) return <p>No rows yet.</p>
  const columns = Object.keys(rows[0])
  return <table>
    <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
    <tbody>{rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column}>{String(row[column] ?? '')}</td>)}</tr>)}</tbody>
  </table>
}

export default function RunningTotalForDifferentGenders() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <h3>Daily and running totals</h3>
    <RowTable rows={step.rows} />
  </>} renderReasoning={() => <>
    <p>Knowledge-derived walkthrough written for this visualizer. The scores are invented.</p>
    <p>Several players can score on the same day, so the rows are first summed per gender and day.</p>
    <p>The running total then restarts for each gender and only moves forward through the dates.</p>
  </>} />
}
