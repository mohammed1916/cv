import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Setup', description: 'Index the dead ends and start BFS at 0000.' },
    { id: 'pop', label: 'Dequeue', description: 'Take the oldest queued lock state.' },
    { id: 'expand', label: 'Expand', description: 'Try the 8 single-wheel turns, skipping dead ends and seen states.' },
    { id: 'done', label: 'Complete', description: 'Return the number of moves, or -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Deadends and target (JSON)',
  url: 'https://leetcode.com/problems/open-the-lock/',
  complexity: 'O(10^4 * 8) at worst; one dequeue frame and one expand frame per state (up to ~20,000 frames).',
  examples: [
    { label: 'Example 1', input: '{"deadends": ["0201","0101","0102","1212","2002"], "target": "0202"}' },
    { label: 'Example 2', input: '{"deadends": ["8888"], "target": "0009"}' },
    { label: 'Walled off', input: '{"deadends": ["8887","8889","8878","8898","8788","8988","7888","9888"], "target": "8888"}' },
  ],
}

export default function OpenTheLock() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <output aria-label="Current state">Current: {step.node || '-'} | moves {step.steps} | queue {step.queueSize} | seen {step.seen}</output>
    <StackLane title="Newly queued" items={step.fresh} note="neighbours added" />
    <StackLane title="Blocked by dead ends" items={step.blocked} />
    <StackLane title="Shortest path" items={step.path} note={run.result < 0 && step.phase === 'done' ? 'unreachable' : undefined} />
  </>} renderReasoning={({ run }) => <>
    <p>All moves cost 1, so BFS finds the fewest moves. Dead ends are removed from the graph by never queuing them.</p>
    <p>Dead ends given: {run.input.deadends.length}; target {run.input.target}.</p>
  </>} />
}
