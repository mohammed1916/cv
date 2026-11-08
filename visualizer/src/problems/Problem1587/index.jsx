import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, sql, phases } from './algorithm'

const INPUT_LABEL = "Object with users and transactions lists"
const EXAMPLE = "{\"users\":[{\"account\":310001,\"name\":\"Rhea\"},{\"account\":310002,\"name\":\"Omar\"},{\"account\":310003,\"name\":\"Lena\"},{\"account\":310004,\"name\":\"Tomas\"}],\"transactions\":[{\"trans_id\":1,\"account\":310001,\"amount\":6000,\"transacted_on\":\"2020-08-01\"},{\"trans_id\":2,\"account\":310001,\"amount\":5000,\"transacted_on\":\"2020-09-01\"},{\"trans_id\":3,\"account\":310001,\"amount\":-2000,\"transacted_on\":\"2020-09-02\"},{\"trans_id\":4,\"account\":310002,\"amount\":1500,\"transacted_on\":\"2020-01-20\"},{\"trans_id\":5,\"account\":310002,\"amount\":2500,\"transacted_on\":\"2020-08-25\"},{\"trans_id\":6,\"account\":310003,\"amount\":12000,\"transacted_on\":\"2020-06-01\"},{\"trans_id\":7,\"account\":310004,\"amount\":15000,\"transacted_on\":\"2020-07-01\"},{\"trans_id\":8,\"account\":310001,\"amount\":1500,\"transacted_on\":\"2020-10-01\"}]}"
const COMPLEXITY = 'The lesson runs a few passes over the sample tables; the parser caps each table at a small size.'
const REASONING = ["Withdrawals are simply negative amounts, so one sum per account gives the balance.","The threshold is applied after grouping, which is why it is a HAVING-style check."]

const definition = {
  number: '1587',
  title: "Bank Account Summary II",
  phases, parse: parseInput, build: buildTrace, code, python, sql,
  inputLabel: INPUT_LABEL,
  complexity: COMPLEXITY,
  examples: [{ label: 'Sample', input: EXAMPLE },
    { label: "Single deposit above threshold", input: "{\"users\":[{\"account\":1,\"name\":\"Ivy\"}],\"transactions\":[{\"trans_id\":1,\"account\":1,\"amount\":20000,\"transacted_on\":\"2020-01-01\"}]}" },
    { label: "Balance exactly at threshold", input: "{\"users\":[{\"account\":2,\"name\":\"Bo\"}],\"transactions\":[{\"trans_id\":2,\"account\":2,\"amount\":10000,\"transacted_on\":\"2020-02-01\"}]}" },
    { label: "Eight users, sixteen transactions", input: "{\"users\":[{\"account\":400,\"name\":\"U0\"},{\"account\":401,\"name\":\"U1\"},{\"account\":402,\"name\":\"U2\"},{\"account\":403,\"name\":\"U3\"},{\"account\":404,\"name\":\"U4\"},{\"account\":405,\"name\":\"U5\"},{\"account\":406,\"name\":\"U6\"},{\"account\":407,\"name\":\"U7\"}],\"transactions\":[{\"trans_id\":50,\"account\":400,\"amount\":1500,\"transacted_on\":\"2020-03-01\"},{\"trans_id\":51,\"account\":401,\"amount\":3000,\"transacted_on\":\"2020-03-02\"},{\"trans_id\":52,\"account\":402,\"amount\":4500,\"transacted_on\":\"2020-03-03\"},{\"trans_id\":53,\"account\":403,\"amount\":6000,\"transacted_on\":\"2020-03-04\"},{\"trans_id\":54,\"account\":404,\"amount\":7500,\"transacted_on\":\"2020-03-05\"},{\"trans_id\":55,\"account\":405,\"amount\":1500,\"transacted_on\":\"2020-03-06\"},{\"trans_id\":56,\"account\":406,\"amount\":3000,\"transacted_on\":\"2020-03-07\"},{\"trans_id\":57,\"account\":407,\"amount\":4500,\"transacted_on\":\"2020-03-08\"},{\"trans_id\":58,\"account\":400,\"amount\":6000,\"transacted_on\":\"2020-03-09\"},{\"trans_id\":59,\"account\":401,\"amount\":7500,\"transacted_on\":\"2020-03-10\"},{\"trans_id\":60,\"account\":402,\"amount\":1500,\"transacted_on\":\"2020-03-11\"},{\"trans_id\":61,\"account\":403,\"amount\":3000,\"transacted_on\":\"2020-03-12\"},{\"trans_id\":62,\"account\":404,\"amount\":4500,\"transacted_on\":\"2020-03-13\"},{\"trans_id\":63,\"account\":405,\"amount\":6000,\"transacted_on\":\"2020-03-14\"},{\"trans_id\":64,\"account\":406,\"amount\":7500,\"transacted_on\":\"2020-03-15\"},{\"trans_id\":65,\"account\":407,\"amount\":1500,\"transacted_on\":\"2020-03-16\"}]}" },
    { label: "Long run: 8 users, 16 transactions", input: "{\"users\":[{\"account\":500,\"name\":\"Acct0\"},{\"account\":501,\"name\":\"Acct1\"},{\"account\":502,\"name\":\"Acct2\"},{\"account\":503,\"name\":\"Acct3\"},{\"account\":504,\"name\":\"Acct4\"},{\"account\":505,\"name\":\"Acct5\"},{\"account\":506,\"name\":\"Acct6\"},{\"account\":507,\"name\":\"Acct7\"}],\"transactions\":[{\"trans_id\":300,\"account\":500,\"amount\":11715,\"transacted_on\":\"2020-04-01\"},{\"trans_id\":301,\"account\":503,\"amount\":13101,\"transacted_on\":\"2020-04-02\"},{\"trans_id\":302,\"account\":506,\"amount\":3632,\"transacted_on\":\"2020-04-03\"},{\"trans_id\":303,\"account\":501,\"amount\":14132,\"transacted_on\":\"2020-04-04\"},{\"trans_id\":304,\"account\":504,\"amount\":14395,\"transacted_on\":\"2020-04-05\"},{\"trans_id\":305,\"account\":507,\"amount\":2821,\"transacted_on\":\"2020-04-06\"},{\"trans_id\":306,\"account\":502,\"amount\":-2394,\"transacted_on\":\"2020-04-07\"},{\"trans_id\":307,\"account\":505,\"amount\":11783,\"transacted_on\":\"2020-04-08\"},{\"trans_id\":308,\"account\":500,\"amount\":10196,\"transacted_on\":\"2020-04-09\"},{\"trans_id\":309,\"account\":503,\"amount\":5299,\"transacted_on\":\"2020-04-10\"},{\"trans_id\":310,\"account\":506,\"amount\":-47,\"transacted_on\":\"2020-04-11\"},{\"trans_id\":311,\"account\":501,\"amount\":-2212,\"transacted_on\":\"2020-04-12\"},{\"trans_id\":312,\"account\":504,\"amount\":12558,\"transacted_on\":\"2020-04-13\"},{\"trans_id\":313,\"account\":507,\"amount\":14097,\"transacted_on\":\"2020-04-14\"},{\"trans_id\":314,\"account\":502,\"amount\":5752,\"transacted_on\":\"2020-04-15\"},{\"trans_id\":315,\"account\":505,\"amount\":-3581,\"transacted_on\":\"2020-04-16\"}]}" }],
}

const formatValue = value => value === undefined || value === null ? '' : typeof value === 'boolean' ? (value ? 'yes' : 'no') : String(value)

function RowTable({ label, rows }) {
  const columns = [...new Set(rows.flatMap(row => Object.keys(row)))]
  return <section aria-label={label}>
    <h4>{label}</h4>
    {rows.length === 0 ? <p>No rows yet.</p> : <table>
      <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
      <tbody>{rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column}>{formatValue(row[column])}</td>)}</tr>)}</tbody>
    </table>}
  </section>
}

function BalanceBars({ rows, threshold = 10000 }) {
  if (rows.length === 0 || !('balance' in rows[0])) return null
  const max = Math.max(threshold, ...rows.map(row => Number(row.balance) || 0))
  const pct = value => `${Math.max(0, Math.min(100, (value / max) * 100))}%`
  return <section aria-label="Balance against threshold">
    <h4>Balance against the {threshold} threshold</h4>
    {rows.map(row => <div key={row.account ?? row.name} style={{ display: 'grid', gridTemplateColumns: '6rem 1fr 5rem', gap: 8, alignItems: 'center', marginBottom: 4 }}>
      <span style={{ color: 'var(--text)' }}>{row.name}</span>
      <div style={{ position: 'relative', background: 'var(--surface2)', borderRadius: 4, height: 14 }}>
        <div style={{ width: pct(row.balance), height: '100%', borderRadius: 4,
          background: row.passes === false ? 'var(--text-muted)' : 'var(--primary)' }} />
        <div style={{ position: 'absolute', left: pct(threshold), top: -3, bottom: -3, width: 2, background: 'var(--text)' }} />
      </div>
      <strong style={{ color: 'var(--text)' }}>{row.balance}</strong>
    </div>)}
    <p style={{ color: 'var(--text-muted)' }}>The vertical line is the threshold. Bars past it are kept; grey bars are dropped.</p>
  </section>
}

export default function Problem1587() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <>
      <BalanceBars rows={step.rows} />
      <RowTable label="Working rows" rows={step.rows} />
      <RowTable label="Output" rows={step.output} />
    </>}
    renderReasoning={() => <>{REASONING.map(text => <p key={text}>{text}</p>)}</>} />
}
