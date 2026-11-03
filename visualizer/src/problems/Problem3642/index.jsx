import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, SAMPLE_TEXT } from './algorithm'

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
  inputLabel: 'Object with books, reviews and min_reviews (knowledge-derived sample)',
  complexity: 'O(B * R) with a simple filter per book. Knowledge-derived draft; the polarization rule is not yet verified against the official statement.',
  examples: [{ label: 'Sample', input: SAMPLE_TEXT }],
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
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Ratings are grouped into high (4 or 5), middle (3) and low (1 or 2). A polarized book has no middle ratings.</p>
    <p>The review count must reach the minimum, and both the high and the low side must be present.</p>
  </>} />
}
