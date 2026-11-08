import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import OperationLog from '../../components/shared/OperationLog'
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
    { label: 'Driver before rider', input: '{"ops":[["addDriver",1],["matchDriverWithRider"]]}' },
    { label: 'Equal ids, rider first', input: '{"ops":[["addRider",1],["addDriver",1],["matchDriverWithRider"]]}' },
    { label: 'Largest id', input: '{"ops":[["addRider",30],["addDriver",30],["matchDriverWithRider"]]}' },
    { label: 'Long run: 12 operations', input: '{"ops":[["addRider",1],["addRider",2],["addRider",3],["addDriver",9],["matchDriverWithRider"],["cancelRider",2],["addDriver",8],["matchDriverWithRider"],["addRider",4],["addDriver",7],["matchDriverWithRider"],["matchDriverWithRider"]]}' },
  ],
}

export default function DesignRideSharingSystem() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const ops = run.input.ops.map((op, i) => ({ name: op[0], args: op.slice(1), returned: step.results[i] ?? undefined }))
    return <>
      <div className="ride-queues" aria-label="Waiting queues">
        <IndexedSequence label="Riders waiting (index 0 is the front)" length={step.riders.length} active={-1}
          valueAt={i => step.riders[i]} roleAt={i => i === 0 ? 'front' : ''} />
        <IndexedSequence label="Drivers available (index 0 is the front)" length={step.drivers.length} active={-1}
          valueAt={i => step.drivers[i]} roleAt={i => i === 0 ? 'front' : ''} />
      </div>
      <OperationLog title="Operations" ops={ops} current={step.at} through={step.at >= 0 ? step.at : ops.length - 1} />
      <output aria-label="Current operation">{step.message}</output>
    </>
  }} renderReasoning={() => <>
    <p>Both waiting groups are first-in first-out queues, so the earliest driver and earliest rider are always at the front.</p>
    <p>A cancellation only touches the rider queue, and it has no effect once that rider has been matched.</p>
  </>} />
}
