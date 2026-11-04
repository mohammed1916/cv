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
  examples: [{ label: 'Sample tables', input: JSON.stringify(sample) }],
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
