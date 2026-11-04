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
  inputLabel: 'Object with teams (team_id, team_name) and matches (host_team, guest_team, host_goals, guest_goals)',
  url: 'https://leetcode.com/problems/team-scores-in-football-tournament/',
  complexity: 'O(T + M log T) for T teams and M matches. The visualization caps the tables at small sizes.',
  examples: [
    { label: 'Four teams', input: '{"teams":[{"team_id":3,"team_name":"Ash"},{"team_id":5,"team_name":"Birch"},{"team_id":6,"team_name":"Cedar"},{"team_id":8,"team_name":"Dune"}],"matches":[{"match_id":1,"host_team":3,"guest_team":5,"host_goals":2,"guest_goals":2},{"match_id":2,"host_team":6,"guest_team":3,"host_goals":0,"guest_goals":3},{"match_id":3,"host_team":5,"guest_team":6,"host_goals":1,"guest_goals":0}]}' },
    { label: 'No matches', input: '{"teams":[{"team_id":1,"team_name":"Oak"},{"team_id":2,"team_name":"Pine"}],"matches":[]}' },
  ],
}

function StageStrip({ phases, current }) {
  return <ol aria-label="SQL stages" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, listStyle: 'none', padding: 0, margin: '0 0 12px' }}>
    {phases.map(stage => <li key={stage.id} data-stage={stage.id} aria-current={stage.id === current ? 'step' : undefined} style={{
      padding: '4px 10px', border: stage.id === current ? '2px solid var(--text)' : '1px solid var(--border)',
      background: stage.id === current ? 'color-mix(in srgb, var(--primary) 25%, transparent)' : 'var(--surface2)', color: 'var(--text)',
    }}>{stage.label}</li>)}
  </ol>
}

export default function TeamScoresInFootballTournament() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <StageStrip phases={phases} current={step.phase} />
    <RowTable label={`Working standings (${step.phase})`} columns={step.columns} rows={step.rows} />
    {step.phase === 'done' && <RowTable label="Result" columns={run.columns} rows={run.result} />}
  </>} renderReasoning={() => <>
    <p>Every match is worth points to each side: a win gives 3, a draw gives 1 to both teams, and a loss gives 0.</p>
    <p>Because the points are gathered from both the host and guest columns, each team is checked once per appearance. Joining the totals back onto the teams table keeps teams with no matches at zero.</p>
  </>} />
}
