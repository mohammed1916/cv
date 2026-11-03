import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const cell = { border: '1px solid currentColor', padding: '4px 8px', textAlign: 'left' }

function RowTable({ label, columns = [], rows = [] }) {
  return <div>
    <p><strong>{label}</strong></p>
    <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14 }}>
      <thead><tr>{columns.map(column => <th key={column} style={cell}>{column}</th>)}</tr></thead>
      <tbody>{rows.length ? rows.map((row, index) => <tr key={index}>
        {columns.map(column => <td key={column} style={cell}>{String(row[column] ?? '')}</td>)}
      </tr>) : <tr><td style={cell} colSpan={Math.max(1, columns.length)}>No rows yet</td></tr>}</tbody>
    </table>
  </div>
}

const definition = {
  phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Object with friendship (user1_id, user2_id) and likes (user_id, page_id); the target user is 1',
  url: 'https://leetcode.com/problems/page-recommendations/',
  complexity: 'O(F + L) with sets for F friendships and L likes. The visualization caps each list at 12 rows.',
  examples: [
    { label: 'Friends of user 1', input: '{"friendship":[{"user1_id":1,"user2_id":2},{"user1_id":3,"user2_id":1},{"user1_id":2,"user2_id":4},{"user1_id":5,"user2_id":6}],"likes":[{"user_id":1,"page_id":10},{"user_id":2,"page_id":20},{"user_id":3,"page_id":20},{"user_id":3,"page_id":30},{"user_id":4,"page_id":40},{"user_id":4,"page_id":10},{"user_id":5,"page_id":50}]}' },
    { label: 'No friends', input: '{"friendship":[{"user1_id":7,"user2_id":8}],"likes":[{"user_id":8,"page_id":70}]}' },
  ],
}

export default function PageRecommendations() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <RowTable label={`Working rows (${step.phase})`} columns={step.columns} rows={step.rows} />
    {step.phase === 'done' && <RowTable label="Result" columns={run.columns} rows={run.result} />}
  </>} renderReasoning={() => <>
    <p>Friendships are stored once, so user 1 can appear on either side. Both directions must be read to find every direct friend.</p>
    <p>Friends only reach user 1 in one hop: a friend of a friend is not a candidate. Pages user 1 already likes are removed before the result is reported.</p>
  </>} />
}
