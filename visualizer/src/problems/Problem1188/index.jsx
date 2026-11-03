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
  ],
}

export default function DesignBoundedBlockingQueue() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <ol aria-label="Queue contents" className="algorithm-workspace__queue">{step.state.map((value, index) => <li key={index}>{value}</li>)}</ol>
    <output aria-label="Current step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>A real blocking queue parks the calling thread until there is room or an item. This replay keeps one schedule and marks each call that would wait.</p>
    <p>Both limits are checked against the same count, so a full queue never accepts another item and an empty queue never returns one.</p>
  </>} />
}
