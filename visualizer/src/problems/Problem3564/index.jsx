import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const WORK_COLUMNS = ['sale_id', 'sale_date', 'category', 'revenue', 'season']
const RESULT_COLUMNS = ['season', 'category', 'revenue']

function RowTable({ label, rows, columns }) {
  return (
    <section>
      <h4>{label}</h4>
      {rows.length === 0 ? <p>No rows yet.</p> : (
        <table aria-label={label}>
          <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
          <tbody>{rows.map((row, index) => (
            <tr key={index}>{columns.map(column => <td key={column}>{row[column] === undefined || row[column] === null ? '-' : String(row[column])}</td>)}</tr>
          ))}</tbody>
        </table>
      )}
    </section>
  )
}

function StageRail({ phases, active }) {
  return <ol aria-label="SQL stages" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', listStyle: 'none', padding: 0 }}>
    {phases.map(phase => <li key={phase.id} aria-current={phase.id === active ? 'step' : undefined}
      style={{ border: '1px solid var(--surface2)', borderRadius: 6, padding: '4px 10px', background: phase.id === active ? 'var(--primary)' : 'var(--surface2)', color: phase.id === active ? 'var(--on-primary, #fff)' : 'var(--text)' }}>
      <strong>{phase.label}</strong>
    </li>)}
  </ol>
}

const definition = {
  number: '3564',
  phases: [
    { id: 'load', label: 'Load', description: 'Read the sales and products.' },
    { id: 'join', label: 'Join', description: 'Attach categories and compute revenue.' },
    { id: 'season', label: 'Season', description: 'Assign each sale a season from its month.' },
    { id: 'total', label: 'Totals', description: 'Add revenue per season and category.' },
    { id: 'pick', label: 'Leader', description: 'Pick the top category in each season.' },
    { id: 'output', label: 'Output', description: 'Return the leaders in season order.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with products and sales lists',
  url: 'https://leetcode.com/problems/seasonal-sales-analysis/description/',
  complexity: 'O(s + g log g) time for s sales and g season-category groups in this trace. Totals live in a small map keyed by season and category.',
  examples: [
    {
      label: 'Sample',
      input: '{"products":[{"product_id":1,"category":"shoes","price":50},{"product_id":2,"category":"hats","price":20},{"product_id":3,"category":"bags","price":30},{"product_id":4,"category":"socks","price":15}],"sales":[{"sale_id":1,"product_id":1,"sale_date":"2024-01-15","quantity":2},{"sale_id":2,"product_id":2,"sale_date":"2024-02-10","quantity":3},{"sale_id":3,"product_id":3,"sale_date":"2024-03-05","quantity":1},{"sale_id":4,"product_id":2,"sale_date":"2024-07-20","quantity":1},{"sale_id":5,"product_id":1,"sale_date":"2024-08-01","quantity":1},{"sale_id":6,"product_id":3,"sale_date":"2024-08-30","quantity":2},{"sale_id":7,"product_id":2,"sale_date":"2024-09-14","quantity":2},{"sale_id":8,"product_id":1,"sale_date":"2024-11-11","quantity":3},{"sale_id":9,"product_id":3,"sale_date":"2024-12-24","quantity":2},{"sale_id":10,"product_id":4,"sale_date":"2024-04-09","quantity":2}]}',
    },
    {
      label: 'One season',
      input: '{"products":[{"product_id":1,"category":"mugs","price":7}],"sales":[{"sale_id":1,"product_id":1,"sale_date":"2023-06-01","quantity":4}]}',
    },
    { label: 'One sale', input: '{"sales":[{"sale_id":1,"product_id":1,"sale_date":"2024-01-05","quantity":1}],"products":[{"product_id":1,"category":"tea","price":0}]}' },
    { label: 'Equal sale dates', input: '{"sales":[{"sale_id":1,"product_id":1,"sale_date":"2024-02-10","quantity":2},{"sale_id":2,"product_id":2,"sale_date":"2024-02-10","quantity":2}],"products":[{"product_id":1,"category":"tea","price":3},{"product_id":2,"category":"coffee","price":3}]}' },
    { label: 'Largest quantities', input: '{"sales":[{"sale_id":1,"product_id":1,"sale_date":"2024-03-31","quantity":50}],"products":[{"product_id":1,"category":"tea","price":100}]}' },
    { label: 'Long run: 8 products, 12 sales', input: '{"sales":[{"sale_id":1,"product_id":4,"sale_date":"2024-01-02","quantity":5},{"sale_id":2,"product_id":2,"sale_date":"2024-02-26","quantity":1},{"sale_id":3,"product_id":1,"sale_date":"2024-03-19","quantity":1},{"sale_id":4,"product_id":6,"sale_date":"2024-02-03","quantity":5},{"sale_id":5,"product_id":4,"sale_date":"2024-01-15","quantity":2},{"sale_id":6,"product_id":5,"sale_date":"2024-01-20","quantity":5},{"sale_id":7,"product_id":2,"sale_date":"2024-03-20","quantity":1},{"sale_id":8,"product_id":4,"sale_date":"2024-02-20","quantity":5},{"sale_id":9,"product_id":5,"sale_date":"2024-01-25","quantity":2},{"sale_id":10,"product_id":4,"sale_date":"2024-02-19","quantity":2},{"sale_id":11,"product_id":8,"sale_date":"2024-03-02","quantity":3},{"sale_id":12,"product_id":3,"sale_date":"2024-03-13","quantity":3}],"products":[{"product_id":1,"category":"tea","price":100},{"product_id":2,"category":"coffee","price":60},{"product_id":3,"category":"tea","price":24},{"product_id":4,"category":"coffee","price":99},{"product_id":5,"category":"tea","price":33},{"product_id":6,"category":"coffee","price":7},{"product_id":7,"category":"tea","price":50},{"product_id":8,"category":"coffee","price":65}]}' },
  ],
}

export default function SeasonalSalesAnalysis() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <StageRail phases={definition.phases} active={step.phase} />
    <RowTable label="Working rows" rows={step.rows} columns={WORK_COLUMNS} />
    <RowTable label="Leaders so far" rows={step.result} columns={RESULT_COLUMNS} />
  </>} renderReasoning={() => <>
    <p>Each sale becomes revenue (quantity times price) and a season named from its month. Totals are kept per season and category.</p>
    <p>Within a season the highest total wins. When totals tie, the alphabetically earlier category is chosen, which is the same order the SQL uses.</p>
  </>} />
}
