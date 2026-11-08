import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const WORK_COLUMNS = ['record_id', 'book_id', 'borrower_name', 'borrow_date', 'return_date']
const RESULT_COLUMNS = ['book_id', 'title']

function RowTable({ label, rows, columns }) {
  return (
    <section>
      <h4>{label}</h4>
      {rows.length === 0 ? <p>No rows yet.</p> : (
        <table aria-label={label}>
          <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
          <tbody>{rows.map((row, index) => (
            <tr key={index}>{columns.map(column => <td key={column}>{row[column] === null ? 'NULL' : String(row[column])}</td>)}</tr>
          ))}</tbody>
        </table>
      )}
    </section>
  )
}

function StageRail({ phases, active }) {
  return <ol aria-label="SQL stages" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', listStyle: 'none', padding: 0 }}>
    {phases.map(phase => <li key={phase.id} aria-current={phase.id === active ? 'step' : undefined}
      style={{ border: '1px solid var(--surface2)', borderRadius: 6, padding: '4px 10px', background: phase.id === active ? 'var(--primary)' : 'var(--surface2)', color: phase.id === active ? 'var(--on-primary, #fff)' : 'var(--text)' }}>
      <strong>{phase.label}</strong>
    </li>)}
  </ol>
}

const definition = {
  number: '3570',
  phases: [
    { id: 'load', label: 'Load', description: 'Read the books and borrowing records.' },
    { id: 'filter', label: 'Open loans', description: 'Keep records with no return date.' },
    { id: 'count', label: 'Count', description: 'Count open loans for each book.' },
    { id: 'compare', label: 'Compare', description: 'Check open loans against total copies.' },
    { id: 'output', label: 'Output', description: 'Return the exhausted books by id.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with library_books and borrowing_records lists (return_date null means still out)',
  url: 'https://leetcode.com/problems/find-books-with-no-available-copies/description/',
  complexity: 'O(b + r) time for b books and r borrowing records in this trace, using one pass to count open loans.',
  examples: [
    {
      label: 'Sample',
      input: '{"library_books":[{"book_id":1,"title":"Atlas","author":"Ruiz","genre":"fiction","publication_year":2001,"total_copies":2},{"book_id":2,"title":"Brook","author":"Chen","genre":"science","publication_year":2010,"total_copies":1},{"book_id":3,"title":"Cedar","author":"Okafor","genre":"history","publication_year":1999,"total_copies":3},{"book_id":4,"title":"Delta","author":"Park","genre":"fiction","publication_year":2018,"total_copies":1}],"borrowing_records":[{"record_id":1,"book_id":1,"borrower_name":"ann","borrow_date":"2024-01-01","return_date":"2024-01-10"},{"record_id":2,"book_id":1,"borrower_name":"bo","borrow_date":"2024-02-01","return_date":null},{"record_id":3,"book_id":1,"borrower_name":"cy","borrow_date":"2024-02-05","return_date":null},{"record_id":4,"book_id":2,"borrower_name":"dee","borrow_date":"2024-03-01","return_date":null},{"record_id":5,"book_id":3,"borrower_name":"eve","borrow_date":"2024-03-02","return_date":null},{"record_id":6,"book_id":3,"borrower_name":"fay","borrow_date":"2024-03-03","return_date":"2024-03-20"},{"record_id":7,"book_id":4,"borrower_name":"gus","borrow_date":"2024-01-05","return_date":"2024-01-06"},{"record_id":8,"book_id":2,"borrower_name":"hal","borrow_date":"2023-10-15","return_date":null}]}',
    },
    {
      label: 'Fully on loan',
      input: '{"library_books":[{"book_id":7,"title":"Fern","author":"Kim","genre":"poetry","publication_year":2015,"total_copies":2}],"borrowing_records":[{"record_id":9,"book_id":7,"borrower_name":"ivy","borrow_date":"2024-05-01","return_date":null},{"record_id":10,"book_id":7,"borrower_name":"jan","borrow_date":"2024-05-02","return_date":null}]}',
    },
    { label: 'One book out', input: '{"library_books":[{"book_id":1,"title":"Atlas","total_copies":1}],"borrowing_records":[{"record_id":1,"book_id":1,"borrow_date":"2024-03-01","return_date":null}]}' },
    { label: 'Equal copies and dates', input: '{"library_books":[{"book_id":1,"title":"Atlas","total_copies":2},{"book_id":2,"title":"Bird","total_copies":2}],"borrowing_records":[{"record_id":1,"book_id":1,"borrow_date":"2024-03-01","return_date":"2024-03-10"},{"record_id":2,"book_id":2,"borrow_date":"2024-03-01","return_date":null}]}' },
    { label: 'Large copy count', input: '{"library_books":[{"book_id":4,"title":"Stack","total_copies":50}],"borrowing_records":[{"record_id":9,"book_id":4,"borrow_date":"2024-02-14","return_date":"2024-02-20"}]}' },
    { label: 'Long run: 8 books, 16 records', input: '{"library_books":[{"book_id":1,"title":"Book 1","total_copies":1},{"book_id":2,"title":"Book 2","total_copies":1},{"book_id":3,"title":"Book 3","total_copies":3},{"book_id":4,"title":"Book 4","total_copies":1},{"book_id":5,"title":"Book 5","total_copies":2},{"book_id":6,"title":"Book 6","total_copies":2},{"book_id":7,"title":"Book 7","total_copies":2},{"book_id":8,"title":"Book 8","total_copies":3}],"borrowing_records":[{"record_id":1,"book_id":5,"borrow_date":"2024-05-01","return_date":null},{"record_id":2,"book_id":5,"borrow_date":"2024-05-03","return_date":"2024-06-16"},{"record_id":3,"book_id":4,"borrow_date":"2024-05-09","return_date":"2024-06-27"},{"record_id":4,"book_id":5,"borrow_date":"2024-05-09","return_date":null},{"record_id":5,"book_id":2,"borrow_date":"2024-05-24","return_date":"2024-06-13"},{"record_id":6,"book_id":8,"borrow_date":"2024-05-01","return_date":null},{"record_id":7,"book_id":1,"borrow_date":"2024-05-16","return_date":"2024-06-20"},{"record_id":8,"book_id":4,"borrow_date":"2024-05-11","return_date":null},{"record_id":9,"book_id":2,"borrow_date":"2024-05-05","return_date":"2024-06-17"},{"record_id":10,"book_id":4,"borrow_date":"2024-05-24","return_date":"2024-06-23"},{"record_id":11,"book_id":6,"borrow_date":"2024-05-22","return_date":null},{"record_id":12,"book_id":1,"borrow_date":"2024-05-17","return_date":null},{"record_id":13,"book_id":8,"borrow_date":"2024-05-10","return_date":null},{"record_id":14,"book_id":8,"borrow_date":"2024-05-06","return_date":null},{"record_id":15,"book_id":5,"borrow_date":"2024-05-03","return_date":"2024-06-01"},{"record_id":16,"book_id":4,"borrow_date":"2024-05-13","return_date":null}]}' },
  ],
}

export default function FindBooksWithNoAvailableCopies() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <StageRail phases={definition.phases} active={step.phase} />
    <RowTable label="Working rows" rows={step.rows} columns={WORK_COLUMNS} />
    <RowTable label="Result so far" rows={step.result} columns={RESULT_COLUMNS} />
  </>} renderReasoning={() => <>
    <p>A record with no return date is a copy still on loan. Count those per book, then compare the count with the number of copies the library owns.</p>
    <p>The test is reached-or-exceeded, so a book whose last copy is out is listed.</p>
  </>} />
}
