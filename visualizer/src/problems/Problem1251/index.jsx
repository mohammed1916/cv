import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const cell = { border: '1px solid currentColor', padding: '4px 8px', textAlign: 'left' }

function RowTable({ label, columns = [], rows = [] }) {
  return <div>
    <p><strong>{label}</strong></p>
    <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14 }}>
      <thead><tr>{columns.map(column => <th key={column} style={cell}>{column}</th>)}</tr></thead>
      <tbody>{rows.length ? rows.map((row, index) => <tr key={index}>
        {columns.map(column => <td key={column} style={cell}>{String(row[column] ?? '')}</td>)}
      </tr>) : <tr><td style={cell} colSpan={Math.max(1, columns.length)}>No rows yet</td></tr>}</tbody>
    </table>
  </div>
}

const definition = {
  phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Object with prices (product_id, start_date, end_date, price) and units_sold (product_id, purchase_date, units)',
  url: 'https://leetcode.com/problems/average-selling-price/',
  complexity: 'O(P + S) work after matching each sale to its price range, where P and S are the row counts. The visualization caps each list at 12 rows.',
  examples: [
    { label: 'Two products', input: '{"prices":[{"product_id":1,"start_date":"2020-04-01","end_date":"2020-04-10","price":8},{"product_id":1,"start_date":"2020-04-11","end_date":"2020-04-30","price":12},{"product_id":2,"start_date":"2020-04-01","end_date":"2020-04-20","price":4},{"product_id":3,"start_date":"2020-01-01","end_date":"2020-12-31","price":99}],"units_sold":[{"product_id":1,"purchase_date":"2020-04-03","units":6},{"product_id":1,"purchase_date":"2020-04-15","units":2},{"product_id":2,"purchase_date":"2020-04-09","units":5}]}' },
    { label: 'Boundary days', input: '{"prices":[{"product_id":4,"start_date":"2020-01-01","end_date":"2020-01-01","price":7}],"units_sold":[{"product_id":4,"purchase_date":"2020-01-01","units":3}]}' },
    { label: 'No sales', input: '{"prices":[{"product_id":7,"start_date":"2021-06-01","end_date":"2021-06-30","price":15}],"units_sold":[]}' },
    { label: 'Free price, most units', input: '{"prices":[{"product_id":8,"start_date":"2022-01-01","end_date":"2022-12-31","price":0}],"units_sold":[{"product_id":8,"purchase_date":"2022-07-04","units":1000}]}' },
    { label: 'Same dates, two products', input: '{"prices":[{"product_id":1,"start_date":"2020-05-01","end_date":"2020-05-31","price":5},{"product_id":2,"start_date":"2020-05-01","end_date":"2020-05-31","price":5}],"units_sold":[{"product_id":1,"purchase_date":"2020-05-15","units":4},{"product_id":2,"purchase_date":"2020-05-15","units":4}]}' },
    { label: 'Long run: 12 sales over 12 ranges', input: '{"prices":[{"product_id":1,"start_date":"2023-01-01","end_date":"2023-03-28","price":275},{"product_id":1,"start_date":"2023-04-01","end_date":"2023-06-28","price":413},{"product_id":1,"start_date":"2023-07-01","end_date":"2023-09-28","price":119},{"product_id":1,"start_date":"2023-10-01","end_date":"2023-12-28","price":219},{"product_id":2,"start_date":"2023-01-01","end_date":"2023-03-28","price":778},{"product_id":2,"start_date":"2023-04-01","end_date":"2023-06-28","price":603},{"product_id":2,"start_date":"2023-07-01","end_date":"2023-09-28","price":367},{"product_id":2,"start_date":"2023-10-01","end_date":"2023-12-28","price":647},{"product_id":3,"start_date":"2023-01-01","end_date":"2023-03-28","price":83},{"product_id":3,"start_date":"2023-04-01","end_date":"2023-06-28","price":115},{"product_id":3,"start_date":"2023-07-01","end_date":"2023-09-28","price":489},{"product_id":3,"start_date":"2023-10-01","end_date":"2023-12-28","price":280}],"units_sold":[{"product_id":1,"purchase_date":"2023-11-21","units":17},{"product_id":3,"purchase_date":"2023-04-10","units":563},{"product_id":2,"purchase_date":"2023-11-03","units":496},{"product_id":2,"purchase_date":"2023-10-05","units":177},{"product_id":1,"purchase_date":"2023-01-15","units":734},{"product_id":3,"purchase_date":"2023-10-21","units":714},{"product_id":2,"purchase_date":"2023-09-20","units":599},{"product_id":1,"purchase_date":"2023-07-23","units":246},{"product_id":1,"purchase_date":"2023-11-04","units":236},{"product_id":3,"purchase_date":"2023-04-17","units":471},{"product_id":1,"purchase_date":"2023-02-08","units":220},{"product_id":2,"purchase_date":"2023-05-04","units":94}]}' },
  ],
}

function StageStrip({ phases, current }) {
  return <ol aria-label="SQL stages" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, listStyle: 'none', padding: 0, margin: '0 0 12px' }}>
    {phases.map(stage => <li key={stage.id} data-stage={stage.id} aria-current={stage.id === current ? 'step' : undefined} style={{
      padding: '4px 10px', border: stage.id === current ? '2px solid var(--text)' : '1px solid var(--border)',
      background: stage.id === current ? 'color-mix(in srgb, var(--primary) 25%, transparent)' : 'var(--surface2)', color: 'var(--text)',
    }}>{stage.label}</li>)}
  </ol>
}

export default function AverageSellingPrice() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <StageStrip phases={phases} current={step.phase} />
    <RowTable label={`Working rows (${step.phase})`} columns={step.columns} rows={step.rows} />
    {step.phase === 'done' && <RowTable label="Result" columns={run.columns} rows={run.result} />}
  </>} renderReasoning={() => <>
    <p>A sale belongs to the single price range whose inclusive dates contain its purchase date. Its revenue is that price times its units.</p>
    <p>The average is total revenue over total units, not an average of the prices. Products with no sales report zero.</p>
  </>} />
}
