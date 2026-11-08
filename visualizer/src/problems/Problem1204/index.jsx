import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python, phases, sample } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Queue as JSON',
  url: 'https://leetcode.com/problems/last-person-to-fit-in-the-bus/',
  complexity: 'One running sum over the queue in boarding order.',
  examples: [
    { label: 'Sample queue', input: JSON.stringify(sample) },
    { label: 'Single person in the queue', input: '{\"queue\":[{\"person_id\":1,\"person_name\":\"Ada\",\"weight\":400,\"turn\":1}]}' },
    { label: 'Input order differs from turn order', input: '{\"queue\":[{\"person_id\":2,\"person_name\":\"Ben\",\"weight\":300,\"turn\":3},{\"person_id\":1,\"person_name\":\"Ada\",\"weight\":200,\"turn\":1},{\"person_id\":3,\"person_name\":\"Cara\",\"weight\":450,\"turn\":2}]}' },
    { label: 'Running total exactly at the limit', input: '{\"queue\":[{\"person_id\":1,\"person_name\":\"Ada\",\"weight\":250,\"turn\":1},{\"person_id\":2,\"person_name\":\"Ben\",\"weight\":250,\"turn\":2},{\"person_id\":3,\"person_name\":\"Cara\",\"weight\":500,\"turn\":3},{\"person_id\":4,\"person_name\":\"Dan\",\"weight\":1,\"turn\":4}]}' },
    { label: 'Long run: twelve people', input: '{\"queue\":[{\"person_id\":1,\"person_name\":\"Ava\",\"weight\":188,\"turn\":1},{\"person_id\":2,\"person_name\":\"Bo\",\"weight\":142,\"turn\":2},{\"person_id\":3,\"person_name\":\"Cy\",\"weight\":83,\"turn\":3},{\"person_id\":4,\"person_name\":\"Di\",\"weight\":89,\"turn\":4},{\"person_id\":5,\"person_name\":\"Ed\",\"weight\":210,\"turn\":5},{\"person_id\":6,\"person_name\":\"Fay\",\"weight\":222,\"turn\":6},{\"person_id\":7,\"person_name\":\"Gus\",\"weight\":105,\"turn\":7},{\"person_id\":8,\"person_name\":\"Hal\",\"weight\":185,\"turn\":8},{\"person_id\":9,\"person_name\":\"Ivy\",\"weight\":40,\"turn\":9},{\"person_id\":10,\"person_name\":\"Jo\",\"weight\":198,\"turn\":10},{\"person_id\":11,\"person_name\":\"Kai\",\"weight\":57,\"turn\":11},{\"person_id\":12,\"person_name\":\"Lu\",\"weight\":93,\"turn\":12}]}' },
  ],
}

function RowTable({ rows }) {
  if (!rows.length) return <p>No rows yet.</p>
  const columns = Object.keys(rows[0])
  return <table>
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

export default function LastPersonToFitInTheBus() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <StageStrip phases={phases} current={step.phase} />
    <h3>Boarding so far</h3>
    <RowTable rows={step.rows} />
  </>} renderReasoning={() => <>
    <p>Boarding is strictly in turn order, so the running total only grows. The first overflow ends the search, and no later lighter person can jump ahead.</p>
  </>} />
}
