import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { parseInput, buildTrace, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No listeners are registered.' },
    { id: 'subscribe', label: 'Subscribe', description: 'Add a listener to the event list.' },
    { id: 'unsubscribe', label: 'Unsubscribe', description: 'Remove one listener from its event list.' },
    { id: 'emit', label: 'Emit', description: 'Call the listeners of the event in the order they were added.' },
    { id: 'done', label: 'Done', description: 'The script has finished.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'Object with script: a list of ["subscribe" | "unsubscribe" | "emit", event, listener]',
  url: 'https://leetcode.com/problems/event-emitter/',
  complexity: 'Subscribe is O(1). Emit calls each listener of one event once, in order.',
  examples: [
    { label: 'Two listeners, one removed', input: '{"script":[["subscribe","save","a"],["subscribe","save","b"],["emit","save"],["unsubscribe","save","a"],["emit","save"]]}' },
    { label: 'Other event', input: '{"script":[["subscribe","open","x"],["emit","close"],["emit","open"]]}' },
    { label: 'Emit with no listeners', input: '{"script":[["emit","tick"]]}' },
    { label: 'Same listener subscribed twice', input: '{"script":[["subscribe","tick","a"],["subscribe","tick","a"],["emit","tick"],["unsubscribe","tick","a"],["emit","tick"]]}' },
    { label: 'Longest script: 10 operations', input: '{"script":[["subscribe","tick","a"],["subscribe","tick","b"],["emit","tick"],["subscribe","open","c"],["emit","open"],["unsubscribe","tick","a"],["emit","tick"],["unsubscribe","open","c"],["emit","open"],["emit","tick"]]}' },
  ],
}

export default function EventEmitter() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const rows = Object.entries(step.events).map(([event, listeners]) => ({ event, listeners: listeners.join(', ') || '(none)' }))
    return <section style={{ display: 'grid', gap: 10 }}>
      <RecordStateTable label="Listeners by event" columns={['event', 'listeners']} rows={rows} />
      <p style={{ margin: 0, color: 'var(--text)' }}>Calls so far: <code>{JSON.stringify(step.calls)}</code></p>
    </section>
  }} renderReasoning={({ step }) => <p>{step.message}</p>} />
}
