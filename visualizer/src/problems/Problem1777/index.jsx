import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Array of Products rows'
const complexity = 'One pass over the rows with one output row per product. The visualizer caps the input at 12 rows.'
const examples = [{
  label: 'Sample',
  input: '[{"product_id":7,"store":"store1","price":120},{"product_id":7,"store":"store3","price":135},{"product_id":8,"store":"store2","price":64},{"product_id":9,"store":"store1","price":88},{"product_id":9,"store":"store2","price":91},{"product_id":9,"store":"store3","price":97}]',
}]

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, sql, python, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity, examples,
}

const CELL = { border: '1px solid var(--border)', padding: '3px 8px', color: 'var(--text)', fontFamily: 'monospace' }

function Rows({ columns = [], rows = [], highlight = null }) {
  return <div style={{ overflowX: 'auto' }}>
    <table style={{ borderCollapse: 'collapse' }}>
      <thead><tr>{columns.map(column => <th key={column} scope="col" style={CELL}>{column}</th>)}</tr></thead>
      <tbody>{rows.map((row, index) => <tr key={index} style={{ background: highlight && highlight(row) ? 'var(--surface2)' : undefined }}>
        {columns.map(column => <td key={column} style={CELL}>{String(row[column] ?? 'NULL')}</td>)}
      </tr>)}</tbody>
    </table>
  </div>
}

// The long rows (one per store) are turned into one wide row per product. The product being pivoted is highlighted.
export default function PivotPricesVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const currentId = step.phase === 'group' ? step.rows[step.rows.length - 1].product_id : null;
    return <>
      <p style={{ margin: '0 0 8px' }}>{step.message}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ margin: '0 0 4px', color: 'var(--text)', fontSize: 14 }}>Products, one row per store</h3>
          <Rows columns={['product_id', 'store', 'price']} rows={run.input}
            highlight={row => row.product_id === currentId} />
        </div>
        <div>
          <h3 style={{ margin: '0 0 4px', color: 'var(--text)', fontSize: 14 }}>Pivoted, one row per product</h3>
          <Rows columns={['product_id', 'store1', 'store2', 'store3']} rows={step.phase === 'load' ? [] : step.rows}
            highlight={row => row.product_id === currentId} />
        </div>
      </div>
      <output aria-label="Query output" style={{ display: 'block', marginTop: 10 }}>{step.phase === 'done' ? `Output rows: ${run.result.length}` : ''}</output>
    </>
  }} renderReasoning={() => <p>Each store becomes its own column. A store with no row for a product leaves that cell empty, which the query shows as NULL.</p>} />
}
