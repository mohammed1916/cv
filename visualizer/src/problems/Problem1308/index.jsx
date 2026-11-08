import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python, phases, sample } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Score rows as JSON',
  url: 'https://leetcode.com/problems/running-total-for-different-genders/',
  complexity: 'Walkthrough: one pass to group by gender and day, then one running sum per gender.',
  examples: [{ label: 'Sample scores', input: JSON.stringify(sample) },
    { label: "Single row", input: "{\"scores\":[{\"player_name\":\"Ann\",\"gender\":\"female\",\"day\":\"2019-05-01\",\"score_points\":3}]}" },
    { label: "Equal daily totals", input: "{\"scores\":[{\"player_name\":\"Bo\",\"gender\":\"male\",\"day\":\"2019-05-01\",\"score_points\":5},{\"player_name\":\"Cy\",\"gender\":\"male\",\"day\":\"2019-05-01\",\"score_points\":5}]}" },
    { label: "Zero and large points", input: "{\"scores\":[{\"player_name\":\"Di\",\"gender\":\"female\",\"day\":\"2019-05-01\",\"score_points\":0},{\"player_name\":\"Ed\",\"gender\":\"female\",\"day\":\"2019-05-02\",\"score_points\":1000}]}" },
    { label: "Long run: thirty rows", input: "{\"scores\":[{\"player_name\":\"P1\",\"gender\":\"female\",\"day\":\"2019-01-03\",\"score_points\":23},{\"player_name\":\"P2\",\"gender\":\"male\",\"day\":\"2019-01-08\",\"score_points\":25},{\"player_name\":\"P3\",\"gender\":\"male\",\"day\":\"2019-01-04\",\"score_points\":29},{\"player_name\":\"P4\",\"gender\":\"female\",\"day\":\"2019-01-01\",\"score_points\":48},{\"player_name\":\"P5\",\"gender\":\"female\",\"day\":\"2019-01-09\",\"score_points\":26},{\"player_name\":\"P6\",\"gender\":\"female\",\"day\":\"2019-01-07\",\"score_points\":37},{\"player_name\":\"P7\",\"gender\":\"male\",\"day\":\"2019-01-07\",\"score_points\":38},{\"player_name\":\"P8\",\"gender\":\"female\",\"day\":\"2019-01-02\",\"score_points\":30},{\"player_name\":\"P9\",\"gender\":\"male\",\"day\":\"2019-01-10\",\"score_points\":6},{\"player_name\":\"P10\",\"gender\":\"male\",\"day\":\"2019-01-05\",\"score_points\":10},{\"player_name\":\"P11\",\"gender\":\"female\",\"day\":\"2019-01-02\",\"score_points\":35},{\"player_name\":\"P12\",\"gender\":\"male\",\"day\":\"2019-01-09\",\"score_points\":13},{\"player_name\":\"P13\",\"gender\":\"female\",\"day\":\"2019-01-08\",\"score_points\":2},{\"player_name\":\"P14\",\"gender\":\"female\",\"day\":\"2019-01-09\",\"score_points\":34},{\"player_name\":\"P15\",\"gender\":\"male\",\"day\":\"2019-01-08\",\"score_points\":15},{\"player_name\":\"P16\",\"gender\":\"female\",\"day\":\"2019-01-08\",\"score_points\":26},{\"player_name\":\"P17\",\"gender\":\"female\",\"day\":\"2019-01-01\",\"score_points\":39},{\"player_name\":\"P18\",\"gender\":\"male\",\"day\":\"2019-01-02\",\"score_points\":47},{\"player_name\":\"P19\",\"gender\":\"male\",\"day\":\"2019-01-10\",\"score_points\":32},{\"player_name\":\"P20\",\"gender\":\"male\",\"day\":\"2019-01-01\",\"score_points\":24},{\"player_name\":\"P21\",\"gender\":\"male\",\"day\":\"2019-01-01\",\"score_points\":10},{\"player_name\":\"P22\",\"gender\":\"male\",\"day\":\"2019-01-01\",\"score_points\":32},{\"player_name\":\"P23\",\"gender\":\"female\",\"day\":\"2019-01-04\",\"score_points\":4},{\"player_name\":\"P24\",\"gender\":\"male\",\"day\":\"2019-01-07\",\"score_points\":13},{\"player_name\":\"P25\",\"gender\":\"male\",\"day\":\"2019-01-10\",\"score_points\":29},{\"player_name\":\"P26\",\"gender\":\"male\",\"day\":\"2019-01-03\",\"score_points\":47},{\"player_name\":\"P27\",\"gender\":\"female\",\"day\":\"2019-01-05\",\"score_points\":18},{\"player_name\":\"P28\",\"gender\":\"male\",\"day\":\"2019-01-06\",\"score_points\":25},{\"player_name\":\"P29\",\"gender\":\"female\",\"day\":\"2019-01-08\",\"score_points\":13},{\"player_name\":\"P30\",\"gender\":\"male\",\"day\":\"2019-01-09\",\"score_points\":33}]}" }],
}

function RowTable({ rows }) {
  if (!rows.length) return <p>No rows yet.</p>
  const columns = Object.keys(rows[0])
  return <table>
    <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
    <tbody>{rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column}>{String(row[column] ?? '')}</td>)}</tr>)}</tbody>
  </table>
}

export default function RunningTotalForDifferentGenders() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <h3>Daily and running totals</h3>
    <RowTable rows={step.rows} />
  </>} renderReasoning={() => <>
    <p>Walkthrough of the query stages on invented sample rows. The scores are invented.</p>
    <p>Several players can score on the same day, so the rows are first summed per gender and day.</p>
    <p>The running total then restarts for each gender and only moves forward through the dates.</p>
  </>} />
}
