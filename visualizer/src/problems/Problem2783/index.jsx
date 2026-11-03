import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python, phases, sample } from './algorithm'
import { meta } from './meta'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Flights and passengers as JSON',
  url: 'https://leetcode.com/problems/flight-occupancy-and-waitlist-analysis/',
  complexity: 'Knowledge-derived walkthrough: one count per flight, then a clamp against capacity.',
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

export default function FlightOccupancy() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <h3>{meta.title}: working table</h3>
    <RowTable rows={step.rows} />
  </>} renderReasoning={() => <>
    <p>Knowledge-derived walkthrough written for this visualizer. The sample tables are invented.</p>
    <p>A flight with no passengers still appears, because the join starts from the flights table.</p>
    <p>Booked seats are the smaller of the count and the capacity; the rest are waitlisted.</p>
  </>} />
}
