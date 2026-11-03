import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
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
  examples: [{ label: 'Sample', input: sampleText }],
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
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <CurrentTable table={step.table} />} renderReasoning={() => <>
    <p>Count every confirmation event for each user, and count the ones marked confirmed.</p>
    <p>Start from the signups, not from the events, so a user with no events still appears, with a rate of zero. Events from users who never signed up are ignored.</p>
  </>} />
}
