import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import LeagueTableView from './LeagueTableView'
import { buildTrace, parseInput, code, python, sql, phases } from './algorithm'
import { meta } from './meta'

const team = (season_id, team_id, team_name, wins, draws, losses, goals_for, goals_against) => ({
  season_id, team_id, team_name, matches_played: wins + draws + losses, wins, draws, losses, goals_for, goals_against,
})
const sample = season_stats => JSON.stringify({ season_stats })

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python, sql,
  inputLabel: 'Object with a season_stats table (season_id, team_id, team_name, matches_played, wins, draws, losses, goals_for, goals_against)',
  url: 'https://leetcode.com/problems/premier-league-table-ranking-iii/',
  complexity: 'O(n log n) for the sort. The compare steps show an insertion sort so each tie-break is visible; the database may sort differently but reaches the same order. The visualization caps the table at 12 rows.',
  examples: [
    { label: 'Every tie-break', input: sample([
      team(2031, 1, 'Harbour Town', 20, 9, 9, 66, 40), team(2031, 2, 'Ironbridge', 21, 6, 11, 60, 41),
      team(2031, 3, 'Kestrel Rovers', 18, 12, 8, 55, 38), team(2031, 4, 'Alder Vale', 18, 12, 8, 50, 33),
      team(2030, 1, 'Harbour Town', 15, 5, 18, 44, 50), team(2030, 5, 'Moss Bay', 25, 3, 10, 70, 39),
    ]) },
    { label: 'Identical records', input: sample([team(2040, 7, 'Quarry Lane', 10, 4, 6, 30, 30), team(2040, 8, 'Fenwick', 10, 4, 6, 30, 30), team(2040, 9, 'Orchard', 10, 4, 6, 30, 30)]) },
    { label: 'One team', input: sample([team(2050, 3, 'Solent United', 0, 0, 2, 1, 5)]) },
  ],
}

export default function PremierLeagueTableRankingIII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <LeagueTableView step={step} />} renderReasoning={() => <>
    <p>Points and goal difference come from one row alone, so they are worked out first. Position depends on the other teams in the season, so it needs a window function.</p>
    <p><code>PARTITION BY season_id</code> restarts the numbering each season. The window's <code>ORDER BY</code> is the tie-break ladder: a lower rung is only read when every rung above it is tied.</p>
    <p>The outer <code>ORDER BY</code> arranges the output and is separate from the window ordering that assigned the positions.</p>
  </>} />
}
