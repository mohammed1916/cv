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
    { label: "One row in each frame", input: "{\"df1\":[{\"student_id\":1,\"name\":\"Ana\",\"age\":9}],\"df2\":[{\"student_id\":2,\"name\":\"Bo\",\"age\":10}]}" },
    { label: "Equal ages in both frames", input: "{\"df1\":[{\"student_id\":3,\"name\":\"Cy\",\"age\":11}],\"df2\":[{\"student_id\":4,\"name\":\"Di\",\"age\":11}]}" },
    { label: "Twenty rows in one frame", input: "{\"df1\":[{\"student_id\":1,\"name\":\"N0\",\"age\":8},{\"student_id\":2,\"name\":\"N1\",\"age\":9},{\"student_id\":3,\"name\":\"N2\",\"age\":10},{\"student_id\":4,\"name\":\"N3\",\"age\":11},{\"student_id\":5,\"name\":\"N4\",\"age\":12},{\"student_id\":6,\"name\":\"N5\",\"age\":13},{\"student_id\":7,\"name\":\"N6\",\"age\":14},{\"student_id\":8,\"name\":\"N7\",\"age\":15},{\"student_id\":9,\"name\":\"N8\",\"age\":16},{\"student_id\":10,\"name\":\"N9\",\"age\":8},{\"student_id\":11,\"name\":\"N10\",\"age\":9},{\"student_id\":12,\"name\":\"N11\",\"age\":10},{\"student_id\":13,\"name\":\"N12\",\"age\":11},{\"student_id\":14,\"name\":\"N13\",\"age\":12},{\"student_id\":15,\"name\":\"N14\",\"age\":13},{\"student_id\":16,\"name\":\"N15\",\"age\":14},{\"student_id\":17,\"name\":\"N16\",\"age\":15},{\"student_id\":18,\"name\":\"N17\",\"age\":16},{\"student_id\":19,\"name\":\"N18\",\"age\":8},{\"student_id\":20,\"name\":\"N19\",\"age\":9}],\"df2\":[]}" },
    { label: "Long run: 20 rows split across frames", input: "{\"df1\":[{\"student_id\":50,\"name\":\"ggo\",\"age\":7},{\"student_id\":51,\"name\":\"em\",\"age\":14},{\"student_id\":52,\"name\":\"emu\",\"age\":15},{\"student_id\":53,\"name\":\"paf\",\"age\":15},{\"student_id\":54,\"name\":\"jzai\",\"age\":6},{\"student_id\":55,\"name\":\"vy\",\"age\":10},{\"student_id\":56,\"name\":\"iakqp\",\"age\":12},{\"student_id\":57,\"name\":\"crs\",\"age\":14},{\"student_id\":58,\"name\":\"reg\",\"age\":13},{\"student_id\":59,\"name\":\"endo\",\"age\":10},{\"student_id\":60,\"name\":\"vmav\",\"age\":17},{\"student_id\":61,\"name\":\"rsj\",\"age\":17}],\"df2\":[{\"student_id\":80,\"name\":\"xh\",\"age\":18},{\"student_id\":81,\"name\":\"ak\",\"age\":10},{\"student_id\":82,\"name\":\"wte\",\"age\":16},{\"student_id\":83,\"name\":\"dudu\",\"age\":14},{\"student_id\":84,\"name\":\"wrwmc\",\"age\":9},{\"student_id\":85,\"name\":\"scox\",\"age\":11},{\"student_id\":86,\"name\":\"ahs\",\"age\":7},{\"student_id\":87,\"name\":\"pt\",\"age\":15}]}" },
  ],
}

export default function ReshapeDataConcatenate() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <StackView run={run} step={step} />} renderReasoning={() => <>
    <p>Vertical stacking adds rows, not columns. Both tables have the same columns, so each row fits straight under the last one.</p>
    <p>Each DataFrame numbers its rows from 0. Without ignore_index the result would hold two rows labelled 0, so the labels are rebuilt from the top.</p>
    <p>Concatenating does no matching or de-duplicating: a student listed in both tables appears twice.</p>
  </>} />
}
