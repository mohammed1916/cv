import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, sampleText } from './algorithm'

const definition = {
  phases: [
    { id: 'load', label: 'Load', description: 'Read every listen row.' },
    { id: 'pair', label: 'Pair', description: 'Count the distinct songs two users share on one day.' },
    { id: 'filter', label: 'Filter', description: 'Keep pairs with three shared songs on some day.' },
    { id: 'friends', label: 'Friends', description: 'Write each friendship with the smaller id first.' },
    { id: 'done', label: 'Result', description: 'Keep qualifying pairs that are friends.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with a Listens list (user_id, song_id, day) and a Friendship list (user1_id, user2_id)',
  url: 'https://leetcode.com/problems/leetcodify-similar-friends/',
  complexity: 'O(s * u^2) in the worst case for s song-day groups with u listeners, plus a sort of the friend pairs.',
  examples: [{ label: 'Sample', input: sampleText }],
}

function CurrentTable({ table }) {
  return <div style={{ overflowX: 'auto' }} role="region" aria-label="Current rows">
    <table>
      <thead><tr>{table.columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
      <tbody>{table.rows.length
        ? table.rows.map((row, index) => <tr key={index}>{table.columns.map(column => <td key={column}>{String(row[column])}</td>)}</tr>)
        : <tr><td colSpan={table.columns.length}>No rows yet</td></tr>}</tbody>
    </table>
  </div>
}

export default function LeetcodifySimilarFriends() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <CurrentTable table={step.table} />} renderReasoning={() => <>
    <p>Count the distinct songs each pair of users shares on each day. A pair qualifies with three or more shared songs on at least one day.</p>
    <p>The output keeps only qualifying pairs that are already friends. Friendships are stored in either order, so each one is first written with the smaller id, which keeps the output free of duplicates.</p>
  </>} />
}
