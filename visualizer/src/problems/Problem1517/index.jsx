import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python } from './algorithm'

const phases = [
  { id: 'load', label: 'Users', description: 'Read every user and mail.' },
  { id: 'check', label: 'Check', description: 'Test one mail against the pattern and report why it fails.' },
  { id: 'done', label: 'Result', description: 'Return the users whose mail is valid.' },
]

const CELL = { border: '1px solid currentColor', padding: '2px 8px' }
const KEEP = 'color-mix(in srgb, var(--success) 30%, var(--surface2))'
const DROP = 'color-mix(in srgb, var(--warning) 30%, var(--surface2))'
const HIGHLIGHT = 'color-mix(in srgb, var(--primary) 28%, var(--surface2))'

function TableView({ caption, columns, rows, currentIndex = -1 }) {
  return <table aria-label={caption} style={{ borderCollapse: 'collapse' }}>
    <caption>{caption}</caption>
    <thead><tr>{columns.map(column => <th key={column} scope="col" style={CELL}>{column}</th>)}</tr></thead>
    <tbody>{rows.length === 0
      ? <tr><td style={CELL} colSpan={Math.max(1, columns.length)}>No rows yet</td></tr>
      : rows.map((row, index) => <tr key={index} data-current={index === currentIndex ? 'yes' : undefined}
        style={{ background: index === currentIndex ? HIGHLIGHT : undefined, fontWeight: index === currentIndex ? 600 : undefined }}>
        {columns.map(column => <td key={column} style={CELL}>{String(row[column])}</td>)}
      </tr>)}</tbody>
  </table>
}

// Each character of the prefix is tested against the pattern; the domain is compared as a whole.
function MailCheck({ mail }) {
  const at = mail.lastIndexOf('@')
  const prefix = at < 0 ? mail : mail.slice(0, at)
  const domain = at < 0 ? '' : mail.slice(at + 1)
  const allowed = /[A-Za-z0-9_.-]/
  const firstOk = /^[A-Za-z]/.test(prefix)
  return <section aria-label="Mail being checked">
    <h3>Mail being checked</h3>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, fontFamily: 'monospace' }}>
      {[...prefix].map((ch, i) => {
        const ok = allowed.test(ch) && (i > 0 || firstOk)
        return <span key={i} title={i === 0 ? 'the first character must be a letter' : 'letters, digits, _, . and -'} style={{
          padding: '2px 4px', color: 'var(--text)', border: '1px solid var(--border)', background: ok ? KEEP : DROP,
        }}>{ch}</span>
      })}
      <span style={{ padding: '2px 4px', color: 'var(--text)', fontWeight: 700 }}>{at < 0 ? '(no @ sign)' : '@'}</span>
      <span style={{ padding: '2px 4px', color: 'var(--text)', border: '1px solid var(--border)', background: domain === 'leetcode.com' ? KEEP : DROP }}>{domain}</span>
    </div>
    <p>The prefix needs a letter first, then letters, digits, _, . or -. The domain must be exactly leetcode.com in lowercase.</p>
  </section>
}

const definition = {
  phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Object with Users (user_id, name, mail) (JSON)',
  url: 'https://leetcode.com/problems/find-users-with-valid-e-mails/',
  complexity: 'O(u * m) for u users and mails of length m.',
  examples: [
    { label: 'Example', input: '{"Users":[{"user_id":1,"name":"Ana","mail":"ana_01@leetcode.com"},{"user_id":2,"name":"Bo","mail":"1bo@leetcode.com"},{"user_id":3,"name":"Cy","mail":"cy.dev@example.com"},{"user_id":4,"name":"Di","mail":"di-x@LEETCODE.com"},{"user_id":5,"name":"Ed","mail":"ed@leetcode.com"}]}' },
  ],
}

export default function ValidMails() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const currentIndex = step.phase === 'check' ? step.rows.length - 1 : -1
    const current = currentIndex >= 0 ? step.rows[currentIndex] : null
    return <>
      <section aria-label="SQL stage">
        <h3>Stage: {phases.find(p => p.id === step.phase)?.label}</h3>
        <p>{step.phase === 'check' ? 'WHERE mail REGEXP: the highlighted row is the mail being tested.' : step.phase === 'done' ? 'ORDER BY user_id: the valid rows in id order.' : 'FROM Users: every row before the filter.'}</p>
      </section>
      <p>{step.message}</p>
      {current && <MailCheck mail={current.mail} />}
      <TableView caption="Current rows" columns={step.columns} rows={step.rows} currentIndex={currentIndex} />
    </>
  }} renderReasoning={() => <>
    <p>The prefix must begin with a letter and use only letters, digits, underscore, period or hyphen. The domain must match exactly, so a mail with a different capitalisation of the domain is rejected.</p>
    <p>Users are checked one at a time; the output keeps the valid rows in user id order.</p>
  </>} />
}
