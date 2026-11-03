import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1667',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Rows as JSON: [{"user_id": integer, "name": letters}, ...]',
  url: 'https://leetcode.com/problems/fix-names-in-a-table/',
  complexity: 'Teaching model of the SQL rewrite: one pass over the rows plus a sort by user_id. The rows here are JavaScript objects, not a database table.',
  examples: [
    { label: 'Mixed case', input: '[{"user_id":9,"name":"mARIA"},{"user_id":2,"name":"tom"},{"user_id":5,"name":"JOHN"}]' },
    { label: 'Single letter', input: '[{"user_id":4,"name":"x"},{"user_id":1,"name":"yusuf"}]' },
  ],
}

export default function FixNamesInTable() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { index, output, original, fixed } = step.snapshot
    return <>
      <table aria-label="Input rows" style={{ fontFamily: 'monospace', borderCollapse: 'collapse', marginBottom: 12 }}>
        <thead><tr><th>user_id</th><th>name as stored</th></tr></thead>
        <tbody>{run.input.map((row, i) => <tr key={row.user_id} style={{ background: i === index ? 'var(--surface2)' : 'transparent' }}>
          <td>{row.user_id}</td><td>{row.name}</td></tr>)}</tbody>
      </table>
      <table aria-label="Output rows" style={{ fontFamily: 'monospace', borderCollapse: 'collapse' }}>
        <thead><tr><th>user_id</th><th>name</th></tr></thead>
        <tbody>{output.length === 0 ? <tr><td colSpan={2}>empty</td></tr> : output.map(row => <tr key={row.user_id}>
          <td>{row.user_id}</td><td>{row.name}</td></tr>)}</tbody>
      </table>
      {fixed && <p>{original} becomes {fixed}.</p>}
    </>
  }} renderReasoning={() => <>
    <p><strong>Rewrite:</strong> the first character is uppercased and the rest lowercased, so every name uses the same casing.</p>
    <p><strong>Order:</strong> the result is sorted by user_id, the only ordering the task asks for.</p>
  </>} />
}
