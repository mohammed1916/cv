import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
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
    { label: 'Example 1', input: '{"n":6,"requests":[5,0,3,3]}' },
    { label: 'Example 2', input: '{"n":4,"requests":[3,3,1]}' },
  ],
}

// Floor shaft: one row per floor, the elevator's floor and the next request are marked. Large buildings show text only.
function FloorShaft({ n, floor, target }) {
  if (n > 40) return <output aria-label="Elevator">{`Floor ${floor}${target === null ? '' : `, next request ${target}`}`}</output>
  return <div aria-label={`Floors 0 to ${n - 1}`} role="img">
    {Array.from({ length: n }, (_, k) => n - 1 - k).map(f => <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, height: 22 }}>
      <span style={{ width: 32, textAlign: 'right', fontSize: 12, color: 'var(--text-muted)' }}>{f}</span>
      <span style={{ width: 140, height: 2, background: 'var(--text-muted)', opacity: 0.4 }} />
      <span style={{ fontSize: 12, color: 'var(--text)', fontWeight: f === floor ? 700 : 400 }}>
        {f === floor ? 'elevator' : ''}{f === target && f !== floor ? 'next request' : ''}
      </span>
    </div>)}
  </div>
}

export default function ElevatorRequestsI() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Requests in order" length={run.input.requests.length} valueAt={i => run.input.requests[i]} active={step.index} />
    <FloorShaft n={run.input.n} floor={step.floor} target={step.index >= 0 ? run.input.requests[step.index] : null} />
    <output aria-label="Elevator">{`Floor ${step.floor}, time ${step.time}`}</output>
  </>} renderReasoning={() => <>
    <p>The elevator serves requests in order, so the time for each leg is the distance between the current floor and the next request.</p>
    <p>A request on the current floor adds no time.</p>
  </>} />
}
