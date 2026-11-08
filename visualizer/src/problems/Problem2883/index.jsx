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
    { label: "One missing name", input: "{\"students\":[{\"student_id\":1,\"name\":null,\"age\":10}]}" },
    { label: "Equal ages, one missing name", input: "{\"students\":[{\"student_id\":2,\"name\":null,\"age\":12},{\"student_id\":3,\"name\":\"Ivo\",\"age\":12}]}" },
    { label: "Maximum rows, alternating missing", input: "{\"students\":[{\"student_id\":300,\"name\":null,\"age\":9},{\"student_id\":301,\"name\":\"P1\",\"age\":10},{\"student_id\":302,\"name\":null,\"age\":11},{\"student_id\":303,\"name\":\"P3\",\"age\":12},{\"student_id\":304,\"name\":null,\"age\":13},{\"student_id\":305,\"name\":\"P5\",\"age\":14},{\"student_id\":306,\"name\":null,\"age\":15},{\"student_id\":307,\"name\":\"P7\",\"age\":16},{\"student_id\":308,\"name\":null,\"age\":17},{\"student_id\":309,\"name\":\"P9\",\"age\":18},{\"student_id\":310,\"name\":null,\"age\":19},{\"student_id\":311,\"name\":\"P11\",\"age\":20},{\"student_id\":312,\"name\":null,\"age\":21},{\"student_id\":313,\"name\":\"P13\",\"age\":22}]}" },
    { label: "Long run: 14 students", input: "{\"students\":[{\"student_id\":400,\"name\":null,\"age\":16},{\"student_id\":401,\"name\":\"uha\",\"age\":17},{\"student_id\":402,\"name\":null,\"age\":10},{\"student_id\":403,\"name\":\"xz\",\"age\":10},{\"student_id\":404,\"name\":null,\"age\":10},{\"student_id\":405,\"name\":null,\"age\":10},{\"student_id\":406,\"name\":null,\"age\":18},{\"student_id\":407,\"name\":null,\"age\":15},{\"student_id\":408,\"name\":\"avc\",\"age\":10},{\"student_id\":409,\"name\":\"gpp\",\"age\":14},{\"student_id\":410,\"name\":\"af\",\"age\":18},{\"student_id\":411,\"name\":null,\"age\":17},{\"student_id\":412,\"name\":\"fpq\",\"age\":13},{\"student_id\":413,\"name\":null,\"age\":11}]}" },
  ],
}

export default function DropMissingData() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <MaskFilterView run={run} step={step} />} renderReasoning={() => <>
    <p>Only the name column decides. A boolean mask gives one True or False per row, and indexing the table with that mask keeps the True rows in their original order.</p>
    <p>Missing means null. An empty string is a real value, so its row stays. Surviving rows keep their index labels, which is why the result can show gaps such as 0, 2, 4.</p>
  </>} />
}
