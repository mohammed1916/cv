import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const sample = '{"TeamStats":[{"team_id":1,"team_name":"Ashford","matches_played":5,"wins":3,"draws":1,"losses":1},{"team_id":2,"team_name":"Brackley","matches_played":5,"wins":2,"draws":2,"losses":1},{"team_id":3,"team_name":"Cressy","matches_played":5,"wins":3,"draws":1,"losses":1},{"team_id":4,"team_name":"Dunmore","matches_played":4,"wins":0,"draws":2,"losses":2},{"team_id":5,"team_name":"Elmsby","matches_played":4,"wins":2,"draws":0,"losses":2}]}'
const allDraws = '{"TeamStats":[{"team_id":7,"team_name":"Fenwick","matches_played":3,"wins":0,"draws":3,"losses":0},{"team_id":8,"team_name":"Garston","matches_played":3,"wins":0,"draws":3,"losses":0}]}'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with TeamStats (team_id, team_name, matches_played, wins, draws, losses); wins + draws + losses must equal matches_played',
  url: 'https://leetcode.com/problems/premier-league-table-ranking/description/',
  complexity: 'O(t log t) for t teams from the sort; the visualization caps the table at 8 teams. Points are 3 * wins + draws.',
  examples: [
    { label: 'Five teams with a tie', input: sample },
    { label: 'Two teams sharing first place', input: allDraws },
    { label: 'Single team', input: '{"TeamStats":[{"team_id":11,"team_name":"Lonely","matches_played":0,"wins":0,"draws":0,"losses":0}]}' },
    { label: 'Equal records share a rank', input: '{"TeamStats":[{"team_id":3,"team_name":"Pinewood","matches_played":4,"wins":2,"draws":0,"losses":2},{"team_id":9,"team_name":"Quarry","matches_played":4,"wins":2,"draws":0,"losses":2}]}' },
    { label: 'Long run: eight generated teams', input: '{"TeamStats":[{"team_id":20,"team_name":"Club A","matches_played":8,"wins":2,"draws":3,"losses":3},{"team_id":21,"team_name":"Club B","matches_played":2,"wins":1,"draws":0,"losses":1},{"team_id":22,"team_name":"Club C","matches_played":6,"wins":2,"draws":1,"losses":3},{"team_id":23,"team_name":"Club D","matches_played":5,"wins":5,"draws":0,"losses":0},{"team_id":24,"team_name":"Club E","matches_played":6,"wins":3,"draws":1,"losses":2},{"team_id":25,"team_name":"Club F","matches_played":8,"wins":4,"draws":4,"losses":0},{"team_id":26,"team_name":"Club G","matches_played":8,"wins":6,"draws":1,"losses":1},{"team_id":27,"team_name":"Club H","matches_played":4,"wins":4,"draws":0,"losses":0}]}' },
  ],
}

function RowsTable({ rows, caption }) {
  const columns = ['team_id', 'team_name', 'points', 'position']
  return <table aria-label={caption}>
    <thead><tr>{columns.map(c => <th key={c} scope="col">{c}</th>)}</tr></thead>
    <tbody>{rows.length
      ? rows.map(row => <tr key={row.team_id}>{columns.map(c => <td key={c}>{row[c] === undefined ? '' : String(row[c])}</td>)}</tr>)
      : <tr><td colSpan={columns.length}>No rows yet</td></tr>}</tbody>
  </table>
}

export default function PremierLeagueTableRanking() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <RowsTable caption="Table so far" rows={step.rows} />
    <output aria-label="Result">{`${run.result.length} team row${run.result.length === 1 ? '' : 's'} in the final table`}</output>
  </>} renderReasoning={() => <>
    <p>Each team earns 3 points per win and 1 point per draw. The points expression is computed once per team.</p>
    <p>RANK() gives tied teams the same position and skips the following positions. Two teams tied for first are both 1, and the next team is 3.</p>
  </>} />
}
