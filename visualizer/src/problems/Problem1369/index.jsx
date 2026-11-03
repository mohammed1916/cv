import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const definition = {
  phases,
  parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Object with a UserActivity list (username, activity, startDate, endDate)',
  url: 'https://leetcode.com/problems/get-the-second-most-recent-activity/',
  complexity: 'Ranking each user’s rows is one pass per row here, so O(n²) for the visual. A window function ranks every partition in O(n log n). The visualization caps the table at 12 rows.',
  examples: [
    { label: 'Sample', input: '{"UserActivity":[{"username":"mia","activity":"chess","startDate":"2026-01-02","endDate":"2026-01-05"},{"username":"mia","activity":"rowing","startDate":"2026-01-10","endDate":"2026-01-12"},{"username":"mia","activity":"choir","startDate":"2026-02-01","endDate":"2026-02-03"},{"username":"lee","activity":"climbing","startDate":"2026-03-04","endDate":"2026-03-09"},{"username":"ray","activity":"yoga","startDate":"2026-01-20","endDate":"2026-01-22"},{"username":"ray","activity":"swim","startDate":"2026-01-03","endDate":"2026-01-06"}]}' },
    { label: 'Single activity', input: '{"UserActivity":[{"username":"solo","activity":"run","startDate":"2026-05-01","endDate":"2026-05-02"}]}' },
  ],
}

function Table({ caption, rows }) {
  const keys = rows[0] ? Object.keys(rows[0]) : []
  return <figure>
    <figcaption>{caption}</figcaption>
    {rows.length === 0 ? <p>No rows.</p> : <table>
      <thead><tr>{keys.map(key => <th key={key} scope="col">{key}</th>)}</tr></thead>
      <tbody>{rows.map((row, index) => <tr key={index}>
        {keys.map(key => <td key={key}>{row[key] === null || row[key] === undefined ? 'NULL' : String(row[key])}</td>)}
      </tr>)}</tbody>
    </table>}
  </figure>
}

export default function SecondMostRecentActivity() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <Table caption={step.caption} rows={step.rows} />
    <output aria-label="Row count">{`${step.rows.length} row${step.rows.length === 1 ? '' : 's'} in ${step.caption.toLowerCase()}`}</output>
  </>} renderReasoning={() => <>
    <p>Recency counts from the newest start date. The second row of each user is the answer; a user with a single row has no second row, so that row is returned instead.</p>
    <p>The visualization assumes activities of one user never overlap and never share a start date, and it rejects input that breaks this.</p>
  </>} />
}
