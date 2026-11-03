import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, SAMPLE_TEXT } from './algorithm'

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
  inputLabel: 'Object with stores and inventory rows (knowledge-derived sample)',
  complexity: 'O(I + S log S) for I inventory rows and S stores. Knowledge-derived draft; the imbalance rule is not yet verified against the official statement.',
  examples: [{ label: 'Sample', input: SAMPLE_TEXT }],
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
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Each store is compared with its own average price, so cheap and expensive products are judged within one shop.</p>
    <p>Products priced exactly at the average are left out of both totals.</p>
  </>} />
}
