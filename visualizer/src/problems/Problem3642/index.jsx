import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, SAMPLE_TEXT } from './algorithm'

function StageRail({ phases, active }) {
  return <ol aria-label="SQL stages" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', listStyle: 'none', padding: 0 }}>
    {phases.map(phase => <li key={phase.id} aria-current={phase.id === active ? 'step' : undefined}
      style={{ border: '1px solid var(--surface2)', borderRadius: 6, padding: '4px 10px', background: phase.id === active ? 'var(--primary)' : 'var(--surface2)', color: phase.id === active ? 'var(--primary-contrast)' : 'var(--text)' }}>
      <strong>{phase.label}</strong>
    </li>)}
  </ol>
}

const definition = {
  phases: [
    { id: 'load', label: 'Load', description: 'Read every review.' },
    { id: 'count', label: 'Count', description: 'Tally high, middle and low ratings for one book.' },
    { id: 'reject', label: 'Reject', description: 'Too few reviews, a middle rating, or one side missing.' },
    { id: 'keep', label: 'Polarized', description: 'Only high and low ratings, with both present.' },
    { id: 'order', label: 'Order', description: 'Sort by title.' },
    { id: 'done', label: 'Result', description: 'Report the polarized books.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with books, reviews and min_reviews',
  complexity: 'O(B * R) with a simple filter per book.',
  examples: [{ label: 'Sample', input: SAMPLE_TEXT },
  { label: 'One book, one review', input: '{"books":[{"book_id":1,"title":"Lone"}],"reviews":[{"book_id":1,"rating":3}],"min_reviews":1}' },
  { label: 'Equal ratings at the minimum', input: '{"books":[{"book_id":1,"title":"Ash"},{"book_id":2,"title":"Birch"}],"reviews":[{"book_id":1,"rating":2},{"book_id":1,"rating":2},{"book_id":2,"rating":4},{"book_id":2,"rating":4}],"min_reviews":2}' },
  { label: 'Extreme ratings', input: '{"books":[{"book_id":1,"title":"Edge"}],"reviews":[{"book_id":1,"rating":1},{"book_id":1,"rating":5},{"book_id":1,"rating":5}],"min_reviews":3}' },
  { label: 'Long run: 6 books, 30 reviews', input: '{"books":[{"book_id":1,"title":"Book1"},{"book_id":2,"title":"Book2"},{"book_id":3,"title":"Book3"},{"book_id":4,"title":"Book4"},{"book_id":5,"title":"Book5"},{"book_id":6,"title":"Book6"}],"reviews":[{"book_id":1,"rating":4},{"book_id":1,"rating":3},{"book_id":5,"rating":5},{"book_id":2,"rating":1},{"book_id":3,"rating":4},{"book_id":4,"rating":4},{"book_id":1,"rating":2},{"book_id":1,"rating":2},{"book_id":1,"rating":3},{"book_id":6,"rating":4},{"book_id":2,"rating":1},{"book_id":4,"rating":3},{"book_id":5,"rating":5},{"book_id":3,"rating":2},{"book_id":6,"rating":4},{"book_id":1,"rating":1},{"book_id":4,"rating":4},{"book_id":1,"rating":3},{"book_id":2,"rating":4},{"book_id":6,"rating":2},{"book_id":6,"rating":5},{"book_id":4,"rating":3},{"book_id":6,"rating":1},{"book_id":3,"rating":5},{"book_id":1,"rating":1},{"book_id":6,"rating":5},{"book_id":1,"rating":2},{"book_id":2,"rating":4},{"book_id":4,"rating":1},{"book_id":1,"rating":4}],"min_reviews":4}' }],
}

const cell = { border: '1px solid currentColor', padding: '4px 8px' }

function Rows({ columns = [], rows = [] }) {
  if (rows.length === 0) return <p>No rows yet.</p>
  return <table style={{ borderCollapse: 'collapse' }}>
    <thead><tr>{columns.map(c => <th key={c} style={cell}>{c}</th>)}</tr></thead>
    <tbody>{rows.map((row, i) => <tr key={i}>{columns.map(c => <td key={c} style={cell}>{String(row[c])}</td>)}</tr>)}</tbody>
  </table>
}

export default function FindBooksWithPolarizedOpinions() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <StageRail phases={definition.phases} active={step.phase} />
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Ratings are grouped into high (4 or 5), middle (3) and low (1 or 2). A polarized book has no middle ratings.</p>
    <p>The review count must reach the minimum, and both the high and the low side must be present.</p>
  </>} />
}
