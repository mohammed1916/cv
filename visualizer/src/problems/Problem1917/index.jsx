import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, sampleText } from './algorithm'

const definition = {
  phases: [
    { id: 'load', label: 'Load', description: 'Read every listen row.' },
    { id: 'pair', label: 'Pair', description: 'Count the distinct songs two users share on one day.' },
    { id: 'filter', label: 'Filter', description: 'Keep pairs with three shared songs on a day that are not friends.' },
    { id: 'direction', label: 'Direction', description: 'Recommend each pair in both directions.' },
    { id: 'done', label: 'Result', description: 'Report the directed recommendations.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with a Listens list (user_id, song_id, day) and a Friendship list (user1_id, user2_id)',
  url: 'https://leetcode.com/problems/leetcodify-friends-recommendations/',
  complexity: 'O(s * u^2) in the worst case for s song-day groups with u listeners, plus a sort of the recommendations.',
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

export default function LeetcodifyFriendsRecommendations() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <CurrentTable table={step.table} />} renderReasoning={() => <>
    <p>Only songs heard on the same day count. Two users share a day when they both listened to a song on that day.</p>
    <p>For each pair, count the distinct songs they share on each day. A pair qualifies with three or more on at least one day. Friends are removed, and each remaining pair is written in both directions.</p>
  </>} />
}
