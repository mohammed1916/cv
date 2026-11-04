import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import ConversionView from './ConversionView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2886', phases,
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with students (student_id, name, age, grade)',
  url: 'https://leetcode.com/problems/change-data-type/',
  complexity: 'O(n) time for n rows, since every grade is converted once. The visualization shows up to 12 students.',
  examples: [
    { label: 'Whole grades', input: '{"students":[{"student_id":31,"name":"Noor","age":12,"grade":64.0},{"student_id":32,"name":"Theo","age":14,"grade":91.0},{"student_id":33,"name":"Priya","age":13,"grade":58.0}]}' },
    { label: 'Fractions are cut', input: '{"students":[{"student_id":7,"name":"Ines","age":16,"grade":79.9},{"student_id":8,"name":"Omar","age":15,"grade":0.5}]}' },
    { label: 'No rows', input: '{"students":[]}' },
  ],
}

export default function ChangeDataType() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <ConversionView step={step} />} renderReasoning={() => <>
    <p>A float column prints as 64.0 even when the value is whole. Asking pandas for the integer type changes how the column is stored, and only that column is assigned back.</p>
    <p>The conversion cuts off anything after the point instead of rounding, so 79.9 becomes 79. The steps visit one row at a time for clarity, though pandas handles the whole column in a single call.</p>
  </>} />
}
