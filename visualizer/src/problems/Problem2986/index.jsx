import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SqlStageBoard from './SqlStageBoard'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with a Transactions table (user_id, spend, transaction_date)'
const complexity = 'Sorting and numbering dominate: O(n log n) over the transaction rows. The visualizer caps the table at 20 rows.'
const examples = [{
  label: 'Sample',
  input: '{"Transactions":[{"user_id":4,"spend":9,"transaction_date":"2024-05-03"},{"user_id":2,"spend":8,"transaction_date":"2024-01-09"},{"user_id":1,"spend":10,"transaction_date":"2024-01-01"},{"user_id":4,"spend":3,"transaction_date":"2024-05-01"},{"user_id":1,"spend":20,"transaction_date":"2024-02-01"},{"user_id":2,"spend":5,"transaction_date":"2024-01-05"},{"user_id":1,"spend":15,"transaction_date":"2024-03-01"},{"user_id":3,"spend":7,"transaction_date":"2024-04-01"},{"user_id":2,"spend":30,"transaction_date":"2024-02-02"},{"user_id":2,"spend":12,"transaction_date":"2024-03-01"},{"user_id":3,"spend":9,"transaction_date":"2024-04-02"},{"user_id":4,"spend":4,"transaction_date":"2024-05-02"}]}',
},
  { label: "Single transaction", input: '{"Transactions":[{"user_id":1,"spend":10,"transaction_date":"2024-01-01"}]}' },
  { label: "Same date tie", input: '{"Transactions":[{"user_id":2,"spend":5,"transaction_date":"2024-03-01"},{"user_id":2,"spend":7,"transaction_date":"2024-03-01"},{"user_id":1,"spend":9,"transaction_date":"2024-02-01"}]}' },
  { label: "Large spend", input: '{"Transactions":[{"user_id":1,"spend":1000000,"transaction_date":"2024-06-30"},{"user_id":1,"spend":1,"transaction_date":"2024-07-01"}]}' },
  { label: "Long run: 20 transactions", input: '{"Transactions":[{"user_id":3,"spend":2,"transaction_date":"2024-02-04"},{"user_id":5,"spend":37,"transaction_date":"2024-01-09"},{"user_id":1,"spend":97,"transaction_date":"2024-02-09"},{"user_id":5,"spend":56,"transaction_date":"2024-08-26"},{"user_id":2,"spend":97,"transaction_date":"2024-09-22"},{"user_id":1,"spend":67,"transaction_date":"2024-09-09"},{"user_id":2,"spend":95,"transaction_date":"2024-02-15"},{"user_id":1,"spend":28,"transaction_date":"2024-02-09"},{"user_id":5,"spend":46,"transaction_date":"2024-03-27"},{"user_id":1,"spend":32,"transaction_date":"2024-10-24"},{"user_id":2,"spend":6,"transaction_date":"2024-11-17"},{"user_id":1,"spend":90,"transaction_date":"2024-08-15"},{"user_id":4,"spend":68,"transaction_date":"2024-07-06"},{"user_id":5,"spend":84,"transaction_date":"2024-08-10"},{"user_id":5,"spend":98,"transaction_date":"2024-02-28"},{"user_id":1,"spend":59,"transaction_date":"2024-07-02"},{"user_id":3,"spend":54,"transaction_date":"2024-03-19"},{"user_id":2,"spend":26,"transaction_date":"2024-05-12"},{"user_id":3,"spend":62,"transaction_date":"2024-08-11"},{"user_id":1,"spend":89,"transaction_date":"2024-11-17"}]}' },
]

const stagesOf = run => run.frames.map(f => ({
  id: f.phase, clause: code[f.activeLine - 1]?.text.trim() ?? '', label: phases.find(p => p.id === f.phase)?.label ?? f.phase,
  columns: f.columns, rows: f.rows,
}))

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

export default function ThirdTransactionVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <SqlStageBoard title="Query stages" stages={stagesOf(run)} active={run.frames.indexOf(step)} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <>
    <p>Number each user’s purchases by date, then pivot the first three numbers into one row per user.</p>
    <p>A user qualifies only when the third purchase is strictly larger than both earlier ones, so a user with fewer than three purchases drops out.</p>
  </>} />
}
