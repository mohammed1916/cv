import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'load', label: 'Activities', description: 'Start from the raw sale rows.' },
    { id: 'dedupe', label: 'Distinct', description: 'A product repeated on one day counts once.' },
    { id: 'group', label: 'Group', description: 'Count and join the products for one date.' },
    { id: 'output', label: 'Order', description: 'Dates are listed in ascending order.' },
    { id: 'done', label: 'Result', description: 'One row per date.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with an activities list of sell_date and product',
  url: 'https://leetcode.com/problems/group-sold-products-by-the-date/',
  complexity: 'O(n log n) time for sorting the rows; n is the number of activity rows.',
  examples: [
    { label: 'Example', input: '{"activities":[{"sell_date":"2020-05-30","product":"Headphone"},{"sell_date":"2020-05-30","product":"Basketball"},{"sell_date":"2020-05-30","product":"Headphone"},{"sell_date":"2020-06-01","product":"Pencil"},{"sell_date":"2020-06-01","product":"Bible"},{"sell_date":"2020-06-02","product":"Mask"},{"sell_date":"2020-06-02","product":"Mask"}]}' },
  ],
}

function RowTable({ caption, rows }) {
  const columns = rows.length ? Object.keys(rows[0]) : []
  return (
    <section aria-label={caption}>
      <h3>{caption}</h3>
      {columns.length === 0 ? <p>No rows yet.</p> : (
        <table>
          <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
          <tbody>{rows.map((row, index) => (
            <tr key={index}>{columns.map(column => <td key={column}>{String(row[column])}</td>)}</tr>
          ))}</tbody>
        </table>
      )}
    </section>
  )
}

export default function GroupSoldProducts() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <RowTable caption="Working rows" rows={step.rows} />
    <RowTable caption="Result" rows={run.result} />
  </>} renderReasoning={() => <>
    <p>Each date is handled as its own group. Repeated product rows on one day are removed first, so the count is the number of distinct products.</p>
    <p>The product names for a date are sorted and joined with commas, which gives the output text.</p>
  </>} />
}
