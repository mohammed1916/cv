import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SqlStages from './SqlStages'
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
  examples: [
    { label: 'Sample', input: sampleText },
    { label: 'One listen, no friends', input: '{"Listens":[{"user_id":1,"song_id":10,"day":"d1"}],"Friendship":[]}' },
    { label: 'Tied song and day for two friends', input: '{"Listens":[{"user_id":1,"song_id":10,"day":"d1"},{"user_id":2,"song_id":10,"day":"d1"}],"Friendship":[{"user1_id":1,"user2_id":2}]}' },
    { label: 'Long run: 60 listens and 30 friendships', input: '{"Listens":[{"user_id":13,"song_id":10,"day":"d7"},{"user_id":20,"song_id":9,"day":"d14"},{"user_id":3,"song_id":4,"day":"d9"},{"user_id":18,"song_id":7,"day":"d8"},{"user_id":9,"song_id":10,"day":"d27"},{"user_id":20,"song_id":1,"day":"d10"},{"user_id":15,"song_id":8,"day":"d9"},{"user_id":14,"song_id":3,"day":"d4"},{"user_id":1,"song_id":6,"day":"d3"},{"user_id":4,"song_id":5,"day":"d22"},{"user_id":3,"song_id":4,"day":"d17"},{"user_id":10,"song_id":11,"day":"d20"},{"user_id":13,"song_id":10,"day":"d19"},{"user_id":12,"song_id":5,"day":"d14"},{"user_id":19,"song_id":12,"day":"d17"},{"user_id":18,"song_id":11,"day":"d4"},{"user_id":5,"song_id":2,"day":"d15"},{"user_id":4,"song_id":1,"day":"d18"},{"user_id":7,"song_id":8,"day":"d21"},{"user_id":10,"song_id":3,"day":"d16"},{"user_id":13,"song_id":6,"day":"d23"},{"user_id":12,"song_id":5,"day":"d18"},{"user_id":19,"song_id":12,"day":"d21"},{"user_id":6,"song_id":3,"day":"d16"},{"user_id":1,"song_id":10,"day":"d15"},{"user_id":8,"song_id":5,"day":"d2"},{"user_id":14,"song_id":7,"day":"d16"},{"user_id":9,"song_id":2,"day":"d15"},{"user_id":8,"song_id":5,"day":"d10"},{"user_id":7,"song_id":4,"day":"d1"},{"user_id":18,"song_id":7,"day":"d16"},{"user_id":13,"song_id":10,"day":"d3"},{"user_id":4,"song_id":1,"day":"d22"},{"user_id":15,"song_id":8,"day":"d17"},{"user_id":18,"song_id":11,"day":"d28"},{"user_id":9,"song_id":2,"day":"d27"},{"user_id":12,"song_id":9,"day":"d26"},{"user_id":11,"song_id":12,"day":"d9"},{"user_id":14,"song_id":7,"day":"d4"},{"user_id":1,"song_id":10,"day":"d11"},{"user_id":12,"song_id":5,"day":"d10"},{"user_id":11,"song_id":4,"day":"d13"},{"user_id":18,"song_id":7,"day":"d12"},{"user_id":5,"song_id":6,"day":"d3"},{"user_id":16,"song_id":1,"day":"d22"},{"user_id":15,"song_id":12,"day":"d17"},{"user_id":6,"song_id":3,"day":"d24"},{"user_id":13,"song_id":6,"day":"d7"},{"user_id":12,"song_id":1,"day":"d2"},{"user_id":19,"song_id":4,"day":"d25"},{"user_id":14,"song_id":3,"day":"d20"},{"user_id":13,"song_id":6,"day":"d19"},{"user_id":20,"song_id":1,"day":"d14"},{"user_id":2,"song_id":3,"day":"d28"},{"user_id":9,"song_id":10,"day":"d15"},{"user_id":8,"song_id":9,"day":"d14"},{"user_id":3,"song_id":8,"day":"d13"},{"user_id":14,"song_id":3,"day":"d12"},{"user_id":5,"song_id":10,"day":"d19"},{"user_id":4,"song_id":5,"day":"d18"}],"Friendship":[{"user1_id":19,"user2_id":20},{"user1_id":17,"user2_id":14},{"user1_id":7,"user2_id":16},{"user1_id":9,"user2_id":10},{"user1_id":15,"user2_id":20},{"user1_id":13,"user2_id":10},{"user1_id":3,"user2_id":12},{"user1_id":17,"user2_id":10},{"user1_id":11,"user2_id":20},{"user1_id":1,"user2_id":14},{"user1_id":3,"user2_id":4},{"user1_id":5,"user2_id":6},{"user1_id":15,"user2_id":12},{"user1_id":9,"user2_id":18},{"user1_id":7,"user2_id":12},{"user1_id":3,"user2_id":20},{"user1_id":9,"user2_id":6},{"user1_id":3,"user2_id":8},{"user1_id":11,"user2_id":12},{"user1_id":17,"user2_id":6},{"user1_id":9,"user2_id":14},{"user1_id":7,"user2_id":8},{"user1_id":13,"user2_id":6},{"user1_id":1,"user2_id":18},{"user1_id":7,"user2_id":4},{"user1_id":19,"user2_id":12},{"user1_id":11,"user2_id":8},{"user1_id":15,"user2_id":4},{"user1_id":19,"user2_id":16},{"user1_id":13,"user2_id":14}]}' },
  ],
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
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <SqlStages code={code} activeLine={step.activeLine} />
    <CurrentTable table={step.table} />
  </>} renderReasoning={() => <>
    <p>Count the distinct songs each pair of users shares on each day. A pair qualifies with three or more shared songs on at least one day.</p>
    <p>The output keeps only qualifying pairs that are already friends. Friendships are stored in either order, so each one is first written with the smaller id, which keeps the output free of duplicates.</p>
  </>} />
}
