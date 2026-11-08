import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, sql, phases } from './algorithm'
import { meta } from './meta'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python, sql,
  inputLabel: 'Object with a content table (content_id, content_text)',
  url: 'https://leetcode.com/problems/first-letter-capitalization/description/',
  complexity: 'Teaching model: one string rebuild per row. Visualization caps the table at 12 rows.',
  examples: [
    { label: 'Example', input: '{"content":[{"content_id":3,"content_text":"SQL is fun"},{"content_id":1,"content_text":"hello WORLD"},{"content_id":2,"content_text":"x2 PLANS"}]}' },
    { label: 'Single letter', input: '{"content":[{"content_id":9,"content_text":"a"}]}' },
    { label: 'Single digit row', input: '{"content":[{"content_id":4,"content_text":"7"}]}' },
    { label: 'Equal text, different ids', input: '{"content":[{"content_id":5,"content_text":"HELLO world"},{"content_id":2,"content_text":"HELLO world"}]}' },
    { label: 'Forty-character text', input: '{"content":[{"content_id":8,"content_text":"ABCDEFGHIJ KLMNOPQRST UVWXYZabcdef 0123"}]}' },
    { label: 'Long run: 12 rows', input: '{"content":[{"content_id":40,"content_text":"hwkew wvog zrj"},{"content_id":43,"content_text":"taleww"},{"content_id":46,"content_text":"njkded kuds qedhk"},{"content_id":49,"content_text":"jgqkl"},{"content_id":52,"content_text":"pntqpvc"},{"content_id":55,"content_text":"fhmirj kvtb"},{"content_id":58,"content_text":"vnt xyscud hc nf"},{"content_id":61,"content_text":"celr vqwwhw"},{"content_id":64,"content_text":"qells fyexa hdqf ipfae"},{"content_id":67,"content_text":"rdntw klejcku x j"},{"content_id":70,"content_text":"yeh"},{"content_id":73,"content_text":"scrtez"}]}' },
  ],
}

function RowTable({ rows, columns }) {
  return <table className="problem-table">
    <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
    <tbody>{rows.length === 0 ? <tr><td colSpan={columns.length}>No rows</td></tr>
      : rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column}>{String(row[column] ?? '')}</td>)}</tr>)}</tbody>
  </table>
}

export default function Problem3368() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <RowTable rows={step.rows} columns={['content_id', 'content_text']} />
    <output aria-label="Current state">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Lowercasing everything first means the only uppercase letter left is the one we place on purpose.</p>
    <p>LEFT takes the first character and SUBSTRING takes everything after it, so the two pieces can be transformed separately and joined with CONCAT.</p>
  </>} />
}
