import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SqlStages from './SqlStages'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const examples = [{
  label: 'Sample',
  input: '{"Teams":[{"team_id":1,"team_name":"Ash"},{"team_id":2,"team_name":"Birch"},{"team_id":3,"team_name":"Cedar"},{"team_id":4,"team_name":"Dune"}],"Matches":[{"home_team_id":1,"away_team_id":2,"home_team_goals":2,"away_team_goals":1},{"home_team_id":2,"away_team_id":3,"home_team_goals":1,"away_team_goals":1},{"home_team_id":3,"away_team_id":1,"home_team_goals":0,"away_team_goals":3}]}',
}, { label: 'Single team, no matches', input: "{\"Teams\":[{\"team_id\":1,\"team_name\":\"Solo\"}],\"Matches\":[]}" }, { label: 'Draw counts for both sides', input: "{\"Teams\":[{\"team_id\":1,\"team_name\":\"Ash\"},{\"team_id\":2,\"team_name\":\"Birch\"}],\"Matches\":[{\"home_team_id\":1,\"away_team_id\":2,\"home_team_goals\":1,\"away_team_goals\":1}]}" }, { label: 'Large scores', input: "{\"Teams\":[{\"team_id\":1,\"team_name\":\"Ash\"},{\"team_id\":2,\"team_name\":\"Birch\"},{\"team_id\":3,\"team_name\":\"Cedar\"}],\"Matches\":[{\"home_team_id\":1,\"away_team_id\":2,\"home_team_goals\":99,\"away_team_goals\":0},{\"home_team_id\":3,\"away_team_id\":1,\"home_team_goals\":0,\"away_team_goals\":99}]}" }, { label: 'Long run: 8 teams', input: "{\"Teams\":[{\"team_id\":1,\"team_name\":\"Team 1\"},{\"team_id\":2,\"team_name\":\"Team 2\"},{\"team_id\":3,\"team_name\":\"Team 3\"},{\"team_id\":4,\"team_name\":\"Team 4\"},{\"team_id\":5,\"team_name\":\"Team 5\"},{\"team_id\":6,\"team_name\":\"Team 6\"},{\"team_id\":7,\"team_name\":\"Team 7\"},{\"team_id\":8,\"team_name\":\"Team 8\"}],\"Matches\":[{\"home_team_id\":7,\"away_team_id\":4,\"home_team_goals\":0,\"away_team_goals\":1},{\"home_team_id\":6,\"away_team_id\":3,\"home_team_goals\":2,\"away_team_goals\":3},{\"home_team_id\":2,\"away_team_id\":7,\"home_team_goals\":5,\"away_team_goals\":0},{\"home_team_id\":7,\"away_team_id\":5,\"home_team_goals\":2,\"away_team_goals\":6},{\"home_team_id\":1,\"away_team_id\":4,\"home_team_goals\":4,\"away_team_goals\":0},{\"home_team_id\":7,\"away_team_id\":8,\"home_team_goals\":3,\"away_team_goals\":1},{\"home_team_id\":2,\"away_team_id\":6,\"home_team_goals\":6,\"away_team_goals\":1},{\"home_team_id\":7,\"away_team_id\":3,\"home_team_goals\":5,\"away_team_goals\":6},{\"home_team_id\":2,\"away_team_id\":7,\"home_team_goals\":2,\"away_team_goals\":0},{\"home_team_id\":1,\"away_team_id\":3,\"home_team_goals\":5,\"away_team_goals\":5},{\"home_team_id\":2,\"away_team_id\":3,\"home_team_goals\":6,\"away_team_goals\":1},{\"home_team_id\":2,\"away_team_id\":3,\"home_team_goals\":1,\"away_team_goals\":3}]}" }]

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Object with Teams and Matches tables',
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity: 'O(T + M log T) for T teams and M matches, from one pass over the sides and a sort of the teams. The visualizer caps each table at 12 rows.',
  examples,
}

function Rows({ columns = [], rows = [] }) {
  return <div style={{ overflowX: 'auto' }}>
    <table>
      <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
      <tbody>{rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column}>{String(row[column] ?? '')}</td>)}</tr>)}</tbody>
    </table>
  </div>
}

export default function LeagueStatisticsVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <SqlStages code={code} activeLine={step.activeLine} />
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <>
    <p>Every match is written twice, once from each side, so each team collects its own points and goals with the same grouping.</p>
    <p>A team with no matches still appears: the left join from Teams fills its totals with zero, so it shows at the bottom of the ranking.</p>
  </>} />
}
