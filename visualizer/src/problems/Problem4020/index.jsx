import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'The elevator starts at floor 0.' },
    { id: 'serve', label: 'Serve', description: 'Move to the next requested floor.' },
    { id: 'done', label: 'Complete', description: 'Report the total time.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Building and requests (JSON object with n and requests)',
  url: 'https://leetcode.doocs.org/en/lc/4020/',
  complexity: 'O(k) time for k requests and O(1) extra space.',
  examples: [
    { label: 'Example 1', input: '{"n":5,"requests":[2,1,4,3]}' },
    { label: 'Example 2', input: '{"n":3,"requests":[2,0,0]}' },
  ],
}

export default function ElevatorRequestsI() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <table aria-label="Floors">
      <thead><tr><th>Request</th><th>Floor</th></tr></thead>
      <tbody>{run.input.requests.map((r, i) => <tr key={i} data-active={i === step.index ? 'true' : undefined}>
        <td>{i + 1}</td><td>{r}</td>
      </tr>)}</tbody>
    </table>
    <output aria-label="Elevator">{`Floor ${step.floor}, time ${step.time}`}</output>
  </>} renderReasoning={() => <>
    <p>The elevator serves requests in order, so the time for each leg is the distance between the current floor and the next request.</p>
    <p>A request on the current floor adds no time.</p>
  </>} />
}
