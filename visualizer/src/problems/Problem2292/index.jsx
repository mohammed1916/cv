import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Orders table with purchase dates'
const complexity = 'O(n) to count orders, then a short check of neighbouring years. The visualizer accepts up to 30 rows per table.'
const examples = [{
  label: 'Sample',
  input: '{"Orders":[{"order_id":1,"product_id":1,"quantity":1,"purchase_date":"2019-03-01"},{"order_id":2,"product_id":1,"quantity":1,"purchase_date":"2019-06-01"},{"order_id":3,"product_id":1,"quantity":1,"purchase_date":"2019-09-01"},{"order_id":4,"product_id":1,"quantity":1,"purchase_date":"2020-01-10"},{"order_id":5,"product_id":1,"quantity":1,"purchase_date":"2020-02-10"},{"order_id":6,"product_id":1,"quantity":1,"purchase_date":"2020-03-10"},{"order_id":7,"product_id":2,"quantity":5,"purchase_date":"2019-01-01"},{"order_id":8,"product_id":2,"quantity":1,"purchase_date":"2019-02-01"},{"order_id":9,"product_id":2,"quantity":1,"purchase_date":"2019-03-01"},{"order_id":10,"product_id":2,"quantity":1,"purchase_date":"2021-01-01"},{"order_id":11,"product_id":2,"quantity":1,"purchase_date":"2021-02-01"},{"order_id":12,"product_id":2,"quantity":1,"purchase_date":"2021-03-01"},{"order_id":13,"product_id":3,"quantity":1,"purchase_date":"2020-01-01"},{"order_id":14,"product_id":3,"quantity":1,"purchase_date":"2020-02-01"},{"order_id":15,"product_id":3,"quantity":1,"purchase_date":"2020-03-01"},{"order_id":16,"product_id":3,"quantity":1,"purchase_date":"2020-04-01"},{"order_id":17,"product_id":3,"quantity":1,"purchase_date":"2021-05-01"},{"order_id":18,"product_id":3,"quantity":1,"purchase_date":"2022-01-01"},{"order_id":19,"product_id":3,"quantity":1,"purchase_date":"2022-02-01"},{"order_id":20,"product_id":3,"quantity":1,"purchase_date":"2022-03-01"},{"order_id":21,"product_id":4,"quantity":1,"purchase_date":"2021-01-01"},{"order_id":22,"product_id":4,"quantity":1,"purchase_date":"2022-01-01"},{"order_id":23,"product_id":4,"quantity":1,"purchase_date":"2023-01-01"},{"order_id":24,"product_id":4,"quantity":1,"purchase_date":"2021-06-01"},{"order_id":25,"product_id":4,"quantity":1,"purchase_date":"2021-09-01"},{"order_id":26,"product_id":4,"quantity":1,"purchase_date":"2022-06-01"},{"order_id":27,"product_id":4,"quantity":1,"purchase_date":"2022-09-01"}]}',
},
    { label: 'Single order', input: '{"Orders":[{"order_id":1,"product_id":5,"quantity":2,"purchase_date":"2020-01-15"}]}' },
    { label: 'Two orders in one year', input: '{"Orders":[{"order_id":1,"product_id":5,"quantity":1,"purchase_date":"2019-02-01"},{"order_id":2,"product_id":5,"quantity":3,"purchase_date":"2019-11-20"}]}' },
    { label: 'Year boundary dates', input: '{"Orders":[{"order_id":1,"product_id":7,"quantity":1,"purchase_date":"2019-12-31"},{"order_id":2,"product_id":7,"quantity":1,"purchase_date":"2020-01-01"}]}' },
    { label: 'Long run: 30 orders', input: '{"Orders":[{"order_id":1,"product_id":3,"quantity":3,"purchase_date":"2018-11-19"},{"order_id":2,"product_id":2,"quantity":5,"purchase_date":"2021-09-26"},{"order_id":3,"product_id":1,"quantity":5,"purchase_date":"2019-08-24"},{"order_id":4,"product_id":1,"quantity":5,"purchase_date":"2019-11-21"},{"order_id":5,"product_id":1,"quantity":2,"purchase_date":"2019-02-15"},{"order_id":6,"product_id":3,"quantity":5,"purchase_date":"2020-10-19"},{"order_id":7,"product_id":2,"quantity":3,"purchase_date":"2021-02-20"},{"order_id":8,"product_id":2,"quantity":2,"purchase_date":"2021-10-20"},{"order_id":9,"product_id":3,"quantity":5,"purchase_date":"2021-06-10"},{"order_id":10,"product_id":2,"quantity":5,"purchase_date":"2018-01-10"},{"order_id":11,"product_id":1,"quantity":1,"purchase_date":"2021-12-14"},{"order_id":12,"product_id":2,"quantity":4,"purchase_date":"2021-03-10"},{"order_id":13,"product_id":1,"quantity":5,"purchase_date":"2018-07-26"},{"order_id":14,"product_id":3,"quantity":2,"purchase_date":"2021-02-28"},{"order_id":15,"product_id":1,"quantity":2,"purchase_date":"2021-10-24"},{"order_id":16,"product_id":1,"quantity":3,"purchase_date":"2018-04-02"},{"order_id":17,"product_id":1,"quantity":3,"purchase_date":"2019-12-20"},{"order_id":18,"product_id":3,"quantity":5,"purchase_date":"2020-04-17"},{"order_id":19,"product_id":3,"quantity":3,"purchase_date":"2021-10-04"},{"order_id":20,"product_id":1,"quantity":5,"purchase_date":"2019-10-06"},{"order_id":21,"product_id":1,"quantity":2,"purchase_date":"2021-11-25"},{"order_id":22,"product_id":1,"quantity":3,"purchase_date":"2021-10-06"},{"order_id":23,"product_id":3,"quantity":4,"purchase_date":"2018-09-23"},{"order_id":24,"product_id":3,"quantity":2,"purchase_date":"2018-04-03"},{"order_id":25,"product_id":3,"quantity":1,"purchase_date":"2020-05-16"},{"order_id":26,"product_id":3,"quantity":4,"purchase_date":"2019-02-10"},{"order_id":27,"product_id":3,"quantity":1,"purchase_date":"2018-11-11"},{"order_id":28,"product_id":2,"quantity":5,"purchase_date":"2018-07-26"},{"order_id":29,"product_id":3,"quantity":1,"purchase_date":"2020-09-02"},{"order_id":30,"product_id":3,"quantity":2,"purchase_date":"2021-03-24"}]}' }]

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

function StageStrip({ phases = [], active }) {
  const at = Math.max(0, phases.findIndex(phase => phase.id === active))
  return <ol aria-label="SQL stages" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, listStyle: 'none', padding: 0, margin: '0 0 12px' }}>
    {phases.map((phase, index) => {
      const state = index < at ? 'done' : index === at ? 'active' : 'pending'
      return <li key={phase.id} data-stage={phase.id} data-state={state} title={phase.description} style={{
        padding: '6px 10px', borderRadius: 8, fontSize: 13,
        border: '1px solid var(--border, var(--surface2))',
        background: state === 'active' ? 'var(--primary)' : state === 'done' ? 'var(--surface2)' : 'transparent',
        color: state === 'active' ? 'var(--on-primary, var(--surface))' : 'var(--text)',
        fontWeight: state === 'active' ? 700 : 400,
      }}>{index + 1}. {phase.label}</li>
    })}
  </ol>
}

export default function SqlStageVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <StageStrip phases={phases} active={step.phase} />
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <p>Orders are counted per product and year, years with at least three orders are kept, and a product qualifies when one kept year is directly followed by another. Quantity is not used.</p>} />
}
