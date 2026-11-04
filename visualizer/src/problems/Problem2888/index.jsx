import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import StackView from './StackView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with df1 and df2, each a list of rows with student_id, name and age',
  url: 'https://leetcode.com/problems/reshape-data-concatenate/',
  complexity: 'O(a + b) time and space for a and b rows. The visualization caps each frame at 20 rows; the code has no such limit.',
  examples: [
    { label: 'Two classes', input: JSON.stringify({ df1: [{ student_id: 11, name: 'Priya', age: 9 }, { student_id: 12, name: 'Tomas', age: 14 }, { student_id: 13, name: 'Wen', age: 12 }], df2: [{ student_id: 21, name: 'Nadia', age: 10 }, { student_id: 22, name: 'Omar', age: 16 }] }) },
    { label: 'Empty df2', input: JSON.stringify({ df1: [{ student_id: 40, name: 'Ines', age: 13 }], df2: [] }) },
    { label: 'Same student twice', input: JSON.stringify({ df1: [{ student_id: 7, name: 'Kofi', age: 11 }], df2: [{ student_id: 7, name: 'Kofi', age: 11 }, { student_id: 8, name: 'Lena', age: 15 }] }) },
  ],
}

export default function ReshapeDataConcatenate() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <StackView run={run} step={step} />} renderReasoning={() => <>
    <p>Vertical stacking adds rows, not columns. Both tables have the same columns, so each row fits straight under the last one.</p>
    <p>Each DataFrame numbers its rows from 0. Without ignore_index the result would hold two rows labelled 0, so the labels are rebuilt from the top.</p>
    <p>Concatenating does no matching or de-duplicating: a student listed in both tables appears twice.</p>
  </>} />
}
