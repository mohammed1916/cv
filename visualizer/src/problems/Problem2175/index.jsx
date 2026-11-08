import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python, phases, sample } from './algorithm'
import { meta } from './meta'
import RankShiftView from './RankShiftView'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Teams and point changes as JSON: {"team_points":[...],"points_change":[...]}',
  url: 'https://leetcode.com/problems/the-change-in-global-rankings/',
  complexity: 'Two rankings of at most 10 teams, joined by team: O(t log t) for t teams.',
  examples: [
    { label: 'Sample tables', input: JSON.stringify(sample) },
    { label: 'One team, no change', input: '{"team_points":[{"team_id":1,"name":"Ajax","points":3}],"points_change":[]}' },
    { label: 'Ties after the change', input: '{"team_points":[{"team_id":1,"name":"Ajax","points":5},{"team_id":2,"name":"Bruins","points":2}],"points_change":[{"team_id":2,"points_change":3}]}' },
    { label: 'Negative changes', input: '{"team_points":[{"team_id":1,"name":"Ajax","points":10},{"team_id":2,"name":"Bruins","points":4}],"points_change":[{"team_id":1,"points_change":-6}]}' },
    { label: 'Long run: ten teams', input: '{"team_points":[{"team_id":1,"name":"Team 1","points":14},{"team_id":2,"name":"Team 2","points":20},{"team_id":3,"name":"Team 3","points":30},{"team_id":4,"name":"Team 4","points":9},{"team_id":5,"name":"Team 5","points":21},{"team_id":6,"name":"Team 6","points":19},{"team_id":7,"name":"Team 7","points":22},{"team_id":8,"name":"Team 8","points":26},{"team_id":9,"name":"Team 9","points":9},{"team_id":10,"name":"Team 10","points":26}],"points_change":[{"team_id":1,"points_change":-5},{"team_id":2,"points_change":2},{"team_id":3,"points_change":-4},{"team_id":4,"points_change":-3},{"team_id":5,"points_change":5},{"team_id":6,"points_change":-1},{"team_id":7,"points_change":3},{"team_id":8,"points_change":-1},{"team_id":9,"points_change":1},{"team_id":10,"points_change":-4}]}' },
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

export default function ChangeInGlobalRankings() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <RankShiftView run={run} step={step} phases={phases} />
    <h3>Working table</h3>
    <RowTable rows={step.rows} label={`${meta.title} working table`} />
  </>} renderReasoning={() => <>
    <p>This walkthrough uses invented sample tables.</p>
    <p>The ranking is done twice: once before the changes and once after. A tie in points is broken by name in both rankings.</p>
    <p>A positive rank difference means the team climbed, because its old rank number was larger than its new one.</p>
  </>} />
}
