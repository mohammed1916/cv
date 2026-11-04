import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with a Terms table'
const complexity = 'O(n log n) for ordering at most 12 term rows; the visualizer caps the table at 12 rows.'
const examples = [{
  label: 'Sample',
  input: '{"Terms":[{"power":3,"factor":2},{"power":2,"factor":-1},{"power":1,"factor":1},{"power":0,"factor":-1}]}',
}]
const reasoning = 'Drop zero factors, order the terms from the highest power down, spell each term with its sign, coefficient and X part, then join the pieces and append =0. The first term carries no plus sign.'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, sql, python, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity, examples,
}

function Rows({ columns = [], rows = [] }) {
  return <div style={{ overflowX: 'auto' }}>
    <table>
      <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
      <tbody>{rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column}>{String(row[column] ?? '')}</td>)}</tr>)}</tbody>
    </table>
  </div>
}

function StageStrip({ current }) {
  return <ol style={{ display: 'flex', flexWrap: 'wrap', gap: 6, listStyle: 'none', padding: 0, margin: '8px 0' }}>
    {phases.map(stage => <li key={stage.id} aria-current={stage.id === current ? 'step' : undefined} style={{
      padding: '3px 10px', borderRadius: 999, border: '1px solid var(--surface2)',
      background: stage.id === current ? 'var(--primary)' : 'var(--surface2)',
      color: stage.id === current ? 'var(--surface)' : 'var(--text)',
    }}>{stage.label}</li>)}
  </ol>
}

export default function KnowledgeDerivedSqlVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <StageStrip current={step.phase} />
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <p>{reasoning}</p>} />
}
