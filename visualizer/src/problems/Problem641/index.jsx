import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Ring', description: 'Empty slots with the head at 0.' },
    { id: 'write', label: 'Insert', description: 'Write at the front (head − 1) or at the back.' },
    { id: 'read', label: 'Delete', description: 'Remove from the front or back.' },
    { id: 'query', label: 'Query', description: 'Read an end or the empty/full state.' },
    { id: 'done', label: 'Complete', description: 'All operations have run.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Deque and operations (JSON object with k and ops)',
  url: 'https://leetcode.com/problems/design-circular-deque/',
  complexity: 'O(1) time per operation and O(k) space for the fixed ring.',
  examples: [
    { label: 'Both ends', input: '{"k":3,"ops":[["insertLast",1],["insertFront",2],["insertFront",3],["getRear"],["isFull"],["deleteLast"],["insertFront",4],["getFront"]]}' },
    { label: 'Empty', input: '{"k":2,"ops":[["getFront"],["deleteFront"],["isEmpty"]]}' },
  ],
}

export default function CircularDeque() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label={`Ring of ${step.k} slots (head at ${step.head})`} length={step.k} active={step.size ? step.head : -1}
      valueAt={i => (step.slots[i] === null ? '·' : step.slots[i])}
      roleAt={i => (step.size && i === step.head ? 'front' : step.size && i === (step.head + step.size - 1) % step.k ? 'rear' : '')} />
    <output aria-label="Last return value">{step.phase === 'done' ? 'All operations complete' : step.op >= 0 ? `${step.name}${step.name.startsWith('insert') ? `(${step.value})` : '()'} returned ${String(step.returned)}` : 'Ready'} · size {step.size}</output>
    <p>Results so far: [{run.result.slice(0, Math.max(0, step.op + 1)).map(v => (v === null ? 'null' : String(v))).join(', ')}]</p>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Two ends, one ring:</strong> the front is at head and the back at (head + size − 1) mod k, so both ends wrap in O(1).</p>
  </>} />
}
