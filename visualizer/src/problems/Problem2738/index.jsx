import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python, phases, sample } from './algorithm'
import { meta } from './meta'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Files as JSON',
  url: 'https://leetcode.com/problems/count-occurrences-in-text/',
  complexity: 'One substring check per file and per target word, so O(files × targets) checks on the file text.',
  examples: [{ label: 'Sample tables', input: JSON.stringify(sample) }],
}

function RowTable({ rows }) {
  if (!rows.length) return <p>No rows yet.</p>
  const columns = Object.keys(rows[0])
  return <table>
    <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
    <tbody>{rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column}>{String(row[column] ?? '')}</td>)}</tr>)}</tbody>
  </table>
}

// One chip per SQL stage, in the order the query runs, with the current stage filled.
function StageStrip({ phases = [], current }) {
  const at = Math.max(0, phases.findIndex(p => p.id === current))
  return <ol aria-label="SQL stages" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, listStyle: 'none', padding: 0, margin: '0 0 12px' }}>
    {phases.map((p, i) => <li key={p.id} aria-current={p.id === current ? 'step' : undefined} style={{
      padding: '4px 10px', borderRadius: 6, fontSize: 13, color: 'var(--text)',
      border: p.id === current ? '2px solid var(--primary)' : '1px solid var(--border)',
      background: i <= at ? 'var(--primary-glow)' : 'var(--surface)', opacity: i <= at ? 1 : 0.6,
    }}>{p.label}</li>)}
  </ol>
}

export default function CountOccurrences() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <StageStrip phases={definition.phases} current={step.phase} />
    <h3>{meta.title}: working table</h3>
    <RowTable rows={step.rows} />
  </>} renderReasoning={() => <>
    <p>A file counts for a word only when the word has a space on both sides, so “bulls”, “bullish” and a word followed by a period do not match.</p>
    <p>Each word is counted once per file that contains it, so the result is the number of files, not the number of matches inside a file.</p>
    <p>Both target words are returned, so a word that never appears still gets a zero row. The sample table is invented.</p>
  </>} />
}
