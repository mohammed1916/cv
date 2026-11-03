import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'

const code = `build a table from rows and column names
  table = empty list of records
  for each row in the list
    record = pair each column name with the row's value
    append record to table
  return table`
const python = `import pandas as pd

def create_dataframe(student_data):
    return pd.DataFrame(student_data, columns=["student_id", "age"])`

function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.data) || !Array.isArray(input.columns)) {
    throw new Error('Use { "columns": [...], "data": [[...], ...] }.')
  }
  if (input.data.some(row => !Array.isArray(row) || row.length !== input.columns.length)) {
    throw new Error('Each row must have one value per column.')
  }
  return input
}

function buildTrace({ columns, data }) {
  const out = []
  const frames = [{ phase: 'start', activeLine: 1, message: `Columns: ${columns.join(', ')}.`, at: -1, out: [] }]
  data.forEach((row, i) => {
    const record = columns.map((c, j) => `${c}=${JSON.stringify(row[j])}`).join(' ')
    out.push(record)
    frames.push({ phase: 'step', activeLine: 4, message: `Row ${i} becomes ${record}.`, at: i, out: [...out] })
  })
  frames.push({ phase: 'done', activeLine: 5, message: `${data.length} row(s) in the table.`, at: -1, out: [...out] })
  return { frames }
}

const definition = {
  phases: [
    { id: 'start', label: 'Columns', description: 'Read the column names.' },
    { id: 'step', label: 'Row', description: 'Pair one row with its column names.' },
    { id: 'done', label: 'Table', description: 'The table has every row.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with columns and data (rows)',
  url: 'https://leetcode.com/problems/create-a-dataframe-from-list/',
  complexity: 'O(rows * columns) to pair every value with its column name.',
  examples: [
    { label: 'Two rows', input: '{"columns":["student_id","age"],"data":[[101,18],[102,20]]}' },
  ],
}

export default function CreateDataFrameFromList() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Table rows" length={step.out.length} valueAt={i => step.out[i]} active={step.at} />
  </>} renderReasoning={() => <>
    <p>A table is a list of rows plus a list of names. The names give meaning to each position in a row.</p>
    <p>Each row keeps its order, so the first list item is always the first table row.</p>
  </>} />
}
