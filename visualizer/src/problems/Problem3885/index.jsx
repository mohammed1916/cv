import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import OperationLog from '../../components/shared/OperationLog'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'setup', label: 'Setup', description: 'Load the active events.' },
    { id: 'update', label: 'Update', description: 'Change one active priority.' },
    { id: 'poll', label: 'Poll', description: 'Remove the highest active event.' },
    { id: 'done', label: 'Result', description: 'Show the collected answers.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with events ([id, priority] pairs) and ops (["poll"] or ["update", id, priority])',
  url: 'https://leetcode.com/problems/design-event-manager/',
  complexity: 'This visual scans the active map on each poll: O(n) per poll. A heap with lazy updates would make polls faster on large inputs.',
  examples: [
    { label: 'Example', input: '{"events":[[3,2],[8,5],[6,5]],"ops":[["poll"],["update",3,9],["poll"],["poll"],["poll"]]}' },
    { label: 'Single event', input: '{"events":[[1,5]],"ops":[["poll"]]}' },
    { label: 'Equal priorities, smaller id wins', input: '{"events":[[2,7],[1,7]],"ops":[["poll"]]}' },
    { label: 'No active events', input: '{"events":[],"ops":[["poll"]]}' },
    { label: 'Long run: 12 events, 20 operations', input: '{"events":[[0,1],[1,5],[2,7],[3,9],[4,4],[5,1],[6,6],[7,0],[8,9],[9,0],[10,8],[11,9]],"ops":[["update",0,8],["poll"],["poll"],["poll"],["poll"],["poll"],["poll"],["poll"],["poll"],["poll"],["poll"],["poll"],["poll"],["poll"],["update",11,8],["poll"],["poll"],["poll"],["poll"],["poll"]]}' },
  ],
}

// Active events ranked the way a poll ranks them: highest priority first, then the smaller id.
function Ranking({ snapshot, removed }) {
  const ranked = [...snapshot].sort((a, b) => b[1] - a[1] || a[0] - b[0])
  if (ranked.length === 0) return <p>None active.</p>
  return <ol aria-label="Active events in poll order">{ranked.map(([id, p], rank) => (
    <li key={id} data-role={id === removed ? 'removed' : rank === 0 ? 'next' : ''} data-current={rank === 0 ? 'yes' : undefined}>
      event {id}: priority {p}{rank === 0 ? ' (the next poll takes this one)' : ''}{id === removed ? ' (just removed)' : ''}
    </li>))}</ol>
}

export default function DesignEventManager() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const ops = run.input.ops.map((op, i) => ({ name: op[0], args: op.slice(1), returned: step.phase === 'done' || i <= step.op ? run.result[i] : undefined }))
    return <>
      <section aria-label="Active events">
        <h3>Active events, poll order</h3>
        <Ranking snapshot={step.snapshot} removed={step.removed} />
      </section>
      <OperationLog title="Operations" ops={ops} current={step.op} through={step.op >= 0 ? step.op : ops.length - 1} />
      <output aria-label="Answers so far">{step.answer !== null ? `Returned ${step.answer}` : step.message}</output>
    </>
  }} renderReasoning={() => <>
    <p>An event is active until a poll removes it. Updates change only active events, so the map of current priorities is the whole state.</p>
    <p>A poll picks the largest priority and breaks ties with the smallest id, which is the first row of the ranking shown.</p>
  </>} />
}
