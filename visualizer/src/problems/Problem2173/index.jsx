import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python, phases, sample } from './algorithm'
import { meta } from './meta'
import StreakRunView from './StreakRunView'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Matches as JSON: {"matches":[{"player_id","match_day","result"}]}',
  url: 'https://leetcode.com/problems/longest-winning-streak/',
  complexity: 'One ordering of the matches, then one pass per player: O(m log m) for m matches, plus a linear walk.',
  examples: [
    { label: 'Sample matches', input: JSON.stringify(sample) },
    { label: 'No matches', input: '{"matches":[]}' },
    { label: 'One match', input: '{"matches":[{"player_id":1,"match_day":1,"result":"Win"}]}' },
    { label: 'Equal results for two players', input: '{"matches":[{"player_id":1,"match_day":1,"result":"Win"},{"player_id":2,"match_day":1,"result":"Win"}]}' },
    { label: 'Twenty matches, one player', input: '{"matches":[{"player_id":1,"match_day":1,"result":"Win"},{"player_id":1,"match_day":2,"result":"Draw"},{"player_id":1,"match_day":3,"result":"Lose"},{"player_id":1,"match_day":4,"result":"Win"},{"player_id":1,"match_day":5,"result":"Draw"},{"player_id":1,"match_day":6,"result":"Lose"},{"player_id":1,"match_day":7,"result":"Win"},{"player_id":1,"match_day":8,"result":"Draw"},{"player_id":1,"match_day":9,"result":"Lose"},{"player_id":1,"match_day":10,"result":"Win"},{"player_id":1,"match_day":11,"result":"Draw"},{"player_id":1,"match_day":12,"result":"Lose"},{"player_id":1,"match_day":13,"result":"Win"},{"player_id":1,"match_day":14,"result":"Draw"},{"player_id":1,"match_day":15,"result":"Lose"},{"player_id":1,"match_day":16,"result":"Win"},{"player_id":1,"match_day":17,"result":"Draw"},{"player_id":1,"match_day":18,"result":"Lose"},{"player_id":1,"match_day":19,"result":"Win"},{"player_id":1,"match_day":20,"result":"Draw"}]}' },
    { label: 'Long run: 20 matches', input: '{"matches":[{"player_id":1,"match_day":1,"result":"Win"},{"player_id":2,"match_day":1,"result":"Draw"},{"player_id":3,"match_day":1,"result":"Lose"},{"player_id":4,"match_day":1,"result":"Draw"},{"player_id":1,"match_day":2,"result":"Win"},{"player_id":2,"match_day":2,"result":"Win"},{"player_id":3,"match_day":2,"result":"Draw"},{"player_id":4,"match_day":2,"result":"Win"},{"player_id":1,"match_day":3,"result":"Lose"},{"player_id":2,"match_day":3,"result":"Lose"},{"player_id":3,"match_day":3,"result":"Lose"},{"player_id":4,"match_day":3,"result":"Lose"},{"player_id":1,"match_day":4,"result":"Lose"},{"player_id":2,"match_day":4,"result":"Draw"},{"player_id":3,"match_day":4,"result":"Draw"},{"player_id":4,"match_day":4,"result":"Draw"},{"player_id":1,"match_day":5,"result":"Win"},{"player_id":2,"match_day":5,"result":"Win"},{"player_id":3,"match_day":5,"result":"Draw"},{"player_id":4,"match_day":5,"result":"Lose"}]}' },
  ],
}

function RowTable({ rows, label }) {
  if (!rows.length) return <p>No rows yet.</p>
  const columns = Object.keys(rows[0])
  return <table aria-label={label}>
    <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
    <tbody>{rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column}>{String(row[column] ?? '')}</td>)}</tr>)}</tbody>
  </table>
}

export default function LongestWinningStreak() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <StreakRunView run={run} step={step} phases={phases} />
    <h3>Working table</h3>
    <RowTable rows={step.rows} label={`${meta.title} working table`} />
  </>} renderReasoning={() => <>
    <p>This walkthrough uses invented sample matches.</p>
    <p>Only the player’s own matches count, so a day with no match is skipped rather than breaking the run.</p>
    <p>A win adds one to the current streak; a draw or loss resets it to zero. The longest value seen is kept for each player.</p>
  </>} />
}
