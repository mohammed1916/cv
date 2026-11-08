import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SqlStages from './SqlStages'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with Candidates and Rounds tables'
const complexity = 'O(c + r) time for c candidates and r rounds using a map of totals. The visualizer caps each table at 12 rows.'
const examples = [
  { label: 'Sample', input: '{"Candidates":[{"candidate_id":11,"name":"Ava","years_of_exp":3,"interview_id":101},{"candidate_id":12,"name":"Ben","years_of_exp":1,"interview_id":102},{"candidate_id":13,"name":"Cy","years_of_exp":2,"interview_id":103},{"candidate_id":14,"name":"Dee","years_of_exp":5,"interview_id":104},{"candidate_id":15,"name":"Eli","years_of_exp":2,"interview_id":105},{"candidate_id":16,"name":"Fay","years_of_exp":2,"interview_id":106}],"Rounds":[{"interview_id":101,"round_id":1,"score":8},{"interview_id":101,"round_id":2,"score":9},{"interview_id":102,"round_id":1,"score":20},{"interview_id":103,"round_id":1,"score":7},{"interview_id":103,"round_id":2,"score":8},{"interview_id":104,"round_id":1,"score":10},{"interview_id":104,"round_id":2,"score":6},{"interview_id":105,"round_id":1,"score":5},{"interview_id":105,"round_id":2,"score":5},{"interview_id":105,"round_id":3,"score":5}]}' },
  { label: 'Total exactly 15', input: '{"Candidates":[{"candidate_id":1,"name":"Gia","years_of_exp":2,"interview_id":7}],"Rounds":[{"interview_id":7,"round_id":1,"score":15}]}' }, { label: "Single candidate", input: "{\"Candidates\":[{\"candidate_id\":1,\"name\":\"Ada\",\"years_of_exp\":2,\"interview_id\":10}],\"Rounds\":[{\"interview_id\":10,\"round_id\":1,\"score\":16}]}" }, { label: "Total of exactly 15", input: "{\"Candidates\":[{\"candidate_id\":2,\"name\":\"Ben\",\"years_of_exp\":5,\"interview_id\":11}],\"Rounds\":[{\"interview_id\":11,\"round_id\":1,\"score\":15}]}" }, { label: "No rounds count as zero", input: "{\"Candidates\":[{\"candidate_id\":3,\"name\":\"Cy\",\"years_of_exp\":9,\"interview_id\":12}],\"Rounds\":[{\"interview_id\":99,\"round_id\":1,\"score\":3}]}" }, { label: "Long run: 12 candidates", input: "{\"Candidates\":[{\"candidate_id\":1,\"name\":\"C1\",\"years_of_exp\":4,\"interview_id\":1},{\"candidate_id\":2,\"name\":\"C2\",\"years_of_exp\":3,\"interview_id\":2},{\"candidate_id\":3,\"name\":\"C3\",\"years_of_exp\":1,\"interview_id\":3},{\"candidate_id\":4,\"name\":\"C4\",\"years_of_exp\":5,\"interview_id\":4},{\"candidate_id\":5,\"name\":\"C5\",\"years_of_exp\":2,\"interview_id\":5},{\"candidate_id\":6,\"name\":\"C6\",\"years_of_exp\":2,\"interview_id\":6},{\"candidate_id\":7,\"name\":\"C7\",\"years_of_exp\":2,\"interview_id\":7},{\"candidate_id\":8,\"name\":\"C8\",\"years_of_exp\":2,\"interview_id\":8},{\"candidate_id\":9,\"name\":\"C9\",\"years_of_exp\":5,\"interview_id\":9},{\"candidate_id\":10,\"name\":\"C10\",\"years_of_exp\":1,\"interview_id\":10},{\"candidate_id\":11,\"name\":\"C11\",\"years_of_exp\":3,\"interview_id\":11},{\"candidate_id\":12,\"name\":\"C12\",\"years_of_exp\":0,\"interview_id\":12}],\"Rounds\":[{\"interview_id\":1,\"round_id\":1,\"score\":6},{\"interview_id\":2,\"round_id\":1,\"score\":0},{\"interview_id\":3,\"round_id\":1,\"score\":10},{\"interview_id\":4,\"round_id\":1,\"score\":9},{\"interview_id\":5,\"round_id\":1,\"score\":4},{\"interview_id\":6,\"round_id\":1,\"score\":1},{\"interview_id\":7,\"round_id\":1,\"score\":0},{\"interview_id\":8,\"round_id\":1,\"score\":2},{\"interview_id\":9,\"round_id\":1,\"score\":10},{\"interview_id\":10,\"round_id\":1,\"score\":3},{\"interview_id\":11,\"round_id\":1,\"score\":0},{\"interview_id\":12,\"round_id\":1,\"score\":2}]}" },
]

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

export default function AcceptedCandidatesFromInterviews() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <SqlStages code={code} activeLine={step.activeLine} />
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <>
    <p>The round scores are summed per interview first. Each candidate then joins to exactly one interview total.</p>
    <p>Both conditions must hold: at least two years of experience, and a total strictly greater than 15. A total of exactly 15 fails.</p>
  </>} />
}
