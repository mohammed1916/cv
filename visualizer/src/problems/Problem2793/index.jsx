import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python, phases, sample } from './algorithm'
import { meta } from './meta'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Flights and bookings as JSON',
  url: 'https://leetcode.com/problems/status-of-flight-tickets/',
  complexity: 'Knowledge-derived walkthrough: one ordering by flight and time, then a row-number check.',
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

export default function TicketStatus() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <h3>{meta.title}: working table</h3>
    <RowTable rows={step.rows} />
  </>} renderReasoning={() => <>
    <p>Knowledge-derived walkthrough written for this visualizer. The sample tables are invented.</p>
    <p>Bookings are numbered in time order within each flight.</p>
    <p>A booking is confirmed when its arrival number is no more than the flight capacity.</p>
  </>} />
}
