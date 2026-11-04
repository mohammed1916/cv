import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const WORK_COLUMNS = ['user_id', 'category']
const RESULT_COLUMNS = ['category1', 'category2', 'shared_users']

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
  number: '3554',
  phases: [
    { id: 'load', label: 'Load', description: 'Read the purchases and products.' },
    { id: 'join', label: 'Join', description: 'Attach each product its category.' },
    { id: 'user', label: 'Users', description: 'Collect the categories each user bought from.' },
    { id: 'pair', label: 'Pair', description: 'Count users who bought from both categories.' },
    { id: 'output', label: 'Output', description: 'Order the recommended category pairs.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with product_info and product_purchases lists',
  url: 'https://leetcode.com/problems/find-category-recommendation-pairs/description/',
  complexity: 'O(c^2 * u) time for c categories and u users in this small trace. Each user contributes distinct categories only once.',
  examples: [
    {
      label: 'Sample',
      input: '{"product_info":[{"product_id":1,"category":"food"},{"product_id":2,"category":"toys"},{"product_id":3,"category":"books"},{"product_id":4,"category":"food"}],"product_purchases":[{"user_id":1,"product_id":1,"quantity":1},{"user_id":1,"product_id":2,"quantity":1},{"user_id":2,"product_id":1,"quantity":2},{"user_id":2,"product_id":3,"quantity":1},{"user_id":3,"product_id":2,"quantity":1},{"user_id":3,"product_id":3,"quantity":1},{"user_id":4,"product_id":4,"quantity":1},{"user_id":4,"product_id":2,"quantity":3},{"user_id":5,"product_id":3,"quantity":1},{"user_id":5,"product_id":4,"quantity":2}]}',
    },
    {
      label: 'Single shopper',
      input: '{"product_info":[{"product_id":1,"category":"a"},{"product_id":2,"category":"b"}],"product_purchases":[{"user_id":1,"product_id":1,"quantity":1},{"user_id":1,"product_id":2,"quantity":1}]}',
    },
  ],
}

export default function FindCategoryRecommendationPairs() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <StageRail phases={definition.phases} active={step.phase} />
    <RowTable label="Working rows" rows={step.rows} columns={WORK_COLUMNS} />
    <RowTable label="Result so far" rows={step.result} columns={RESULT_COLUMNS} />
  </>} renderReasoning={() => <>
    <p>First reduce the purchases to one row per user and category. Then each category pair is judged by how many distinct users appear in both categories.</p>
    <p>Pairs are written once with the alphabetically smaller category first, so the same pair is never listed twice.</p>
  </>} />
}
