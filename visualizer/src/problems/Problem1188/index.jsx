import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { parseInput, buildTrace, code, python } from './algorithm'

const definition = {
  number: '1188',
  phases: [
    { id: 'start', label: 'Start', description: 'The queue is empty with a fixed capacity.' },
    { id: 'enqueue', label: 'Enqueue', description: 'Add a value when there is room.' },
    { id: 'dequeue', label: 'Dequeue', description: 'Remove the front value when there is one.' },
    { id: 'blocked', label: 'Waiting', description: 'A full or empty queue makes the call wait.' },
    { id: 'done', label: 'Result', description: 'Report every result in call order.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with capacity and ops: ["enqueue", value] or ["dequeue"]',
  url: 'https://leetcode.com/problems/design-bounded-blocking-queue/',
  complexity: 'O(1) per call in this replay. The visualization caps the input at 20 calls.',
  examples: [
    { label: 'Full queue', input: '{"capacity":2,"ops":[["enqueue",1],["enqueue",2],["enqueue",3],["dequeue"],["enqueue",3],["dequeue"],["dequeue"],["dequeue"]]}' },
    { label: 'Single enqueue', input: '{"capacity":1,"ops":[["enqueue",9]]}' },
    { label: 'Dequeue on an empty queue', input: '{"capacity":3,"ops":[["dequeue"],["enqueue",4],["dequeue"],["dequeue"]]}' },
    { label: 'Fill to capacity then refill', input: '{"capacity":5,"ops":[["enqueue",1],["enqueue",2],["enqueue",3],["enqueue",4],["enqueue",5],["enqueue",6],["dequeue"],["enqueue",6],["dequeue"],["dequeue"],["dequeue"],["dequeue"],["dequeue"]]}' },
    { label: 'Long run: 20 operations', input: '{"capacity":4,"ops":[["dequeue"],["dequeue"],["dequeue"],["enqueue",96],["dequeue"],["enqueue",58],["dequeue"],["enqueue",47],["dequeue"],["dequeue"],["enqueue",22],["enqueue",92],["dequeue"],["enqueue",14],["dequeue"],["dequeue"],["enqueue",41],["enqueue",39],["enqueue",12],["dequeue"]]}' },
  ],
}

export default function DesignBoundedBlockingQueue() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const capacity = run.input.capacity
    const slots = Array.from({ length: capacity }, (_, i) => step.state[i])
    const waiting = step.phase === 'blocked'
    return <>
      <p aria-label="Capacity">Capacity {capacity}: {step.state.length} of {capacity} slots used</p>
      <ol aria-label="Queue slots" style={{ display: 'flex', gap: 6, listStyle: 'none', padding: 0, margin: 0 }}>
        {slots.map((value, i) => <li key={i} data-role={value === undefined ? 'free' : i === 0 ? 'front' : ''} style={{
          minWidth: 52, minHeight: 52, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace',
          border: i === 0 && value !== undefined ? '2px solid var(--text)' : '1px dashed var(--border)',
          background: value === undefined ? 'transparent' : 'var(--surface2)', color: 'var(--text)',
        }}>
          <span>{value === undefined ? '' : value}</span>
          <small style={{ color: 'var(--text-dim)' }}>{i === 0 && value !== undefined ? 'front' : i === step.state.length - 1 ? 'back' : ''}</small>
        </li>)}
      </ol>
      <p style={{ marginTop: 24, color: waiting ? 'var(--text)' : 'var(--text-dim)' }}>
        {waiting ? 'This call is parked. It stays here until the queue changes.' : 'No call is parked on this step.'}
      </p>
      <ol aria-label="Call timeline" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', listStyle: 'none', padding: 0 }}>
        {run.input.ops.map((op, call) => <li key={call} data-call={call} style={{
          padding: '4px 8px', fontFamily: 'monospace', color: 'var(--text)',
          border: call === step.call ? '2px solid var(--text)' : '1px solid var(--border)',
          background: call === step.call ? 'color-mix(in srgb, var(--primary) 28%, transparent)' : 'var(--surface2)',
          opacity: step.call !== null && call > step.call ? 0.5 : 1,
        }}>
          {call + 1}. {op[0] === 'enqueue' ? `enq ${op[1]}` : 'deq'}
          {step.parkedDeq.includes(call) || step.parkedEnqCalls.includes(call) ? <small style={{ color: 'var(--text-dim)' }}> waiting</small> : null}
        </li>)}
      </ol>
      <p aria-label="Parked calls">Parked enqueues: {step.parkedEnq.length ? step.parkedEnq.join(', ') : 'none'} · parked dequeues: {step.parkedDeq.length}</p>
      <output aria-label="Current step">{step.message}</output>
    </>
  }} renderReasoning={() => <>
    <p>A real blocking queue parks the calling thread until there is room or an item. This replay runs one fixed schedule: a call that would wait is parked, and it resumes in arrival order as soon as the queue can serve it.</p>
    <p>Both limits are checked against the same count, so a full queue never accepts another item and an empty queue never returns one.</p>
  </>} />
}
