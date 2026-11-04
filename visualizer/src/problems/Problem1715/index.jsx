import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python } from './algorithm'
import { meta } from './meta'

const phases = [
  { id: 'load', label: 'Boxes', description: 'Read each box with its own apples and oranges.' },
  { id: 'join', label: 'Chests', description: 'Add the chest contents of each box that refers to one.' },
  { id: 'done', label: 'Total', description: 'Sum the contributions of every box.' },
]

const CELL = { border: '1px solid var(--border)', padding: '3px 8px', color: 'var(--text)', fontFamily: 'monospace' }

function TableView({ caption, columns, rows, highlightIndex = -1 }) {
  return <table aria-label={caption} style={{ borderCollapse: 'collapse' }}>
    <caption style={{ textAlign: 'left', color: 'var(--text)', marginBottom: 4 }}>{caption}</caption>
    <thead><tr>{columns.map(column => <th key={column} scope="col" style={CELL}>{column}</th>)}</tr></thead>
    <tbody>{rows.length === 0
      ? <tr><td style={CELL} colSpan={Math.max(1, columns.length)}>No rows yet</td></tr>
      : rows.map((row, index) => <tr key={index} style={{ background: index === highlightIndex ? 'var(--surface2)' : undefined, fontWeight: index === highlightIndex ? 700 : 400 }}>
        {columns.map(column => <td key={column} style={CELL}>{String(row[column] ?? 'null')}</td>)}
      </tr>)}</tbody>
  </table>
}

const definition = {
  number: meta.number, phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Object with Boxes ({ box_id, chest_id or null, apple_count, orange_count }) and Chests ({ chest_id, apple_count, orange_count }) lists',
  url: 'https://leetcode.com/problems/count-apples-and-oranges',
  complexity: 'O(n + m) with a lookup of chests by id, for n boxes and m chests.',
  examples: [
    { label: 'Example', input: '{"Boxes":[{"box_id":1,"chest_id":1,"apple_count":2,"orange_count":1},{"box_id":2,"chest_id":null,"apple_count":4,"orange_count":0},{"box_id":3,"chest_id":2,"apple_count":1,"orange_count":1},{"box_id":4,"chest_id":1,"apple_count":0,"orange_count":2}],"Chests":[{"chest_id":1,"apple_count":3,"orange_count":0},{"chest_id":2,"apple_count":0,"orange_count":5}]}' },
  ],
}

export default function CountApplesAndOranges() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { Chests } = run.input
    const joined = step.phase === 'join' ? step.rows[step.rows.length - 1] : null
    const referenced = joined ? joined.chest_id : null
    const chestIndex = Chests.findIndex(c => c.chest_id === referenced)
    return <>
      <p>{step.message}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' }}>
        <TableView caption="Boxes with their totals" columns={step.columns} rows={step.rows} highlightIndex={step.phase === 'join' ? step.rows.length - 1 : -1} />
        <TableView caption="Chests (the current box's chest is highlighted)" columns={['chest_id', 'apple_count', 'orange_count']} rows={Chests} highlightIndex={chestIndex} />
      </div>
      {referenced === null && joined && <p style={{ color: 'var(--text-muted, var(--text))' }}>This box has no chest, so the left join keeps its own counts only.</p>}
    </>
  }} renderReasoning={() => <>
    <p>A left join keeps every box, even one without a chest. A chest that several boxes refer to is counted once for each box that refers to it.</p>
  </>} />
}
