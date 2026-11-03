import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: 3829,
  phases: [
    { id: 'rider', label: 'Rider', description: 'A rider joins the back of the waiting line.' },
    { id: 'driver', label: 'Driver', description: 'A driver joins the back of the available line.' },
    { id: 'match', label: 'Match', description: 'The front driver and the front rider leave together.' },
    { id: 'cancel', label: 'Cancel', description: 'A waiting rider is removed; anyone else is ignored.' },
    { id: 'done', label: 'Result', description: 'All answers are collected.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with ops: ["addRider", id], ["addDriver", id], ["matchDriverWithRider"] or ["cancelRider", id]',
  url: 'https://leetcode.com/problems/design-ride-sharing-system/',
  complexity: 'Each queue operation is O(1) with a deque; a cancellation scans the rider queue here.',
  examples: [
    { label: 'Queue order', input: '{"ops":[["addRider",1],["addRider",2],["addDriver",9],["matchDriverWithRider"],["addDriver",8],["matchDriverWithRider"],["matchDriverWithRider"]]}' },
    { label: 'Cancel first', input: '{"ops":[["addRider",1],["addRider",2],["cancelRider",1],["addDriver",5],["matchDriverWithRider"]]}' },
  ],
}

export default function DesignRideSharingSystem() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <ol aria-label="Operations">{run.input.ops.map((op, i) => <li key={i} data-current={step.at === i ? 'yes' : undefined}>
      {op.join(', ')}{step.results[i] !== null && step.results[i] !== undefined ? ` → [${step.results[i].join(', ')}]` : ''}</li>)}</ol>
    <div aria-label="Waiting queues">
      <p><strong>Riders (front first):</strong> {step.riders.join(', ') || 'none'}</p>
      <p><strong>Drivers (front first):</strong> {step.drivers.join(', ') || 'none'}</p>
    </div>
    <output aria-label="Current operation">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Both waiting groups are first-in first-out queues, so the earliest driver and earliest rider are always at the front.</p>
    <p>A cancellation only touches the rider queue, and it has no effect once that rider has been matched.</p>
  </>} />
}
