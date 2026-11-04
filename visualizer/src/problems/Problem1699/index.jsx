import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python } from './algorithm'
import { meta } from './meta'

// The query's stages as a strip. The stage that runs at this step is highlighted.
const STAGES = [
  { id: 'load', label: 'FROM Calls' },
  { id: 'pair', label: 'Order each pair (CASE)' },
  { id: 'group', label: 'GROUP BY person1, person2' },
  { id: 'done', label: 'ORDER BY' },
]

const CELL = { border: '1px solid var(--border)', padding: '3px 8px', color: 'var(--text)', fontFamily: 'monospace' }

function TableView({ caption, columns, rows, highlight = -1 }) {
  return <table aria-label={caption} style={{ borderCollapse: 'collapse' }}>
    <caption style={{ textAlign: 'left', color: 'var(--text)', marginBottom: 4 }}>{caption}</caption>
    <thead><tr>{columns.map(column => <th key={column} scope="col" style={CELL}>{column}</th>)}</tr></thead>
    <tbody>{rows.length === 0
      ? <tr><td style={CELL} colSpan={Math.max(1, columns.length)}>No rows yet</td></tr>
      : rows.map((row, index) => <tr key={index} style={{ background: index === highlight ? 'var(--surface2)' : undefined, fontWeight: index === highlight ? 700 : 400 }}>
        {columns.map(column => <td key={column} style={CELL}>{String(row[column])}</td>)}
      </tr>)}</tbody>
  </table>
}

const definition = {
  number: meta.number, phases: [
    { id: 'load', label: 'Calls', description: 'Read every call with its two people and duration.' },
    { id: 'pair', label: 'Pair', description: 'Order the two people and add the call to that pair.' },
    { id: 'done', label: 'Result', description: 'Report each pair once with its totals.' },
  ], parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Object with a Calls list of { from_id, to_id, duration } rows',
  url: 'https://leetcode.com/problems/number-of-calls-between-two-persons/',
  complexity: 'O(n) pass over the calls, with one running total per unordered pair.',
  examples: [
    { label: 'Example', input: '{"Calls":[{"from_id":1,"to_id":2,"duration":60},{"from_id":2,"to_id":1,"duration":30},{"from_id":3,"to_id":4,"duration":100},{"from_id":4,"to_id":3,"duration":40},{"from_id":3,"to_id":4,"duration":10}]}' },
  ],
}

export default function NumberOfCallsBetweenTwoPersons() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const stageIndex = step.phase === 'load' ? 0 : step.phase === 'pair' ? 1 : 3
    // The call being grouped is the Nth pair frame, counting from the first one.
    const callRow = step.phase === 'pair' ? run.frames.slice(0, run.frames.indexOf(step) + 1).filter(f => f.phase === 'pair').length - 1 : -1
    return <>
      <ol aria-label="Query stages" style={{ listStyle: 'none', padding: 0, margin: '0 0 10px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {STAGES.map((stage, i) => <li key={stage.id} aria-current={i === stageIndex ? 'step' : undefined} style={{
          padding: '4px 8px', borderRadius: 6, fontFamily: 'monospace', color: 'var(--text)',
          border: `2px solid ${i === stageIndex ? 'var(--primary)' : 'var(--border)'}`, background: i === stageIndex ? 'var(--surface2)' : 'transparent',
        }}>{stage.label}</li>)}
      </ol>
      <p>{step.message}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' }}>
        {step.phase !== 'done' && <TableView caption="Calls, read in order" columns={['from_id', 'to_id', 'duration']} rows={run.input.Calls.slice(0, Math.max(1, callRow + 1))} highlight={callRow} />}
        <TableView caption={step.phase === 'done' ? 'Result: one row per pair' : 'Pair totals so far'} columns={step.columns} rows={step.rows} />
      </div>
    </>
  }} renderReasoning={() => <>
    <p>Calls from 1 to 2 and calls from 2 to 1 belong to the same pair, so each call is first put in a canonical order, the smaller id first.</p>
    <p>The totals per pair are then a single grouping: count the rows and add their durations.</p>
  </>} />
}
