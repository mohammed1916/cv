import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python, phases, sample } from './algorithm'

const STAGE = {
  load: 'Stage 1 · FROM Players (every player at zero points)',
  score: 'Stage 2 · UNION ALL of both match sides, summed per player',
  rank: 'Stage 3 · ROW_NUMBER within each group, ordered by points then id',
  pick: 'Stage 4 · WHERE rnk = 1 keeps the top row per group',
  done: 'Stage 5 · ORDER BY group_id',
}

const definition = {
  phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Players and matches as JSON',
  url: 'https://leetcode.com/problems/tournament-winners/',
  complexity: 'One pass over the matches plus a sort of the players.',
  examples: [{ label: 'Sample tables', input: JSON.stringify(sample) }, { label: 'Single player', input: '{"players":[{"player_id":1,"group_id":1}],"matches":[]}' }, { label: 'Tie goes to the lower id', input: '{"players":[{"player_id":9,"group_id":1},{"player_id":4,"group_id":1}],"matches":[{"match_id":1,"first_player":9,"second_player":4,"first_score":3,"second_score":3}]}' }, { label: 'Long run: 12 players, 20 matches', input: '{"players":[{"player_id":100,"group_id":1},{"player_id":101,"group_id":2},{"player_id":102,"group_id":3},{"player_id":103,"group_id":1},{"player_id":104,"group_id":2},{"player_id":105,"group_id":3},{"player_id":106,"group_id":1},{"player_id":107,"group_id":2},{"player_id":108,"group_id":3},{"player_id":109,"group_id":1},{"player_id":110,"group_id":2},{"player_id":111,"group_id":3}],"matches":[{"match_id":1,"first_player":109,"second_player":110,"first_score":3,"second_score":3},{"match_id":2,"first_player":104,"second_player":109,"first_score":0,"second_score":3},{"match_id":3,"first_player":106,"second_player":102,"first_score":0,"second_score":5},{"match_id":4,"first_player":104,"second_player":107,"first_score":3,"second_score":1},{"match_id":5,"first_player":103,"second_player":108,"first_score":4,"second_score":0},{"match_id":6,"first_player":100,"second_player":102,"first_score":5,"second_score":5},{"match_id":7,"first_player":108,"second_player":103,"first_score":3,"second_score":4},{"match_id":8,"first_player":101,"second_player":110,"first_score":5,"second_score":3},{"match_id":9,"first_player":100,"second_player":106,"first_score":2,"second_score":0},{"match_id":10,"first_player":110,"second_player":105,"first_score":3,"second_score":4},{"match_id":11,"first_player":108,"second_player":102,"first_score":2,"second_score":0},{"match_id":12,"first_player":105,"second_player":109,"first_score":4,"second_score":3},{"match_id":13,"first_player":107,"second_player":103,"first_score":1,"second_score":0},{"match_id":14,"first_player":102,"second_player":106,"first_score":4,"second_score":1},{"match_id":15,"first_player":110,"second_player":111,"first_score":3,"second_score":5},{"match_id":16,"first_player":105,"second_player":110,"first_score":2,"second_score":4},{"match_id":17,"first_player":103,"second_player":107,"first_score":2,"second_score":4},{"match_id":18,"first_player":102,"second_player":108,"first_score":2,"second_score":0},{"match_id":19,"first_player":107,"second_player":109,"first_score":2,"second_score":5},{"match_id":20,"first_player":110,"second_player":105,"first_score":0,"second_score":2}]}' }],
}

function RowTable({ rows, caption }) {
  if (!rows.length) return <p>No rows yet.</p>
  const columns = Object.keys(rows[0])
  return <table>
    <caption>{caption}</caption>
    <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
    <tbody>{rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column}>{String(row[column] ?? '')}</td>)}</tr>)}</tbody>
  </table>
}

function StageStrip({ phases, current }) {
  return <ol aria-label="SQL stages" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, listStyle: 'none', padding: 0, margin: '0 0 12px' }}>
    {phases.map(stage => <li key={stage.id} data-stage={stage.id} aria-current={stage.id === current ? 'step' : undefined} style={{
      padding: '4px 10px', border: stage.id === current ? '2px solid var(--text)' : '1px solid var(--border)',
      background: stage.id === current ? 'color-mix(in srgb, var(--primary) 25%, transparent)' : 'var(--surface2)', color: 'var(--text)',
    }}>{stage.label}</li>)}
  </ol>
}

export default function TournamentWinners() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <StageStrip phases={phases} current={step.phase} />
    <RowTable rows={step.rows} caption={STAGE[step.phase] ?? 'Working table'} />
  </>} renderReasoning={() => <>
    <p>A player appears on both sides of a match, so the points step stacks the first and second positions before summing.</p>
    <p>Players with no matches still appear, because the walk starts from the players table and missing sums become zero.</p>
    <p>Ties on points go to the smaller player id, which is what the ranking order enforces.</p>
  </>} />
}
