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
  inputLabel: 'Users and rides as JSON',
  url: 'https://leetcode.com/problems/total-traveled-distance/',
  complexity: 'Walkthrough: one left join and one sum per user.',
  examples: [{ label: 'Sample tables', input: JSON.stringify(sample) },
    { label: "User with no rides", input: "{\"users\":[{\"user_id\":9,\"name\":\"Dan\"}],\"rides\":[]}" },
    { label: "Equal distances", input: "{\"users\":[{\"user_id\":1,\"name\":\"Ann\"},{\"user_id\":2,\"name\":\"Ben\"}],\"rides\":[{\"ride_id\":1,\"user_id\":1,\"distance\":50},{\"ride_id\":2,\"user_id\":2,\"distance\":50}]}" },
    { label: "Zero distance ride", input: "{\"users\":[{\"user_id\":1,\"name\":\"Eve\"}],\"rides\":[{\"ride_id\":1,\"user_id\":1,\"distance\":0}]}" },
    { label: "Long run: 12 seeded rides", input: "{\"users\":[{\"user_id\":1,\"name\":\"U1\"},{\"user_id\":2,\"name\":\"U2\"},{\"user_id\":3,\"name\":\"U3\"},{\"user_id\":4,\"name\":\"U4\"}],\"rides\":[{\"ride_id\":1,\"user_id\":3,\"distance\":294},{\"ride_id\":2,\"user_id\":4,\"distance\":127},{\"ride_id\":3,\"user_id\":1,\"distance\":19},{\"ride_id\":4,\"user_id\":2,\"distance\":179},{\"ride_id\":5,\"user_id\":3,\"distance\":181},{\"ride_id\":6,\"user_id\":4,\"distance\":286},{\"ride_id\":7,\"user_id\":1,\"distance\":114},{\"ride_id\":8,\"user_id\":2,\"distance\":250},{\"ride_id\":9,\"user_id\":3,\"distance\":58},{\"ride_id\":10,\"user_id\":4,\"distance\":153},{\"ride_id\":11,\"user_id\":1,\"distance\":107},{\"ride_id\":12,\"user_id\":2,\"distance\":88}]}" },],
}

function RowTable({ rows }) {
  if (!rows.length) return <p>No rows yet.</p>
  const columns = Object.keys(rows[0])
  return <table>
    <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
    <tbody>{rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column}>{String(row[column] ?? '')}</td>)}</tr>)}</tbody>
  </table>
}

export default function TraveledDistance() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <SqlStageBoard title={`${meta.title}: query stages`} stages={stagesOf(run)} active={run.frames.indexOf(step)} />} renderReasoning={() => <>
    <p>Walkthrough of the query with invented sample tables.</p>
    <p>A left join keeps users with no rides, and their empty sum becomes zero.</p>
    <p>Sorting by user id gives a stable output order.</p>
  </>} />
}
