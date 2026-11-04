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
  inputLabel: 'Flights and bookings as JSON',
  url: 'https://leetcode.com/problems/status-of-flight-tickets/',
  complexity: 'Walkthrough: one ordering by flight and time, then a row-number check.',
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
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <SqlStageBoard title={`${meta.title}: query stages`} stages={stagesOf(run)} active={run.frames.indexOf(step)} />} renderReasoning={() => <>
    <p>Walkthrough of the query with invented sample tables.</p>
    <p>Bookings are numbered in time order within each flight.</p>
    <p>A booking is confirmed when its arrival number is no more than the flight capacity.</p>
  </>} />
}
