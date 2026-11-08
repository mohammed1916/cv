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
    { label: "Single student with zero grade", input: "{\"students\":[{\"student_id\":1,\"name\":\"Ana\",\"age\":14,\"grade\":0}]}" },
    { label: "Equal grades", input: "{\"students\":[{\"student_id\":2,\"name\":\"Bo\",\"age\":15,\"grade\":90.5},{\"student_id\":3,\"name\":\"Cy\",\"age\":16,\"grade\":90.5}]}" },
    { label: "Largest grades", input: "{\"students\":[{\"student_id\":4,\"name\":\"Di\",\"age\":17,\"grade\":999999999.9},{\"student_id\":5,\"name\":\"Ed\",\"age\":17,\"grade\":-999999999.9}]}" },
    { label: "Long run: 12 students", input: "{\"students\":[{\"student_id\":600,\"name\":\"bxm\",\"age\":17,\"grade\":51.5},{\"student_id\":601,\"name\":\"rrj\",\"age\":13,\"grade\":10.5},{\"student_id\":602,\"name\":\"vyrse\",\"age\":12,\"grade\":89.4},{\"student_id\":603,\"name\":\"wr\",\"age\":13,\"grade\":82.3},{\"student_id\":604,\"name\":\"qkr\",\"age\":16,\"grade\":16.7},{\"student_id\":605,\"name\":\"mlvr\",\"age\":16,\"grade\":46.8},{\"student_id\":606,\"name\":\"kfoob\",\"age\":12,\"grade\":59.2},{\"student_id\":607,\"name\":\"rykeq\",\"age\":15,\"grade\":25.4},{\"student_id\":608,\"name\":\"exttk\",\"age\":14,\"grade\":24},{\"student_id\":609,\"name\":\"uhznq\",\"age\":15,\"grade\":6.5},{\"student_id\":610,\"name\":\"jd\",\"age\":14,\"grade\":64.3},{\"student_id\":611,\"name\":\"qlum\",\"age\":13,\"grade\":47.9}]}" },
  ],
}

export default function ChangeDataType() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <ConversionView step={step} />} renderReasoning={() => <>
    <p>A float column prints as 64.0 even when the value is whole. Asking pandas for the integer type changes how the column is stored, and only that column is assigned back.</p>
    <p>The conversion cuts off anything after the point instead of rounding, so 79.9 becomes 79. The steps visit one row at a time for clarity, though pandas handles the whole column in a single call.</p>
  </>} />
}
