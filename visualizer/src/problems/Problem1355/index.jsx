import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with activities and friends (small sample tables)',
  url: 'https://leetcode.com/problems/activity-participants/',
  complexity: 'One pass to count participants, then one pass to compare each count with the extremes: O(f + a).',
  examples: [
    { label: 'Example', input: '{"activities":[{"id":1,"name":"Chess"},{"id":2,"name":"Tennis"},{"id":3,"name":"Golf"},{"id":4,"name":"Rowing"},{"id":5,"name":"Swim"},{"id":6,"name":"Yoga"}],"friends":[{"id":1,"name":"Ann","activity":1},{"id":2,"name":"Bo","activity":1},{"id":3,"name":"Cy","activity":1},{"id":4,"name":"Di","activity":2},{"id":5,"name":"Ed","activity":2},{"id":6,"name":"Fay","activity":3},{"id":7,"name":"Gus","activity":3},{"id":8,"name":"Hal","activity":3},{"id":9,"name":"Ira","activity":5},{"id":10,"name":"Jo","activity":5},{"id":11,"name":"Kim","activity":6}]}' },
    { label: 'All tied', input: '{"activities":[{"id":1,"name":"Chess"},{"id":2,"name":"Golf"}],"friends":[{"id":1,"name":"Ann","activity":1},{"id":2,"name":"Bo","activity":2}]}' },
    { label: "One activity", input: "{\"activities\":[{\"id\":1,\"name\":\"Chess\"}],\"friends\":[{\"id\":1,\"name\":\"Ann\",\"activity\":1}]}" },
    { label: "No friends", input: "{\"activities\":[{\"id\":1,\"name\":\"Chess\"},{\"id\":2,\"name\":\"Golf\"}],\"friends\":[]}" },
    { label: "Ten activities, thirty friends", input: "{\"activities\":[{\"id\":1,\"name\":\"Club 1\"},{\"id\":2,\"name\":\"Club 2\"},{\"id\":3,\"name\":\"Club 3\"},{\"id\":4,\"name\":\"Club 4\"},{\"id\":5,\"name\":\"Club 5\"},{\"id\":6,\"name\":\"Club 6\"},{\"id\":7,\"name\":\"Club 7\"},{\"id\":8,\"name\":\"Club 8\"},{\"id\":9,\"name\":\"Club 9\"},{\"id\":10,\"name\":\"Club 10\"}],\"friends\":[{\"id\":1,\"name\":\"F1\",\"activity\":1},{\"id\":2,\"name\":\"F2\",\"activity\":2},{\"id\":3,\"name\":\"F3\",\"activity\":3},{\"id\":4,\"name\":\"F4\",\"activity\":4},{\"id\":5,\"name\":\"F5\",\"activity\":5},{\"id\":6,\"name\":\"F6\",\"activity\":6},{\"id\":7,\"name\":\"F7\",\"activity\":7},{\"id\":8,\"name\":\"F8\",\"activity\":8},{\"id\":9,\"name\":\"F9\",\"activity\":9},{\"id\":10,\"name\":\"F10\",\"activity\":10},{\"id\":11,\"name\":\"F11\",\"activity\":1},{\"id\":12,\"name\":\"F12\",\"activity\":2},{\"id\":13,\"name\":\"F13\",\"activity\":3},{\"id\":14,\"name\":\"F14\",\"activity\":4},{\"id\":15,\"name\":\"F15\",\"activity\":5},{\"id\":16,\"name\":\"F16\",\"activity\":6},{\"id\":17,\"name\":\"F17\",\"activity\":7},{\"id\":18,\"name\":\"F18\",\"activity\":8},{\"id\":19,\"name\":\"F19\",\"activity\":9},{\"id\":20,\"name\":\"F20\",\"activity\":10},{\"id\":21,\"name\":\"F21\",\"activity\":1},{\"id\":22,\"name\":\"F22\",\"activity\":2},{\"id\":23,\"name\":\"F23\",\"activity\":3},{\"id\":24,\"name\":\"F24\",\"activity\":4},{\"id\":25,\"name\":\"F25\",\"activity\":5},{\"id\":26,\"name\":\"F26\",\"activity\":6},{\"id\":27,\"name\":\"F27\",\"activity\":7},{\"id\":28,\"name\":\"F28\",\"activity\":8},{\"id\":29,\"name\":\"F29\",\"activity\":9},{\"id\":30,\"name\":\"F30\",\"activity\":10}]}" },
    { label: "Long run: skewed choices", input: "{\"activities\":[{\"id\":1,\"name\":\"Club 1\"},{\"id\":2,\"name\":\"Club 2\"},{\"id\":3,\"name\":\"Club 3\"},{\"id\":4,\"name\":\"Club 4\"},{\"id\":5,\"name\":\"Club 5\"},{\"id\":6,\"name\":\"Club 6\"},{\"id\":7,\"name\":\"Club 7\"},{\"id\":8,\"name\":\"Club 8\"},{\"id\":9,\"name\":\"Club 9\"},{\"id\":10,\"name\":\"Club 10\"}],\"friends\":[{\"id\":1,\"name\":\"F1\",\"activity\":2},{\"id\":2,\"name\":\"F2\",\"activity\":1},{\"id\":3,\"name\":\"F3\",\"activity\":2},{\"id\":4,\"name\":\"F4\",\"activity\":1},{\"id\":5,\"name\":\"F5\",\"activity\":1},{\"id\":6,\"name\":\"F6\",\"activity\":2},{\"id\":7,\"name\":\"F7\",\"activity\":2},{\"id\":8,\"name\":\"F8\",\"activity\":1},{\"id\":9,\"name\":\"F9\",\"activity\":3},{\"id\":10,\"name\":\"F10\",\"activity\":2},{\"id\":11,\"name\":\"F11\",\"activity\":2},{\"id\":12,\"name\":\"F12\",\"activity\":4},{\"id\":13,\"name\":\"F13\",\"activity\":4},{\"id\":14,\"name\":\"F14\",\"activity\":4},{\"id\":15,\"name\":\"F15\",\"activity\":4},{\"id\":16,\"name\":\"F16\",\"activity\":4},{\"id\":17,\"name\":\"F17\",\"activity\":3},{\"id\":18,\"name\":\"F18\",\"activity\":2},{\"id\":19,\"name\":\"F19\",\"activity\":3},{\"id\":20,\"name\":\"F20\",\"activity\":3},{\"id\":21,\"name\":\"F21\",\"activity\":4},{\"id\":22,\"name\":\"F22\",\"activity\":2},{\"id\":23,\"name\":\"F23\",\"activity\":4},{\"id\":24,\"name\":\"F24\",\"activity\":2},{\"id\":25,\"name\":\"F25\",\"activity\":1},{\"id\":26,\"name\":\"F26\",\"activity\":2},{\"id\":27,\"name\":\"F27\",\"activity\":2},{\"id\":28,\"name\":\"F28\",\"activity\":2},{\"id\":29,\"name\":\"F29\",\"activity\":3},{\"id\":30,\"name\":\"F30\",\"activity\":1}]}" },
  ],
}

function RowTable({ label, rows }) {
  if (!rows.length) return <p>No rows yet.</p>
  const columns = Object.keys(rows[0])
  return <table aria-label={label}>
    <thead><tr>{columns.map(c => <th key={c}>{c}</th>)}</tr></thead>
    <tbody>{rows.map((row, i) => <tr key={i}>{columns.map(c => <td key={c}>{String(row[c])}</td>)}</tr>)}</tbody>
  </table>
}

export default function ActivityParticipants() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <RowTable label="Current rows" rows={step.rows} />
    {step.phase === 'output' && <p>Kept activities: {step.rows.map(r => r.activity).join(', ') || 'none'}</p>}
  </>} renderReasoning={() => <>
    <p>Count the friends in each activity, then find the lowest and highest count.</p>
    <p>Keep an activity only when its count is strictly between those two values, so every tied minimum or maximum is dropped.</p>
  </>} />
}
