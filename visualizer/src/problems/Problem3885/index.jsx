import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
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
  ],
}

export default function DesignEventManager() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <section className="algorithm-sequence" aria-label="Active events">
      <h3>Active events</h3>
      <div className="algorithm-sequence__cells">{step.snapshot.length === 0 ? <p>None active.</p> : step.snapshot.map(([id, p]) => (
        <div key={id} className={`algorithm-sequence__cell ${id === step.removed ? 'is-active' : ''}`} data-role={id === step.removed ? 'removed' : ''}>
          <small>event</small><strong>{id}</strong><span>priority {p}</span>
        </div>))}</div>
    </section>
    <output aria-label="Answers so far">{step.answer !== null ? `Returned ${step.answer}` : step.message}</output>
  </>} renderReasoning={() => <>
    <p>An event is active until a poll removes it. Updates change only active events, so the map of current priorities is the whole state.</p>
    <p>A poll picks the largest priority and breaks ties with the smallest id.</p>
  </>} />
}
