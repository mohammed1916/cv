import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python, phases, sample } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Transactions and chargebacks as JSON',
  url: 'https://leetcode.com/problems/monthly-transactions-ii/',
  complexity: 'One pass per stream, then a keyed merge of the month and country groups.',
  examples: [
    { label: 'Sample tables', input: JSON.stringify(sample) },
    { label: 'Single approved sale, no chargebacks', input: '{\"transactions\":[{\"id\":1,\"country\":\"US\",\"state\":\"approved\",\"amount\":100,\"trans_date\":\"2020-01-01\"}],\"chargebacks\":[]}' },
    { label: 'Two chargebacks in the same month', input: '{\"transactions\":[{\"id\":1,\"country\":\"US\",\"state\":\"approved\",\"amount\":300,\"trans_date\":\"2019-03-05\"},{\"id\":2,\"country\":\"US\",\"state\":\"approved\",\"amount\":400,\"trans_date\":\"2019-03-09\"}],\"chargebacks\":[{\"trans_id\":1,\"trans_date\":\"2019-04-02\"},{\"trans_id\":2,\"trans_date\":\"2019-04-02\"}]}' },
    { label: 'Long run: twelve transactions over six months', input: '{\"transactions\":[{\"id\":1,\"country\":\"IN\",\"state\":\"approved\",\"amount\":1004,\"trans_date\":\"2019-05-16\"},{\"id\":2,\"country\":\"DE\",\"state\":\"approved\",\"amount\":1634,\"trans_date\":\"2019-04-21\"},{\"id\":3,\"country\":\"IN\",\"state\":\"declined\",\"amount\":366,\"trans_date\":\"2019-04-26\"},{\"id\":4,\"country\":\"DE\",\"state\":\"approved\",\"amount\":509,\"trans_date\":\"2019-01-07\"},{\"id\":5,\"country\":\"US\",\"state\":\"approved\",\"amount\":1006,\"trans_date\":\"2019-02-21\"},{\"id\":6,\"country\":\"IN\",\"state\":\"approved\",\"amount\":1991,\"trans_date\":\"2019-04-05\"},{\"id\":7,\"country\":\"US\",\"state\":\"approved\",\"amount\":1671,\"trans_date\":\"2019-03-26\"},{\"id\":8,\"country\":\"IN\",\"state\":\"approved\",\"amount\":324,\"trans_date\":\"2019-04-22\"},{\"id\":9,\"country\":\"IN\",\"state\":\"approved\",\"amount\":1659,\"trans_date\":\"2019-06-03\"},{\"id\":10,\"country\":\"DE\",\"state\":\"approved\",\"amount\":466,\"trans_date\":\"2019-01-13\"},{\"id\":11,\"country\":\"IN\",\"state\":\"approved\",\"amount\":657,\"trans_date\":\"2019-06-07\"},{\"id\":12,\"country\":\"IN\",\"state\":\"approved\",\"amount\":1797,\"trans_date\":\"2019-01-13\"}],\"chargebacks\":[{\"trans_id\":1,\"trans_date\":\"2019-06-02\"},{\"trans_id\":4,\"trans_date\":\"2019-02-02\"},{\"trans_id\":7,\"trans_date\":\"2019-04-02\"},{\"trans_id\":10,\"trans_date\":\"2019-02-02\"}]}' },
  ],
}

function RowTable({ rows }) {
  if (!rows.length) return <p>No rows yet.</p>
  const columns = Object.keys(rows[0])
  return <table>
    <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
    <tbody>{rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column}>{String(row[column] ?? '')}</td>)}</tr>)}</tbody>
  </table>
}

function StageStrip({ phases, current }) {
  return <ol aria-label="SQL stages" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, listStyle: 'none', padding: 0, margin: '0 0 12px' }}>
    {phases.map(stage => <li key={stage.id} data-stage={stage.id} aria-current={stage.id === current ? 'step' : undefined} style={{
      padding: '4px 10px', border: stage.id === current ? '2px solid var(--text)' : '1px solid var(--border)',
      background: stage.id === current ? 'color-mix(in srgb, var(--primary) 25%, transparent)' : 'var(--surface2)', color: 'var(--text)',
    }}>{stage.label}</li>)}
  </ol>
}

export default function MonthlyTransactionsII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <StageStrip phases={phases} current={step.phase} />
    <h3>Month and country groups</h3>
    <RowTable rows={step.rows} />
  </>} renderReasoning={() => <>
    <p>A chargeback belongs to the country of its transaction but to the month of the chargeback date, so the two streams can land in different groups.</p>
    <p>The merge keeps a group if either stream produced it, and fills the missing side with zero.</p>
  </>} />
}
