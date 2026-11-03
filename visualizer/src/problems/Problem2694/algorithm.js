const KINDS = ['subscribe', 'unsubscribe', 'emit']

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.script) || input.script.length > 10) {
    throw new Error('Use an object with script, a list of at most 10 operations.')
  }
  for (const op of input.script) {
    if (!Array.isArray(op) || !KINDS.includes(op[0]) || typeof op[1] !== 'string' || op[1].length > 8) {
      throw new Error('Each operation is [kind, eventName] or [kind, eventName, listenerName]; kind is subscribe, unsubscribe or emit.')
    }
  }
  return { script: input.script }
}

export const code = `keep a map from event name to an ordered list of listeners
on subscribe, append the listener to its event list
on unsubscribe, remove that listener from the list
on emit, call each listener of the event in order and collect the results`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ script }) {
  const frames = []
  const events = new Map()
  const calls = []
  const snapshot = () => Object.fromEntries([...events].map(([k, v]) => [k, [...v]]))
  frames.push({ phase: 'start', activeLine: L('keep a map'), events: {}, calls: [], message: 'No events are registered yet.' })
  for (const [kind, name, listener] of script) {
    if (kind === 'subscribe') {
      if (!events.has(name)) events.set(name, [])
      events.get(name).push(listener)
      frames.push({ phase: 'subscribe', activeLine: L('on subscribe'), events: snapshot(), calls: [...calls], message: `Add ${listener} to ${name}.` })
    } else if (kind === 'unsubscribe') {
      const list = events.get(name) || []
      const at = list.indexOf(listener)
      if (at >= 0) list.splice(at, 1)
      frames.push({ phase: 'unsubscribe', activeLine: L('on unsubscribe'), events: snapshot(), calls: [...calls], message: at >= 0 ? `Remove ${listener} from ${name}.` : `${listener} was not subscribed to ${name}.` })
    } else {
      const called = [...(events.get(name) || [])]
      calls.push({ event: name, listeners: called })
      frames.push({ phase: 'emit', activeLine: L('on emit'), events: snapshot(), calls: [...calls], message: `Emit ${name}: ${called.length ? called.join(', ') : 'no listeners'} run in order.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('keep a map'), events: snapshot(), calls: [...calls], message: 'Script finished.' })
  return { input: { script }, result: calls, frames }
}
