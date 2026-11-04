import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SqlStageBoard from './SqlStageBoard'
import { buildTrace, parseInput, code, sql, python, phases, sample } from './algorithm'
import { meta } from './meta'

const stagesOf = run => run.frames.map(f => ({
  id: f.phase, clause: code[f.activeLine - 1]?.text.trim() ?? '', label: phases.find(p => p.id === f.phase)?.label ?? f.phase,
  columns: f.columns, rows: f.rows,
}))

const definition = {
  phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Flights and passengers as JSON',
  url: 'https://leetcode.com/problems/flight-occupancy-and-waitlist-analysis/',
  complexity: 'Walkthrough: one count per flight, then a clamp against capacity.',
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
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <SqlStageBoard title={`${meta.title}: query stages`} stages={stagesOf(run)} active={run.frames.indexOf(step)} />} renderReasoning={() => <>
    <p>Walkthrough of the query with invented sample tables.</p>
    <p>A flight with no passengers still appears, because the join starts from the flights table.</p>
    <p>Booked seats are the smaller of the count and the capacity; the rest are waitlisted.</p>
  </>} />
}
