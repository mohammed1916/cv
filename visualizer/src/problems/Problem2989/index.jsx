import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SqlStageBoard from './SqlStageBoard'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with a Scores table (student_id, student_name, assignment1, assignment2, assignment3)'
const complexity = 'One pass over the score rows: O(n) time. The visualizer caps the table at 20 rows.'
const examples = [{
  label: 'Sample',
  input: '{"Scores":[{"student_id":1,"student_name":"Ivy","assignment1":10,"assignment2":20,"assignment3":30},{"student_id":2,"student_name":"Jo","assignment1":5,"assignment2":5,"assignment3":5},{"student_id":3,"student_name":"Kai","assignment1":40,"assignment2":10,"assignment3":0},{"student_id":4,"student_name":"Lu","assignment1":25,"assignment2":25,"assignment3":25}]}',
},
  { label: "Single student", input: '{"Scores":[{"student_id":1,"student_name":"Ivy","assignment1":12,"assignment2":8,"assignment3":30}]}' },
  { label: "Equal totals", input: '{"Scores":[{"student_id":1,"student_name":"Jo","assignment1":10,"assignment2":10,"assignment3":10},{"student_id":2,"student_name":"Kai","assignment1":30,"assignment2":0,"assignment3":0}]}' },
  { label: "Maximum scores", input: '{"Scores":[{"student_id":1,"student_name":"Lu","assignment1":100,"assignment2":100,"assignment3":100},{"student_id":2,"student_name":"Mo","assignment1":0,"assignment2":0,"assignment3":0}]}' },
  { label: "Long run: 20 students", input: '{"Scores":[{"student_id":1,"student_name":"Oz","assignment1":38,"assignment2":52,"assignment3":46},{"student_id":2,"student_name":"Kai","assignment1":56,"assignment2":84,"assignment3":2},{"student_id":3,"student_name":"Pia","assignment1":82,"assignment2":39,"assignment3":96},{"student_id":4,"student_name":"Jo","assignment1":34,"assignment2":13,"assignment3":99},{"student_id":5,"student_name":"Pia","assignment1":45,"assignment2":31,"assignment3":63},{"student_id":6,"student_name":"Ned","assignment1":43,"assignment2":35,"assignment3":99},{"student_id":7,"student_name":"Oz","assignment1":38,"assignment2":16,"assignment3":7},{"student_id":8,"student_name":"Pia","assignment1":72,"assignment2":89,"assignment3":2},{"student_id":9,"student_name":"Lu","assignment1":31,"assignment2":86,"assignment3":57},{"student_id":10,"student_name":"Lu","assignment1":63,"assignment2":61,"assignment3":8},{"student_id":11,"student_name":"Kai","assignment1":60,"assignment2":50,"assignment3":84},{"student_id":12,"student_name":"Jo","assignment1":45,"assignment2":81,"assignment3":33},{"student_id":13,"student_name":"Pia","assignment1":40,"assignment2":76,"assignment3":33},{"student_id":14,"student_name":"Oz","assignment1":91,"assignment2":66,"assignment3":19},{"student_id":15,"student_name":"Oz","assignment1":8,"assignment2":21,"assignment3":52},{"student_id":16,"student_name":"Lu","assignment1":50,"assignment2":75,"assignment3":5},{"student_id":17,"student_name":"Ned","assignment1":65,"assignment2":18,"assignment3":95},{"student_id":18,"student_name":"Lu","assignment1":72,"assignment2":65,"assignment3":70},{"student_id":19,"student_name":"Pia","assignment1":12,"assignment2":65,"assignment3":65},{"student_id":20,"student_name":"Pia","assignment1":93,"assignment2":77,"assignment3":66}]}' },
]

const stagesOf = run => run.frames.map(f => ({
  id: f.phase, clause: code[f.activeLine - 1]?.text.trim() ?? '', label: phases.find(p => p.id === f.phase)?.label ?? f.phase,
  columns: f.columns, rows: f.rows,
}))

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, sql, python, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity, examples,
}

function Rows({ columns = [], rows = [] }) {
  return <div style={{ overflowX: 'auto' }}>
    <table>
      <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
      <tbody>{rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column}>{String(row[column] ?? '')}</td>)}</tr>)}</tbody>
    </table>
  </div>
}

export default function ClassPerformanceVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <SqlStageBoard title="Query stages" stages={stagesOf(run)} active={run.frames.indexOf(step)} />
    <output aria-label="Query output">{step.phase === 'done' ? `Difference: ${run.result[0].difference_in_score}` : step.message}</output>
  </>} renderReasoning={() => <>
    <p>Each student’s total is the sum of the three assignment columns in that row.</p>
    <p>The answer is the highest total minus the lowest total, so one pass for the totals and one comparison pass are enough.</p>
  </>} />
}
