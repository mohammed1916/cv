import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SqlStages from './SqlStages'
import { buildTrace, parseInput, code, python, sampleText } from './algorithm'

const definition = {
  phases: [
    { id: 'load', label: 'Load', description: 'Read every confirmation event.' },
    { id: 'group', label: 'Group', description: 'Count total and confirmed events per user.' },
    { id: 'rate', label: 'Rate', description: 'Divide, round to two decimals, and default to zero.' },
    { id: 'done', label: 'Result', description: 'Report every signed-up user.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with Signups (user_id, time_stamp) and Confirmations (user_id, time_stamp, action)',
  url: 'https://leetcode.com/problems/confirmation-rate/',
  complexity: 'O(s + c) for s signups and c confirmation events, using one grouping pass and one lookup per signup.',
  examples: [
    { label: 'Sample', input: sampleText },
    { label: 'One user, one timeout', input: '{"Signups":[{"user_id":1,"time_stamp":"2026-01-01 09:00:00"}],"Confirmations":[{"user_id":1,"time_stamp":"2026-01-01 09:01:00","action":"timeout"}]}' },
    { label: 'Two users, equal timestamps', input: '{"Signups":[{"user_id":1,"time_stamp":"2026-01-01 09:00:00"},{"user_id":2,"time_stamp":"2026-01-01 09:00:00"}],"Confirmations":[{"user_id":1,"time_stamp":"2026-01-01 09:05:00","action":"confirmed"},{"user_id":2,"time_stamp":"2026-01-01 09:05:00","action":"timeout"}]}' },
    { label: 'Long run: 30 signups and 60 confirmations', input: '{"Signups":[{"user_id":32,"time_stamp":"2026-01-01 09:00:00"},{"user_id":29,"time_stamp":"2026-01-02 09:01:00"},{"user_id":6,"time_stamp":"2026-01-03 09:02:00"},{"user_id":11,"time_stamp":"2026-01-04 09:03:00"},{"user_id":20,"time_stamp":"2026-01-05 09:04:00"},{"user_id":9,"time_stamp":"2026-01-06 09:05:00"},{"user_id":34,"time_stamp":"2026-01-07 09:06:00"},{"user_id":31,"time_stamp":"2026-01-08 09:07:00"},{"user_id":8,"time_stamp":"2026-01-09 09:08:00"},{"user_id":38,"time_stamp":"2026-01-10 09:09:00"},{"user_id":27,"time_stamp":"2026-01-11 09:10:00"},{"user_id":28,"time_stamp":"2026-01-12 09:11:00"},{"user_id":1,"time_stamp":"2026-01-13 09:12:00"},{"user_id":26,"time_stamp":"2026-01-14 09:13:00"},{"user_id":39,"time_stamp":"2026-01-15 09:14:00"},{"user_id":13,"time_stamp":"2026-01-16 09:15:00"},{"user_id":30,"time_stamp":"2026-01-17 09:16:00"},{"user_id":25,"time_stamp":"2026-01-18 09:17:00"},{"user_id":2,"time_stamp":"2026-01-19 09:18:00"},{"user_id":5,"time_stamp":"2026-01-20 09:19:00"},{"user_id":14,"time_stamp":"2026-01-21 09:20:00"},{"user_id":19,"time_stamp":"2026-01-22 09:21:00"},{"user_id":36,"time_stamp":"2026-01-23 09:22:00"},{"user_id":17,"time_stamp":"2026-01-24 09:23:00"},{"user_id":23,"time_stamp":"2026-01-25 09:24:00"},{"user_id":37,"time_stamp":"2026-01-26 09:25:00"},{"user_id":4,"time_stamp":"2026-01-27 09:26:00"},{"user_id":33,"time_stamp":"2026-01-28 09:27:00"},{"user_id":16,"time_stamp":"2026-01-01 09:28:00"},{"user_id":18,"time_stamp":"2026-01-02 09:29:00"}],"Confirmations":[{"user_id":7,"time_stamp":"2026-02-01 23:52:00","action":"timeout"},{"user_id":19,"time_stamp":"2026-02-02 19:08:00","action":"timeout"},{"user_id":15,"time_stamp":"2026-02-03 23:44:00","action":"timeout"},{"user_id":27,"time_stamp":"2026-02-04 03:00:00","action":"timeout"},{"user_id":15,"time_stamp":"2026-02-05 23:56:00","action":"timeout"},{"user_id":27,"time_stamp":"2026-02-06 11:28:00","action":"timeout"},{"user_id":7,"time_stamp":"2026-02-07 15:40:00","action":"timeout"},{"user_id":35,"time_stamp":"2026-02-08 19:56:00","action":"timeout"},{"user_id":31,"time_stamp":"2026-02-09 15:44:00","action":"timeout"},{"user_id":35,"time_stamp":"2026-02-10 11:52:00","action":"timeout"},{"user_id":23,"time_stamp":"2026-02-11 07:00:00","action":"timeout"},{"user_id":27,"time_stamp":"2026-02-12 11:52:00","action":"timeout"},{"user_id":31,"time_stamp":"2026-02-13 07:48:00","action":"timeout"},{"user_id":19,"time_stamp":"2026-02-14 03:24:00","action":"timeout"},{"user_id":31,"time_stamp":"2026-02-15 23:56:00","action":"timeout"},{"user_id":3,"time_stamp":"2026-02-16 19:44:00","action":"timeout"},{"user_id":31,"time_stamp":"2026-02-17 23:00:00","action":"timeout"},{"user_id":11,"time_stamp":"2026-02-18 03:00:00","action":"timeout"},{"user_id":23,"time_stamp":"2026-02-19 15:12:00","action":"timeout"},{"user_id":3,"time_stamp":"2026-02-20 11:00:00","action":"timeout"},{"user_id":23,"time_stamp":"2026-02-21 15:12:00","action":"timeout"},{"user_id":27,"time_stamp":"2026-02-22 11:56:00","action":"timeout"},{"user_id":7,"time_stamp":"2026-02-23 23:32:00","action":"timeout"},{"user_id":27,"time_stamp":"2026-02-24 19:28:00","action":"timeout"},{"user_id":39,"time_stamp":"2026-02-25 15:44:00","action":"timeout"},{"user_id":3,"time_stamp":"2026-02-26 19:48:00","action":"timeout"},{"user_id":15,"time_stamp":"2026-02-27 23:16:00","action":"timeout"},{"user_id":11,"time_stamp":"2026-02-28 19:56:00","action":"timeout"},{"user_id":23,"time_stamp":"2026-02-01 23:16:00","action":"timeout"},{"user_id":11,"time_stamp":"2026-02-02 19:36:00","action":"timeout"},{"user_id":39,"time_stamp":"2026-02-03 23:00:00","action":"timeout"},{"user_id":3,"time_stamp":"2026-02-04 19:52:00","action":"timeout"},{"user_id":7,"time_stamp":"2026-02-05 15:08:00","action":"timeout"},{"user_id":35,"time_stamp":"2026-02-06 19:40:00","action":"timeout"},{"user_id":31,"time_stamp":"2026-02-07 23:00:00","action":"timeout"},{"user_id":27,"time_stamp":"2026-02-08 19:36:00","action":"timeout"},{"user_id":23,"time_stamp":"2026-02-09 23:44:00","action":"timeout"},{"user_id":35,"time_stamp":"2026-02-10 11:12:00","action":"timeout"},{"user_id":15,"time_stamp":"2026-02-11 15:08:00","action":"timeout"},{"user_id":3,"time_stamp":"2026-02-12 19:28:00","action":"timeout"},{"user_id":7,"time_stamp":"2026-02-13 23:44:00","action":"timeout"},{"user_id":27,"time_stamp":"2026-02-14 11:04:00","action":"timeout"},{"user_id":39,"time_stamp":"2026-02-15 23:40:00","action":"timeout"},{"user_id":35,"time_stamp":"2026-02-16 03:52:00","action":"timeout"},{"user_id":7,"time_stamp":"2026-02-17 15:12:00","action":"timeout"},{"user_id":11,"time_stamp":"2026-02-18 03:28:00","action":"timeout"},{"user_id":39,"time_stamp":"2026-02-19 15:56:00","action":"timeout"},{"user_id":27,"time_stamp":"2026-02-20 03:04:00","action":"timeout"},{"user_id":23,"time_stamp":"2026-02-21 15:56:00","action":"timeout"},{"user_id":11,"time_stamp":"2026-02-22 19:00:00","action":"timeout"},{"user_id":31,"time_stamp":"2026-02-23 07:16:00","action":"timeout"},{"user_id":35,"time_stamp":"2026-02-24 19:08:00","action":"timeout"},{"user_id":15,"time_stamp":"2026-02-25 15:52:00","action":"timeout"},{"user_id":19,"time_stamp":"2026-02-26 11:48:00","action":"timeout"},{"user_id":7,"time_stamp":"2026-02-27 15:24:00","action":"timeout"},{"user_id":27,"time_stamp":"2026-02-28 03:48:00","action":"timeout"},{"user_id":31,"time_stamp":"2026-02-01 15:52:00","action":"timeout"},{"user_id":27,"time_stamp":"2026-02-02 19:00:00","action":"timeout"},{"user_id":39,"time_stamp":"2026-02-03 23:40:00","action":"timeout"},{"user_id":35,"time_stamp":"2026-02-04 03:28:00","action":"timeout"}]}' },
  ],
}

function CurrentTable({ table }) {
  return <div style={{ overflowX: 'auto' }} role="region" aria-label="Current rows">
    <table>
      <thead><tr>{table.columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
      <tbody>{table.rows.length
        ? table.rows.map((row, index) => <tr key={index}>{table.columns.map(column => <td key={column}>{String(row[column])}</td>)}</tr>)
        : <tr><td colSpan={table.columns.length}>No rows yet</td></tr>}</tbody>
    </table>
  </div>
}

export default function ConfirmationRate() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <SqlStages code={code} activeLine={step.activeLine} />
    <CurrentTable table={step.table} />
  </>} renderReasoning={() => <>
    <p>Count every confirmation event for each user, and count the ones marked confirmed.</p>
    <p>Start from the signups, not from the events, so a user with no events still appears, with a rate of zero. Events from users who never signed up are ignored.</p>
  </>} />
}
