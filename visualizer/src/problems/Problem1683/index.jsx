import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { sql, code, python, phases, inputLabel, complexity, examples, buildTrace, parseInput } from './algorithm'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, sql, python, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity, examples,
}

// The query as clauses: the clause that is running at this step is highlighted.
const CLAUSES = [
  { line: 1, text: 'SELECT tweet_id' },
  { line: 2, text: 'FROM Tweets' },
  { line: 3, text: 'WHERE CHAR_LENGTH(content) > 15' },
  { line: 4, text: 'ORDER BY tweet_id' },
]

const STATUS_STYLE = {
  kept: { background: 'var(--primary)', color: 'var(--on-primary, #fff)' },
  dropped: { background: 'var(--surface2)', color: 'var(--text-muted, var(--text))' },
  checking: { border: '2px solid var(--primary)' },
  waiting: { color: 'var(--text-muted, var(--text))' },
}

function Rows({ columns = [], rows = [] }) {
  return <div style={{ overflowX: 'auto' }}>
    <table>
      <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
      <tbody>{rows.map((row, index) => <tr key={index} style={STATUS_STYLE[row.status] ?? undefined}>
        {columns.map(column => <td key={column}>{String(row[column] ?? '')}</td>)}
      </tr>)}</tbody>
    </table>
  </div>
}

export default function InvalidTweets() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <ol aria-label="Query clauses" style={{ listStyle: 'none', padding: 0, margin: '0 0 10px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {CLAUSES.map(clause => <li key={clause.line} aria-current={step.activeLine === clause.line ? 'step' : undefined} style={{
        fontFamily: 'monospace', padding: '4px 8px', borderRadius: 6,
        border: `2px solid ${step.activeLine === clause.line ? 'var(--primary)' : 'var(--border)'}`,
        background: step.activeLine === clause.line ? 'var(--surface2)' : 'transparent', color: 'var(--text)',
      }}>{clause.text}</li>)}
    </ol>
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output" style={{ display: 'block', marginTop: 10 }}>{step.phase === 'done' ? `Output ids: ${run.result.join(', ') || 'none'}` : `Kept so far: ${step.kept.join(', ') || 'none'}`}</output>
  </>} renderReasoning={() => <>
    <p><strong>Filter each row:</strong> the WHERE clause decides row by row, so the length of the content is the only thing that matters.</p>
    <p><strong>Boundary:</strong> the rule is a strict comparison, so content of exactly fifteen characters is dropped.</p>
  </>} />
}
