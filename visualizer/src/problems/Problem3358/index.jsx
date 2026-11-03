import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, sql, phases } from './algorithm'
import { meta } from './meta'

const COLUMNS = ['book_id', 'title', 'author', 'published_year', 'rating']

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python, sql,
  inputLabel: 'Object with a books table (book_id, title, author, published_year, rating)',
  url: 'https://leetcode.com/problems/books-with-null-ratings/description/',
  complexity: 'Teaching model: one scan with a NULL test per row. Visualization caps the table at 12 rows.',
  examples: [
    { label: 'Example', input: '{"books":[{"book_id":1,"title":"Dune","author":"Herbert","published_year":1965,"rating":4.5},{"book_id":2,"title":"Ulysses","author":"Joyce","published_year":1922,"rating":null},{"book_id":3,"title":"Emma","author":"Austen","published_year":1815,"rating":0},{"book_id":4,"title":"Beloved","author":"Morrison","published_year":1987,"rating":null},{"book_id":5,"title":"Notes","author":"Anon","published_year":2000,"rating":null}]}' },
    { label: 'Zeros only', input: '{"books":[{"book_id":7,"title":"Zero Star","author":"A","published_year":2001,"rating":0}]}' },
  ],
}

function RowTable({ rows, columns }) {
  return <table className="problem-table">
    <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
    <tbody>{rows.length === 0 ? <tr><td colSpan={columns.length}>No rows</td></tr>
      : rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column}>{row[column] === null ? 'NULL' : String(row[column] ?? '')}</td>)}</tr>)}</tbody>
  </table>
}

export default function Problem3358() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <RowTable rows={step.rows} columns={step.rows[0] && 'author' in step.rows[0] ? COLUMNS : ['book_id', 'title']} />
    <output aria-label="Current state">{step.result ? `Result: ${run.result.length} book${run.result.length === 1 ? '' : 's'}` : step.message}</output>
  </>} renderReasoning={() => <>
    <p>In SQL a missing value is not equal to anything, so a comparison with zero or with an equals sign never matches NULL. The test has to be IS NULL.</p>
    <p>A zero rating is a real value and is therefore excluded from this result.</p>
  </>} />
}
