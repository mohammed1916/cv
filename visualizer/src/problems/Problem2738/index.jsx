import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python, phases, sample } from './algorithm'
import { meta } from './meta'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Files as JSON',
  url: 'https://leetcode.com/problems/count-occurrences-in-text/',
  complexity: 'Knowledge-derived walkthrough: one pass over each file’s words per target.',
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

export default function CountOccurrences() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <h3>{meta.title}: working table</h3>
    <RowTable rows={step.rows} />
  </>} renderReasoning={() => <>
    <p>Knowledge-derived walkthrough written for this visualizer. The sample tables are invented.</p>
    <p>Words are compared as whole tokens, so “bulls” and “bullish” do not count as “bull”.</p>
    <p>Both target words are returned, so a word that never appears still gets a zero row.</p>
  </>} />
}
