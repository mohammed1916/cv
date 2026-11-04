import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Coffee shop orders (JSON)'
const complexity = 'Time grows with the number of rows, after one sort by id.'
const examples = [{
  label: 'Sample',
  input: '{"CoffeeShop":[{"id":1,"drink":"cocoa"},{"id":2,"drink":null},{"id":3,"drink":"chai"},{"id":4,"drink":null},{"id":5,"drink":null},{"id":6,"drink":"tea"}]}',
}, {
  label: 'Leading row',
  input: '{"CoffeeShop":[{"id":9,"drink":"mint"},{"id":10,"drink":null},{"id":11,"drink":null}]}',
}]

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, sql, python, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity, examples,
}

const CLAUSES = [['FROM', 'FROM CoffeeShop'], ['ORDER', 'ORDER BY id'], ['COALESCE', 'COALESCE with earlier drink'], ['RESULT', 'Result rows']]
const CLAUSE_OF_PHASE = { load: 'FROM', order: 'ORDER', carry: 'COALESCE', done: 'RESULT' }

// Stage strip: the SQL step that the current frame corresponds to.
function StageStrip({ phase }) {
  const active = CLAUSE_OF_PHASE[phase]
  return <ol aria-label="SQL stages" style={{ display: 'flex', gap: 6, listStyle: 'none', padding: 0, margin: '8px 0', flexWrap: 'wrap' }}>
    {CLAUSES.map(([key, label]) => <li key={key} aria-current={active === key ? 'step' : undefined}
      style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)', background: active === key ? 'var(--primary-glow)' : 'var(--surface2)', color: 'var(--text)', fontWeight: active === key ? 700 : 400 }}>{label}</li>)}
  </ol>
}

function Rows({ columns = [], rows = [], activeId = null }) {
  return <div style={{ overflowX: 'auto' }}>
    <table>
      <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
      <tbody>{rows.map((row, index) => <tr key={index} style={row.id === activeId ? { background: 'var(--primary-glow)', fontWeight: 700 } : undefined}>{columns.map(column => <td key={column}>{String(row[column] ?? 'NULL')}</td>)}</tr>)}</tbody>
    </table>
  </div>
}

export default function PreviousValueFill() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <StageStrip phase={step.phase} />
    <Rows columns={step.columns} rows={step.rows} activeId={step.activeId ?? null} />
    {step.phase === 'carry' && <p>Carried drink: <strong>{step.carry}</strong></p>}
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <p>The query reads rows in id order. A null drink takes the closest earlier non-null drink, so the view keeps the latest drink seen and fills each gap with it.</p>} />
}
