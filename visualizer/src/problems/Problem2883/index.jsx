import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MaskFilterView from './MaskFilterView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2883', phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with students: rows of student_id, name (null when missing) and age',
  url: 'https://leetcode.com/problems/drop-missing-data/',
  complexity: 'O(r) time and space for r rows. The visualization caps the table at 14 rows.',
  examples: [
    { label: 'Two gaps', input: '{"students":[{"student_id":501,"name":"Noor","age":11},{"student_id":502,"name":null,"age":13},{"student_id":507,"name":"Tomas","age":12},{"student_id":510,"name":null,"age":15},{"student_id":514,"name":"Ines","age":10}]}' },
    { label: 'Empty text is not missing', input: '{"students":[{"student_id":61,"name":"","age":17},{"student_id":62,"name":null,"age":16},{"student_id":63,"name":"Kofi","age":18}]}' },
    { label: 'Every name missing', input: '{"students":[{"student_id":8,"name":null,"age":9},{"student_id":9,"name":null,"age":14}]}' },
    { label: 'Nothing missing', input: '{"students":[{"student_id":70,"name":"Yara","age":20},{"student_id":71,"name":"Dev","age":21}]}' },
  ],
}

export default function DropMissingData() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <MaskFilterView run={run} step={step} />} renderReasoning={() => <>
    <p>Only the name column decides. A boolean mask gives one True or False per row, and indexing the table with that mask keeps the True rows in their original order.</p>
    <p>Missing means null. An empty string is a real value, so its row stays. Surviving rows keep their index labels, which is why the result can show gaps such as 0, 2, 4.</p>
  </>} />
}
