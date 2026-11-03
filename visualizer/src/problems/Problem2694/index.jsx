import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { parseInput, buildTrace, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'The emitter starts empty.' },
    { id: 'subscribe', label: 'Subscribe', description: 'Append a listener to its event.' },
    { id: 'unsubscribe', label: 'Unsubscribe', description: 'Remove one listener.' },
    { id: 'emit', label: 'Emit', description: 'Call the listeners in order.' },
    { id: 'done', label: 'Done', description: 'The script has run.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'Object with script: a list of [kind, event] or [kind, event, listener]',
  url: 'https://leetcode.com/problems/event-emitter/',
  complexity: 'O(listeners of the event) per emit. Subscribe is O(1) and unsubscribe is linear in one list.',
  examples: [
    { label: 'Subscribe, emit, unsubscribe', input: '{"script":[["subscribe","a","L1"],["subscribe","a","L2"],["emit","a"],["unsubscribe","a","L1"],["emit","a"]]}' },
    { label: 'Two events', input: '{"script":[["subscribe","x","A"],["subscribe","y","B"],["emit","y"],["emit","x"]]}' },
  ],
}

export default function EventEmitter() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <dl aria-label="Registered listeners">
      {Object.entries(step.events).length === 0 && <dd>No events registered.</dd>}
      {Object.entries(step.events).map(([name, list]) => <div key={name}>
        <dt><strong>{name}</strong></dt>
        <dd>{list.length ? list.join(' → ') : 'no listeners'}</dd>
      </div>)}
    </dl>
    <ol aria-label="Emit results">{step.calls.map((c, i) => <li key={i}>{`${c.event}: ${c.listeners.join(', ') || 'none'}`}</li>)}</ol>
  </>} renderReasoning={() => <>
    <p>A map of arrays holds the state. Order matters: listeners run in the order they were subscribed.</p>
    <p>Unsubscribing removes only the first matching entry, so a listener subscribed twice is still called once in each emit that remains.</p>
  </>} />
}
