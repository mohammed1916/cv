import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Ring', description: 'Empty slots with the head at 0.' },
    { id: 'write', label: 'enQueue', description: 'Write at (head + size) mod k.' },
    { id: 'read', label: 'deQueue', description: 'Advance the head around the ring.' },
    { id: 'query', label: 'Query', description: 'Read front, rear, or the empty/full state.' },
    { id: 'done', label: 'Complete', description: 'All operations have run.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Queue and operations (JSON object with k and ops)',
  url: 'https://leetcode.com/problems/design-circular-queue/',
  complexity: 'O(1) time per operation and O(k) space for the fixed ring.',
  examples: [
    { label: 'Basic', input: '{"k":3,"ops":[["enQueue",1],["enQueue",2],["enQueue",3],["enQueue",4],["Rear"],["isFull"],["deQueue"],["enQueue",4],["Rear"]]}' },
    { label: 'Empty checks', input: '{"k":1,"ops":[["isEmpty"],["Front"],["enQueue",9],["isFull"],["Rear"]]}' },
  ],
}

export default function CircularQueue() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label={`Ring of ${step.k} slots (head at ${step.head})`} length={step.k} active={step.size ? step.head : -1}
      valueAt={i => (step.slots[i] === null ? '·' : step.slots[i])}
      roleAt={i => (i === step.head && step.size ? 'front' : step.size && i === (step.head + step.size - 1) % step.k ? 'rear' : '')} />
    <output aria-label="Last return value">{step.phase === 'done' ? 'All operations complete' : step.op >= 0 ? `${step.name}${step.name === 'enQueue' ? `(${step.value})` : '()'} returned ${String(step.returned)}` : 'Ready'} · size {step.size}</output>
    <p>Results so far: [{run.result.slice(0, Math.max(0, step.op + 1)).map(v => (v === null ? 'null' : String(v))).join(', ')}]</p>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Wraparound:</strong> the tail is always (head + size) mod k, so removing from the front never shifts the remaining values.</p>
  </>} />
}
