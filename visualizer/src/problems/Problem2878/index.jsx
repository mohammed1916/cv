import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'

const code = `report the size of a table
  rows = number of rows
  columns = number of columns
  return [rows, columns]`
const python = `import pandas as pd

def get_size(students):
    return list(students.shape)`

function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.columns) || !Array.isArray(input.data)) {
    throw new Error('Use { "columns": [...], "data": [[...], ...] }.')
  }
  if (input.data.some(row => !Array.isArray(row) || row.length !== input.columns.length)) {
    throw new Error('Each row must have one value per column.')
  }
  return input
}

function buildTrace({ columns, data }) {
  const frames = [
    { phase: 'start', activeLine: 2, message: `Count the rows: ${data.length}.`, at: 0, out: [String(data.length), '?'] },
    { phase: 'step', activeLine: 3, message: `Count the columns: ${columns.length}.`, at: 1, out: [String(data.length), String(columns.length)] },
    { phase: 'done', activeLine: 4, message: `Size is [${data.length}, ${columns.length}].`, at: -1, out: [String(data.length), String(columns.length)] },
  ]
  return { frames }
}

const definition = {
  phases: [
    { id: 'start', label: 'Rows', description: 'Count the rows.' },
    { id: 'step', label: 'Columns', description: 'Count the columns.' },
    { id: 'done', label: 'Size', description: 'Return the pair.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with columns and data (rows)',
  url: 'https://leetcode.com/problems/get-the-size-of-a-dataframe/',
  complexity: 'O(1) once the table is known; counting its rows and columns is direct.',
  examples: [
    { label: 'Three by two', input: '{"columns":["id","name"],"data":[[1,"a"],[2,"b"],[3,"c"]]}' },
  ],
}

export default function GetSizeOfDataFrame() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Size as [rows, columns]" length={step.out.length} valueAt={i => step.out[i]} active={step.at} />
  </>} renderReasoning={() => <>
    <p>The shape is a pair: the first number counts rows, the second counts columns. The header row is not a data row.</p>
  </>} />
}
