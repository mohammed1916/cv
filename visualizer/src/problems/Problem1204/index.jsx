import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python, phases, sample } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Queue as JSON',
  url: 'https://leetcode.com/problems/last-person-to-fit-in-the-bus/',
  complexity: 'Knowledge-derived walkthrough: one running sum over the queue in boarding order.',
  examples: [{ label: 'Sample queue', input: JSON.stringify(sample) }],
}

function RowTable({ rows }) {
  if (!rows.length) return <p>No rows yet.</p>
  const columns = Object.keys(rows[0])
  return <table>
    <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
    <tbody>{rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column}>{String(row[column] ?? '')}</td>)}</tr>)}</tbody>
  </table>
}

export default function LastPersonToFitInTheBus() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <h3>Boarding so far</h3>
    <RowTable rows={step.rows} />
  </>} renderReasoning={() => <>
    <p>Knowledge-derived walkthrough written for this visualizer. The queue is invented.</p>
    <p>Boarding is strictly in turn order, so the running total only grows. The first overflow ends the search, and no later lighter person can jump ahead.</p>
  </>} />
}
