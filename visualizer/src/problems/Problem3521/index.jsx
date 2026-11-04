import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const WORK_COLUMNS = ['user_id', 'product_id', 'category']
const RESULT_COLUMNS = ['product1_id', 'product2_id', 'customer_count']

function RowTable({ label, rows, columns }) {
  return (
    <section>
      <h4>{label}</h4>
      {rows.length === 0 ? <p>No rows yet.</p> : (
        <table aria-label={label}>
          <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
          <tbody>{rows.map((row, index) => (
            <tr key={index}>{columns.map(column => <td key={column}>{row[column] === null ? 'NULL' : String(row[column])}</td>)}</tr>
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
  number: '3521',
  phases: [
    { id: 'load', label: 'Load', description: 'Read the purchases and products.' },
    { id: 'filter', label: 'Filter', description: 'Drop zero-quantity purchases.' },
    { id: 'group', label: 'Group', description: 'List the buyers of each product.' },
    { id: 'pair', label: 'Pair', description: 'Check same-category pairs for shared buyers.' },
    { id: 'output', label: 'Output', description: 'Order the recommended pairs.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with product_info and product_purchases lists',
  url: 'https://leetcode.com/problems/find-product-recommendation-pairs/description/',
  complexity: 'O(p^2 * r) time for p products and r purchases in this small trace. Grouping buyers first keeps the pair checks simple.',
  examples: [
    {
      label: 'Sample',
      input: '{"product_info":[{"product_id":1,"category":"books","price":10},{"product_id":2,"category":"books","price":12},{"product_id":3,"category":"toys","price":5},{"product_id":4,"category":"books","price":8}],"product_purchases":[{"user_id":1,"product_id":1,"quantity":2},{"user_id":1,"product_id":2,"quantity":1},{"user_id":2,"product_id":1,"quantity":1},{"user_id":2,"product_id":2,"quantity":3},{"user_id":3,"product_id":1,"quantity":1},{"user_id":3,"product_id":3,"quantity":1},{"user_id":4,"product_id":2,"quantity":1},{"user_id":4,"product_id":4,"quantity":2},{"user_id":5,"product_id":2,"quantity":1},{"user_id":5,"product_id":4,"quantity":1}]}',
    },
    {
      label: 'Cross category',
      input: '{"product_info":[{"product_id":7,"category":"a","price":1},{"product_id":8,"category":"b","price":1}],"product_purchases":[{"user_id":1,"product_id":7,"quantity":1},{"user_id":1,"product_id":8,"quantity":1},{"user_id":2,"product_id":7,"quantity":1},{"user_id":2,"product_id":8,"quantity":1}]}',
    },
  ],
}

export default function FindProductRecommendationPairs() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <StageRail phases={definition.phases} active={step.phase} />
    <RowTable label="Working rows" rows={step.rows} columns={WORK_COLUMNS} />
    <RowTable label="Result so far" rows={step.result} columns={RESULT_COLUMNS} />
  </>} renderReasoning={() => <>
    <p>Each product gets a set of buyers. A pair is kept only when both products share a category and at least two different users appear in both buyer sets.</p>
    <p>Counting distinct users, not purchase rows, stops one buyer who purchased a product several times from inflating the count.</p>
  </>} />
}
