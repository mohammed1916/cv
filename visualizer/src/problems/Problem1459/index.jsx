import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python } from './algorithm'

const phases = [
  { id: 'load', label: 'Points', description: 'Read the points and order them by x, then y.' },
  { id: 'pair', label: 'Pairs', description: 'Test each pair as opposite corners of a rectangle.' },
  { id: 'sort', label: 'Sort', description: 'Order the rectangles by area, then by corners.' },
  { id: 'done', label: 'Result', description: 'Return the rectangles with positive area.' },
]

const CELL = { border: '1px solid currentColor', padding: '2px 8px' }


const definition = {
  number: '1459', phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Object with a Points list of { id, x_value, y_value } rows',
  url: 'https://leetcode.com/problems/rectangles-area/',
  complexity: 'O(p^2) pairs for p points, plus a sort of the rectangles found.',
  examples: [
    { label: 'Example', input: '{"Points":[{"id":1,"x_value":1,"y_value":1},{"id":2,"x_value":3,"y_value":4},{"id":3,"x_value":1,"y_value":4},{"id":4,"x_value":3,"y_value":1},{"id":5,"x_value":2,"y_value":2}]}' },
    { label: 'Corner pair', input: '{"Points":[{"id":1,"x_value":0,"y_value":0},{"id":2,"x_value":0,"y_value":5},{"id":3,"x_value":4,"y_value":0}]}' },
    { label: 'One point', input: '{"Points":[{"id":1,"x_value":0,"y_value":0}]}' },
    { label: 'Shared x value', input: '{"Points":[{"id":1,"x_value":3,"y_value":1},{"id":2,"x_value":3,"y_value":9}]}' },
    { label: 'Largest: 12 points', input: '{"Points":[{"id":1,"x_value":100,"y_value":50},{"id":2,"x_value":92,"y_value":51},{"id":3,"x_value":84,"y_value":52},{"id":4,"x_value":76,"y_value":53},{"id":5,"x_value":68,"y_value":54},{"id":6,"x_value":60,"y_value":55},{"id":7,"x_value":52,"y_value":56},{"id":8,"x_value":44,"y_value":57},{"id":9,"x_value":36,"y_value":58},{"id":10,"x_value":28,"y_value":59},{"id":11,"x_value":20,"y_value":60},{"id":12,"x_value":12,"y_value":61}]}' },
    { label: 'Long run: 12 points', input: '{"Points":[{"id":1,"x_value":18,"y_value":71},{"id":2,"x_value":66,"y_value":78},{"id":3,"x_value":19,"y_value":16},{"id":4,"x_value":95,"y_value":6},{"id":5,"x_value":21,"y_value":28},{"id":6,"x_value":45,"y_value":79},{"id":7,"x_value":68,"y_value":93},{"id":8,"x_value":92,"y_value":74},{"id":9,"x_value":12,"y_value":58},{"id":10,"x_value":43,"y_value":57},{"id":11,"x_value":63,"y_value":27},{"id":12,"x_value":35,"y_value":17}]}' },
  ],
}

const cell = { border: '1px solid var(--border)', padding: '4px 8px', textAlign: 'left', color: 'var(--text)' }

// The stage strip shows where the query is; the table shows the rows held at this stage.
// Rows that were not in the previous stage are marked "new".
function StageTable({ run, step, phases }) {
  const view = step.view || {}
  const caption = view.caption || step.caption || 'Current rows'
  const rows = view.rows || step.rows || []
  const columns = view.columns || step.columns || (rows[0] ? Object.keys(rows[0]) : [])
  const index = run.frames.indexOf(step)
  const prior = index > 0 ? run.frames[index - 1] : null
  const previous = prior ? (prior.view?.rows || prior.rows || []) : []
  const seen = new Set(previous.map(row => JSON.stringify(row)))
  return <section aria-label="Current table">
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>{phases.map(p => <span key={p.id} style={{ padding: '3px 8px', borderRadius: 999, fontSize: 12, border: '1px solid var(--border)', background: p.id === step.phase ? 'var(--primary)' : 'var(--surface2)', color: p.id === step.phase ? 'var(--text)' : 'var(--text)' }}>{p.label}</span>)}</div>
    <h3 style={{ margin: '0 0 6px', fontSize: 16, color: 'var(--text)' }}>{caption}</h3>
    <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14, color: 'var(--text)' }}>
      <thead><tr>{columns.map(column => <th key={column} style={cell}>{column}</th>)}<th style={cell}>change</th></tr></thead>
      <tbody>{rows.length
        ? rows.map((row, i) => {
          const isNew = !seen.has(JSON.stringify(row))
          return <tr key={i} style={{ background: isNew ? 'var(--surface2)' : 'transparent' }}>
            {columns.map(column => <td key={column} style={cell}>{String(row[column] ?? 'NULL')}</td>)}
            <td style={cell}>{isNew ? 'new' : ''}</td>
          </tr>
        })
        : <tr><td style={cell} colSpan={columns.length + 1}>No rows</td></tr>}</tbody>
    </table>
  </section>
}

export default function RectanglesArea() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <p>{step.message}</p>
    <StageTable run={run} step={step} phases={definition.phases} />
  </>} renderReasoning={() => <>
    <p>Sample tables are invented for this walkthrough.</p>
    <p>Two points can be opposite corners only when they differ in both coordinates. Their area is the width times the height, and each pair is listed once with its smaller corner first.</p>
  </>} />
}
