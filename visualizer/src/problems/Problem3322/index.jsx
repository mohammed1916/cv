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
    { label: 'Single team', input: '{"season_stats":[{"season_id":2030,"team_id":1,"team_name":"Solo FC","matches_played":4,"wins":3,"draws":1,"losses":0,"goals_for":9,"goals_against":2}]}' },
    { label: 'Equal records', input: '{"season_stats":[{"season_id":2031,"team_id":1,"team_name":"Ashford","matches_played":20,"wins":10,"draws":5,"losses":5,"goals_for":30,"goals_against":20},{"season_id":2031,"team_id":2,"team_name":"Brentwood","matches_played":20,"wins":10,"draws":5,"losses":5,"goals_for":30,"goals_against":20}]}' },
    { label: 'Largest table, 12 rows', input: '{"season_stats":[{"season_id":2032,"team_id":1,"team_name":"Club 1","matches_played":39,"wins":15,"draws":8,"losses":16,"goals_for":59,"goals_against":20},{"season_id":2032,"team_id":2,"team_name":"Club 2","matches_played":17,"wins":11,"draws":3,"losses":3,"goals_for":30,"goals_against":67},{"season_id":2032,"team_id":3,"team_name":"Club 3","matches_played":32,"wins":8,"draws":6,"losses":18,"goals_for":66,"goals_against":43},{"season_id":2032,"team_id":4,"team_name":"Club 4","matches_played":16,"wins":12,"draws":0,"losses":4,"goals_for":14,"goals_against":35},{"season_id":2032,"team_id":5,"team_name":"Club 5","matches_played":21,"wins":3,"draws":2,"losses":16,"goals_for":51,"goals_against":21},{"season_id":2032,"team_id":6,"team_name":"Club 6","matches_played":30,"wins":12,"draws":6,"losses":12,"goals_for":20,"goals_against":14},{"season_id":2032,"team_id":7,"team_name":"Club 7","matches_played":16,"wins":5,"draws":1,"losses":10,"goals_for":38,"goals_against":25},{"season_id":2032,"team_id":8,"team_name":"Club 8","matches_played":18,"wins":10,"draws":7,"losses":1,"goals_for":7,"goals_against":38},{"season_id":2032,"team_id":9,"team_name":"Club 9","matches_played":40,"wins":19,"draws":2,"losses":19,"goals_for":71,"goals_against":1},{"season_id":2032,"team_id":10,"team_name":"Club 10","matches_played":36,"wins":14,"draws":6,"losses":16,"goals_for":63,"goals_against":56},{"season_id":2032,"team_id":11,"team_name":"Club 11","matches_played":25,"wins":8,"draws":9,"losses":8,"goals_for":51,"goals_against":76},{"season_id":2032,"team_id":12,"team_name":"Club 12","matches_played":17,"wins":13,"draws":3,"losses":1,"goals_for":11,"goals_against":14}]}' },
    { label: 'Long run: two seasons of 6 rows', input: '{"season_stats":[{"season_id":2033,"team_id":1,"team_name":"Club 1","matches_played":24,"wins":10,"draws":7,"losses":7,"goals_for":66,"goals_against":59},{"season_id":2033,"team_id":2,"team_name":"Club 2","matches_played":28,"wins":18,"draws":0,"losses":10,"goals_for":21,"goals_against":34},{"season_id":2033,"team_id":3,"team_name":"Club 3","matches_played":32,"wins":16,"draws":3,"losses":13,"goals_for":49,"goals_against":21},{"season_id":2033,"team_id":4,"team_name":"Club 4","matches_played":35,"wins":10,"draws":6,"losses":19,"goals_for":52,"goals_against":27},{"season_id":2033,"team_id":5,"team_name":"Club 5","matches_played":13,"wins":8,"draws":3,"losses":2,"goals_for":3,"goals_against":76},{"season_id":2033,"team_id":6,"team_name":"Club 6","matches_played":10,"wins":1,"draws":0,"losses":9,"goals_for":74,"goals_against":56},{"season_id":2034,"team_id":1,"team_name":"Club 1","matches_played":27,"wins":18,"draws":2,"losses":7,"goals_for":2,"goals_against":71},{"season_id":2034,"team_id":2,"team_name":"Club 2","matches_played":24,"wins":6,"draws":5,"losses":13,"goals_for":6,"goals_against":65},{"season_id":2034,"team_id":3,"team_name":"Club 3","matches_played":30,"wins":11,"draws":7,"losses":12,"goals_for":53,"goals_against":40},{"season_id":2034,"team_id":4,"team_name":"Club 4","matches_played":30,"wins":17,"draws":1,"losses":12,"goals_for":28,"goals_against":54},{"season_id":2034,"team_id":5,"team_name":"Club 5","matches_played":37,"wins":18,"draws":3,"losses":16,"goals_for":53,"goals_against":71},{"season_id":2034,"team_id":6,"team_name":"Club 6","matches_played":21,"wins":11,"draws":2,"losses":8,"goals_for":52,"goals_against":7}]}' },
  ],
}

export default function PremierLeagueTableRankingIII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <LeagueTableView step={step} />} renderReasoning={() => <>
    <p>Points and goal difference come from one row alone, so they are worked out first. Position depends on the other teams in the season, so it needs a window function.</p>
    <p><code>PARTITION BY season_id</code> restarts the numbering each season. The window's <code>ORDER BY</code> is the tie-break ladder: a lower rung is only read when every rung above it is tied.</p>
    <p>The outer <code>ORDER BY</code> arranges the output and is separate from the window ordering that assigned the positions.</p>
  </>} />
}
