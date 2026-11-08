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
  inputLabel: 'Votes as JSON',
  url: 'https://leetcode.com/problems/election-results/',
  complexity: 'Walkthrough: distinct picks, equal shares, then tie-aware maximum.',
  examples: [{ label: 'Sample tables', input: JSON.stringify(sample) },
    { label: "Single vote", input: "{\"votes\":[{\"voter\":\"A\",\"candidate\":\"X\"}]}" },
    { label: "Tie between candidates", input: "{\"votes\":[{\"voter\":\"A\",\"candidate\":\"X\"},{\"voter\":\"B\",\"candidate\":\"Y\"}]}" },
    { label: "Only empty candidates", input: "{\"votes\":[{\"voter\":\"A\",\"candidate\":null},{\"voter\":\"B\",\"candidate\":null}]}" },
    { label: "Long run: 12 seeded votes", input: "{\"votes\":[{\"voter\":\"V4\",\"candidate\":\"Z\"},{\"voter\":\"V3\",\"candidate\":\"X\"},{\"voter\":\"V1\",\"candidate\":\"Z\"},{\"voter\":\"V3\",\"candidate\":\"X\"},{\"voter\":\"V3\",\"candidate\":\"Z\"},{\"voter\":\"V5\",\"candidate\":\"X\"},{\"voter\":\"V1\",\"candidate\":\"Z\"},{\"voter\":\"V5\",\"candidate\":\"X\"},{\"voter\":\"V4\",\"candidate\":\"Z\"},{\"voter\":\"V1\",\"candidate\":\"X\"},{\"voter\":\"V1\",\"candidate\":\"Z\"},{\"voter\":\"V4\",\"candidate\":\"X\"}]}" },],
}

function RowTable({ rows }) {
  if (!rows.length) return <p>No rows yet.</p>
  const columns = Object.keys(rows[0])
  return <table>
    <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
    <tbody>{rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column}>{String(row[column] ?? '')}</td>)}</tr>)}</tbody>
  </table>
}

export default function ElectionResults() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <SqlStageBoard title={`${meta.title}: query stages`} stages={stagesOf(run)} active={run.frames.indexOf(step)} />} renderReasoning={() => <>
    <p>Walkthrough of the query with invented sample tables.</p>
    <p>Each voter spends one vote, split across their distinct candidates.</p>
    <p>Empty choices are dropped before counting, so they never take a share.</p>
  </>} />
}
