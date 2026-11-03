import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python, phases, sample } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Log ids as JSON',
  url: 'https://leetcode.com/problems/find-the-start-and-end-number-of-continuous-ranges/',
  complexity: 'Knowledge-derived walkthrough: one sort, then one pass that either extends or closes the current run.',
  examples: [{ label: 'Sample ids', input: JSON.stringify(sample) }],
}

function RowTable({ rows }) {
  if (!rows.length) return <p>No rows yet.</p>
  const columns = Object.keys(rows[0])
  return <table>
    <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
    <tbody>{rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column}>{String(row[column] ?? '')}</td>)}</tr>)}</tbody>
  </table>
}

export default function FindTheStartAndEndNumberOfContinuousRanges() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <h3>Ids and runs</h3>
    <RowTable rows={step.rows} />
  </>} renderReasoning={() => <>
    <p>Knowledge-derived walkthrough written for this visualizer. The ids are invented.</p>
    <p>Once the ids are sorted, a run is unbroken exactly when each id is one more than the one before it.</p>
    <p>The SQL version uses the classic trick of subtracting the row number: consecutive ids share the same difference, which becomes the group key.</p>
  </>} />
}
