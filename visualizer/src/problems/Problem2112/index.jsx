import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases, sampleText } from './algorithm'

const inputLabel = 'Invented sample tables'
const complexity = 'Each table is capped at 12 rows in this visualizer. The trace does one pass per table plus the final output.'
const examples = [{ label: 'Sample', input: sampleText }]

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

function TrafficBars({ rows = [], columns = [] }) {
  if (!columns.includes('total_traffic')) return null
  const max = Math.max(1, ...rows.map(row => row.total_traffic))
  return <div style={{ display: 'grid', gap: 4, margin: '8px 0' }}>
    {rows.map(row => <div key={row.airport_id} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text)' }}>
      <span style={{ minWidth: 80 }}>airport {row.airport_id}</span>
      <span style={{ height: 12, width: `${(row.total_traffic / max) * 100}%`, background: row.total_traffic === max ? 'var(--primary)' : 'var(--surface2)', borderRadius: 4 }} />
      <span>{row.total_traffic}</span>
    </div>)}
  </div>
}

export default function KnowledgeDerivedSqlVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <StageStrip current={step.phase} />
    <TrafficBars rows={step.rows} columns={step.columns} />
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <p>Each step shows the rows the query holds at that moment, from the first table read through the final output. The sample tables are invented for this walkthrough.</p>} />
}
