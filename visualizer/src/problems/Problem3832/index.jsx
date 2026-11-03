import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, sampleText } from './algorithm'

const definition = {
  phases: [
    { id: 'load', label: 'Load', description: 'Read every activity row.' },
    { id: 'days', label: 'Days', description: 'Keep only user-days with one action.' },
    { id: 'run', label: 'Runs', description: 'Join consecutive dates with the same action.' },
    { id: 'choose', label: 'Choose', description: 'Pick each user best run.' },
    { id: 'order', label: 'Order', description: 'Sort by length, then user.' },
    { id: 'done', label: 'Result', description: 'Report the rows.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with an activity list of user_id, action_date (YYYY-MM-DD) and action',
  url: 'https://leetcode.com/problems/find-users-with-persistent-behavior-patterns/',
  complexity: 'O(a log a) for a activity rows, plus a scan of the runs.',
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

export default function FindUsersWithPersistentBehaviorPatterns() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <CurrentTable table={step.table} />} renderReasoning={() => <>
    <p>A day counts only when a user has exactly one action on it. A run is a stretch of such days with the same action and no calendar gap.</p>
    <p>Subtracting a running count from the date gives a constant value across each run, which lets the rows be grouped into runs.</p>
  </>} />
}
