import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const cell = { border: '1px solid currentColor', padding: '4px 8px', textAlign: 'left' }

function RowTable({ label, columns = [], rows = [] }) {
  return <div>
    <p><strong>{label}</strong></p>
    <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14 }}>
      <thead><tr>{columns.map(column => <th key={column} style={cell}>{column}</th>)}</tr></thead>
      <tbody>{rows.length ? rows.map((row, index) => <tr key={index}>
        {columns.map(column => <td key={column} style={cell}>{String(row[column] ?? 'NULL')}</td>)}
      </tr>) : <tr><td style={cell} colSpan={Math.max(1, columns.length)}>No rows yet</td></tr>}</tbody>
    </table>
  </div>
}

const definition = {
  phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Object with submissions (sub_id, parent_id); parent_id null marks a post',
  url: 'https://leetcode.com/problems/number-of-comments-per-post/',
  complexity: 'O(n) after removing duplicates for n rows. The visualization caps the table at 12 rows.',
  examples: [
    { label: 'Posts and replies', input: '{"submissions":[{"sub_id":1,"parent_id":null},{"sub_id":2,"parent_id":null},{"sub_id":3,"parent_id":1},{"sub_id":4,"parent_id":1},{"sub_id":3,"parent_id":1},{"sub_id":5,"parent_id":2},{"sub_id":6,"parent_id":null}]}' },
    { label: 'Single post', input: '{"submissions":[{"sub_id":9,"parent_id":null}]}' },
  ],
}

export default function NumberOfCommentsPerPost() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <RowTable label={`Working table (${step.phase})`} columns={step.columns} rows={step.rows} />
    {step.phase === 'done' && <RowTable label="Result" columns={run.columns} rows={run.result} />}
  </>} renderReasoning={() => <>
    <p>A post is a row with no parent. Each reply is matched to its post by parent_id, and a reply that appears twice is counted once.</p>
    <p>Starting every post at zero and then adding matched replies keeps posts with no comments in the output.</p>
  </>} />
}
