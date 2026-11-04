import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases, examples, complexity, inputLabel } from './algorithm'

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

export default function KnowledgeDerivedSqlVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <ol aria-label="Query stages" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', listStyle: 'none', padding: 0, margin: '0 0 8px' }}>
      {[['FROM Sales', 'load'],
      ['JOIN Product', 'join'],
      ['ORDER BY', 'done']].map(([label, id]) => <li key={id} style={{
        padding: '4px 8px', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'monospace', fontSize: 12,
        background: step.phase === id ? 'var(--primary)' : 'transparent', fontWeight: step.phase === id ? 700 : 400,
      }}>{label}</li>)}
    </ol>
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <p>Each step shows the rows the query holds at that moment: load, reshape, filter, then the final output.</p>} />
}
