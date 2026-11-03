import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, sql, phases } from './algorithm'
import { meta } from './meta'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python, sql,
  inputLabel: 'Object with a content table (content_id, content_text)',
  url: 'https://leetcode.com/problems/first-letter-capitalization-ii/description/',
  complexity: 'Teaching model: one lowercase pass and one regex-style pass per row. Visualization caps the table at 12 rows.',
  examples: [
    { label: 'Example', input: '{"content":[{"content_id":4,"content_text":"data-DRIVEN design"},{"content_id":1,"content_text":"x-RAY VISION"},{"content_id":2,"content_text":"x2-plans now"}]}' },
    { label: 'Hyphen run', input: '{"content":[{"content_id":5,"content_text":"top-OF-the list"}]}' },
  ],
}

function RowTable({ rows, columns }) {
  return <table className="problem-table">
    <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
    <tbody>{rows.length === 0 ? <tr><td colSpan={columns.length}>No rows</td></tr>
      : rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column}>{String(row[column] ?? '')}</td>)}</tr>)}</tbody>
  </table>
}

export default function Problem3374() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <RowTable rows={step.rows} columns={['content_id', 'content_text']} />
    <output aria-label="Current state">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>A word starts at the beginning of the text or right after a separator. Matching that position with a pattern and uppercasing only the letter there handles every word in one rule.</p>
    <p>Digits never start a capitalized word in this rule, so x2-plans becomes X2-Plans: the x is the first letter, and plans follows the hyphen.</p>
  </>} />
}
