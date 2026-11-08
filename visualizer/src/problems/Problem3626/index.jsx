import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, SAMPLE_TEXT } from './algorithm'

function StageRail({ phases, active }) {
  return <ol aria-label="SQL stages" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', listStyle: 'none', padding: 0 }}>
    {phases.map(phase => <li key={phase.id} aria-current={phase.id === active ? 'step' : undefined}
      style={{ border: '1px solid var(--surface2)', borderRadius: 6, padding: '4px 10px', background: phase.id === active ? 'var(--primary)' : 'var(--surface2)', color: phase.id === active ? 'var(--primary-contrast)' : 'var(--text)' }}>
      <strong>{phase.label}</strong>
    </li>)}
  </ol>
}

const definition = {
  phases: [
    { id: 'load', label: 'Load', description: 'Read the inventory rows.' },
    { id: 'average', label: 'Average', description: 'Find the store average price.' },
    { id: 'split', label: 'Split', description: 'Add up stock above and below the average.' },
    { id: 'keep', label: 'Imbalanced', description: 'Above-average stock is smaller than below-average stock.' },
    { id: 'skip', label: 'Skip', description: 'Fewer than two products, or balanced stock.' },
    { id: 'order', label: 'Order', description: 'Sort by store name.' },
    { id: 'done', label: 'Result', description: 'Report the imbalanced stores.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with stores and inventory rows',
  complexity: 'O(I + S log S) for I inventory rows and S stores.',
  examples: [
    { label: 'Sample', input: SAMPLE_TEXT },
    { label: 'One product, no stock', input: '{"stores":[{"store_id":1,"store_name":"Alpha"}],"inventory":[{"store_id":1,"product_id":1,"price":10,"quantity":0}]}' },
    { label: 'Equal totals', input: '{"stores":[{"store_id":1,"store_name":"Alpha"},{"store_id":2,"store_name":"Beta"}],"inventory":[{"store_id":1,"product_id":1,"price":10,"quantity":2},{"store_id":2,"product_id":2,"price":20,"quantity":1}]}' },
    { label: 'Large price and stock', input: '{"stores":[{"store_id":1,"store_name":"Alpha"}],"inventory":[{"store_id":1,"product_id":1,"price":999,"quantity":1000}]}' },
    { label: 'Long run: 6 stores, 24 products', input: '{"stores":[{"store_id":1,"store_name":"Alpha"},{"store_id":2,"store_name":"Beta"},{"store_id":3,"store_name":"Gamma"},{"store_id":4,"store_name":"Delta"},{"store_id":5,"store_name":"Epsilon"},{"store_id":6,"store_name":"Zeta"}],"inventory":[{"store_id":2,"product_id":1,"price":63,"quantity":2},{"store_id":3,"product_id":2,"price":59,"quantity":0},{"store_id":3,"product_id":3,"price":28,"quantity":8},{"store_id":5,"product_id":4,"price":29,"quantity":8},{"store_id":5,"product_id":5,"price":99,"quantity":15},{"store_id":3,"product_id":6,"price":9,"quantity":11},{"store_id":1,"product_id":7,"price":99,"quantity":16},{"store_id":6,"product_id":8,"price":73,"quantity":18},{"store_id":6,"product_id":9,"price":22,"quantity":0},{"store_id":5,"product_id":10,"price":15,"quantity":7},{"store_id":3,"product_id":11,"price":100,"quantity":20},{"store_id":4,"product_id":12,"price":56,"quantity":11},{"store_id":6,"product_id":13,"price":48,"quantity":10},{"store_id":3,"product_id":14,"price":37,"quantity":3},{"store_id":3,"product_id":15,"price":15,"quantity":2},{"store_id":4,"product_id":16,"price":13,"quantity":5},{"store_id":4,"product_id":17,"price":21,"quantity":7},{"store_id":3,"product_id":18,"price":71,"quantity":17},{"store_id":5,"product_id":19,"price":86,"quantity":19},{"store_id":1,"product_id":20,"price":84,"quantity":2},{"store_id":6,"product_id":21,"price":2,"quantity":10},{"store_id":2,"product_id":22,"price":2,"quantity":9},{"store_id":2,"product_id":23,"price":79,"quantity":10},{"store_id":3,"product_id":24,"price":65,"quantity":8}]}' },
  ],
}

const cell = { border: '1px solid currentColor', padding: '4px 8px' }

function Rows({ columns = [], rows = [] }) {
  if (rows.length === 0) return <p>No rows yet.</p>
  return <table style={{ borderCollapse: 'collapse' }}>
    <thead><tr>{columns.map(c => <th key={c} style={cell}>{c}</th>)}</tr></thead>
    <tbody>{rows.map((row, i) => <tr key={i}>{columns.map(c => <td key={c} style={cell}>{String(row[c])}</td>)}</tr>)}</tbody>
  </table>
}

export default function FindStoresWithInventoryImbalance() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <StageRail phases={definition.phases} active={step.phase} />
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Each store is compared with its own average price, so cheap and expensive products are judged within one shop.</p>
    <p>Products priced exactly at the average are left out of both totals.</p>
  </>} />
}
