import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'

const code = `show the first three rows of a table
  take rows from position 0 up to position 3
  keep their original order
  return them`
const python = `import pandas as pd

def first_three(employees):
    return employees.head(3)`

function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.rows)) throw new Error('Use { "rows": [ {...}, ... ] }.')
  return input
}

function buildTrace({ rows }) {
  const frames = [{ phase: 'start', activeLine: 1, message: `The table has ${rows.length} row(s).`, at: -1, out: [] }]
  const out = []
  for (let i = 0; i < Math.min(3, rows.length); i++) {
    out.push(JSON.stringify(rows[i]))
    frames.push({ phase: 'step', activeLine: 2, message: `Keep row ${i}.`, at: i, out: [...out] })
  }
  frames.push({ phase: 'done', activeLine: 4, message: `${out.length} row(s) returned; the rest are not shown.`, at: -1, out: [...out] })
  return { frames }
}

const definition = {
  phases: [
    { id: 'start', label: 'Table', description: 'Look at the whole table.' },
    { id: 'step', label: 'Take row', description: 'Keep one of the first three rows.' },
    { id: 'done', label: 'Head', description: 'The first rows are returned.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with rows (list of row objects)',
  url: 'https://leetcode.com/problems/display-the-first-three-rows/',
  complexity: 'O(1) for three rows; the cost does not grow with the table.',
  examples: [
    { label: 'Five rows', input: '{"rows":[{"id":1},{"id":2},{"id":3},{"id":4},{"id":5}]}' },
    { label: 'Two rows', input: '{"rows":[{"id":"a"},{"id":"b"}]}' },
  ],
}

export default function DisplayFirstThreeRows() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Returned rows" length={step.out.length} valueAt={i => step.out[i]} active={step.at} />
  </>} renderReasoning={() => <>
    <p>A prefix is the first few items in the order they already have. Nothing is reordered or recomputed.</p>
  </>} />
}
