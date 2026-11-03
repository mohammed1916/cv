import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const cell = { border: '1px solid currentColor', padding: '4px 8px', textAlign: 'left' }

function Grid({ rows }) {
  if (!rows.length) return <p>No rows yet.</p>
  const columns = Object.keys(rows[0])
  return <table style={{ borderCollapse: 'collapse' }}>
    <thead><tr>{columns.map(column => <th key={column} scope="col" style={cell}>{column}</th>)}</tr></thead>
    <tbody>{rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column} style={cell}>{String(row[column])}</td>)}</tr>)}</tbody>
  </table>
}

const definition = {
  phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'JSON object with a students list (student_id, bench_id)',
  url: 'https://leetcode.com/problems/maximum-students-on-a-single-bench/description/',
  complexity: 'O(n) time for n rows with a hash set for the pairs. The rule is a knowledge-derived teaching version.',
  examples: [
    { label: 'Example', input: '{"students":[{"student_id":1,"bench_id":"A"},{"student_id":2,"bench_id":"A"},{"student_id":1,"bench_id":"A"},{"student_id":3,"bench_id":"B"},{"student_id":4,"bench_id":"B"},{"student_id":2,"bench_id":"B"},{"student_id":5,"bench_id":"C"}]}' },
    { label: 'Empty', input: '{"students":[]}' },
  ],
}

export default function Problem3450() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    {Object.entries(run.input).map(([name, rows]) => <section key={name}><h3>{name} (input)</h3><Grid rows={rows} /></section>)}
    <section><h3>Working rows</h3><Grid rows={step.rows} /></section>
    <output aria-label="Result">{`Largest bench count: ${run.result[0].max_students}`}</output>
  </>} renderReasoning={() => <>
    <p>A student may appear several times on the same bench, so each (student, bench) pair is kept once before counting.</p>
    <p>Grouping by bench then gives a distinct count per bench, and the answer is the largest of those counts.</p>
  </>} />
}
