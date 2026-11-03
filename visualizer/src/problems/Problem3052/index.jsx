import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with capacity and inventory rows (item_id, item_type, item_category, square_footage)'

const complexity = 'O(n log n) for n inventory rows, from sorting the sets. The visualizer caps the input at 12 rows.'

// Invented sample tables for this visualization. Capacity 600: prime sets Lamp (200) and Desk (250) fit, Shelf (300) does not.
// Remaining 150: Bin (70) fits, Rug (150) and Crate (250) do not, leaving 80.
const examples = [
  {
    label: 'Default warehouse',
    input: JSON.stringify({
      capacity: 600,
      inventory: [
        { item_id: 1, item_type: 'prime', item_category: 'Lamp', square_footage: 120 },
        { item_id: 2, item_type: 'prime', item_category: 'Lamp', square_footage: 80 },
        { item_id: 3, item_type: 'prime', item_category: 'Desk', square_footage: 150 },
        { item_id: 4, item_type: 'prime', item_category: 'Desk', square_footage: 100 },
        { item_id: 5, item_type: 'prime', item_category: 'Shelf', square_footage: 300 },
        { item_id: 6, item_type: 'non_prime', item_category: 'Rug', square_footage: 90 },
        { item_id: 7, item_type: 'non_prime', item_category: 'Rug', square_footage: 60 },
        { item_id: 8, item_type: 'non_prime', item_category: 'Bin', square_footage: 70 },
        { item_id: 9, item_type: 'non_prime', item_category: 'Crate', square_footage: 200 },
        { item_id: 10, item_type: 'non_prime', item_category: 'Crate', square_footage: 50 },
      ],
    }, null, 1),
  },
  {
    label: 'Tight space',
    input: JSON.stringify({
      capacity: 300,
      inventory: [
        { item_id: 11, item_type: 'prime', item_category: 'Pair', square_footage: 180 },
        { item_id: 12, item_type: 'prime', item_category: 'Quad', square_footage: 200 },
        { item_id: 13, item_type: 'non_prime', item_category: 'Bin', square_footage: 70 },
        { item_id: 14, item_type: 'non_prime', item_category: 'Tote', square_footage: 60 },
      ],
    }, null, 1),
  },
]

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
      <tbody>{rows.map((row, index) => <tr key={`${row.item_category}-${index}`}>
        {columns.map(column => <td key={column}>{String(row[column] ?? '')}</td>)}
      </tr>)}</tbody>
    </table>
  </div>
}

export default function MaximizeItems() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Space left">{`Space left: ${step.remaining}`}</output>
    <output aria-label="Packing state">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Teaching rule: each category is one set, and its footprint is the total square footage of its rows.</p>
    <p>Prime sets are packed first, smallest footprint first. Taking the smallest sets gives the most sets and leaves the most space.</p>
    <p>Non-prime sets then use only the space left over, using the same smallest-first order.</p>
  </>} />
}
