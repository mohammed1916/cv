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
    { label: 'Single hyphen row', input: '{"content":[{"content_id":1,"content_text":"a-b"}]}' },
    { label: 'Equal text, different ids', input: '{"content":[{"content_id":6,"content_text":"x-RAY"},{"content_id":3,"content_text":"x-RAY"}]}' },
    { label: 'Forty-character hyphens', input: '{"content":[{"content_id":9,"content_text":"a-b-c-d-e-f-g-h-i-j-k-l-m-n-o-p-q-r-s-t-"}]}' },
    { label: 'Long run: 12 rows', input: '{"content":[{"content_id":50,"content_text":"k-w"},{"content_id":51,"content_text":"qxk-euo"},{"content_id":52,"content_text":"yp-aiilt"},{"content_id":53,"content_text":"ieccw-csq"},{"content_id":54,"content_text":"f-svthpe"},{"content_id":55,"content_text":"oav-nduzx"},{"content_id":56,"content_text":"owgyi-vyan"},{"content_id":57,"content_text":"a-s"},{"content_id":58,"content_text":"yvycll-hcln"},{"content_id":59,"content_text":"n-ysaiv"},{"content_id":60,"content_text":"crwjqe-v"},{"content_id":61,"content_text":"ykgnx-c"}]}' },
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
