const KINDS = ['subscribe', 'unsubscribe', 'emit']

export const code = [
  'class Emitter {',
  '  constructor() { this.events = new Map() }',
  '  subscribe(name, listener) {',
  '    if (!this.events.has(name)) this.events.set(name, [])',
  '    this.events.get(name).push(listener)',
  '  }',
  '  unsubscribe(name, listener) {',
  '    const list = this.events.get(name) || []',
  '    const index = list.indexOf(listener)',
  '    if (index >= 0) list.splice(index, 1)',
  '  }',
  '  emit(name) {',
  '    const listeners = [...(this.events.get(name) || [])]',
  '    return listeners.map(listener => listener())',
  '  }',
  '}',
].map((text, index) => ({ line: index + 1, text }))

export const python = `class Emitter:
    def __init__(self):
        self.events = {}
    def subscribe(self, name, listener):
        self.events.setdefault(name, []).append(listener)
    def unsubscribe(self, name, listener):
        lst = self.events.get(name, [])
        if listener in lst:
            lst.remove(listener)
    def emit(self, name):
        listeners = list(self.events.get(name, []))
        return [listener() for listener in listeners]`

const at = phrase => code.findIndex(c => c.text.includes(phrase)) + 1
const pyAt = phrase => python.split('\n').findIndex(line => line.includes(phrase)) + 1

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

export function buildTrace({ script }) {
  const frames = []
  const events = new Map()
  const calls = []
  const snapshot = () => Object.fromEntries([...events].map(([k, v]) => [k, [...v]]))
  frames.push({ phase: 'start', activeLine: at('constructor() {'), pythonLine: pyAt('def __init__'), events: {}, calls: [], message: 'No events are registered yet.' })
  for (const [kind, name, listener] of script) {
    if (kind === 'subscribe') {
      if (!events.has(name)) events.set(name, [])
      events.get(name).push(listener)
      frames.push({ phase: 'subscribe', activeLine: at('this.events.get(name).push(listener)'), pythonLine: pyAt('append(listener)'), events: snapshot(), calls: [...calls], message: `Add ${listener} to ${name}.` })
    } else if (kind === 'unsubscribe') {
      const list = events.get(name) || []
      const at_ = list.indexOf(listener)
      if (at_ >= 0) list.splice(at_, 1)
      frames.push({ phase: 'unsubscribe', activeLine: at('if (index >= 0)'), pythonLine: pyAt('if listener in lst'), events: snapshot(), calls: [...calls], message: at_ >= 0 ? `Remove ${listener} from ${name}.` : `${listener} was not subscribed to ${name}.` })
    } else {
      const called = [...(events.get(name) || [])]
      calls.push({ event: name, listeners: called })
      frames.push({ phase: 'emit', activeLine: at('return listeners.map'), pythonLine: pyAt('return [listener'), events: snapshot(), calls: [...calls], message: `Emit ${name}: ${called.length ? called.join(', ') : 'no listeners'} run in order.` })
    }
  }
  frames.push({ phase: 'done', activeLine: at('constructor() {'), pythonLine: pyAt('def __init__'), events: snapshot(), calls: [...calls], message: 'Script finished.' })
  return { input: { script }, result: calls, frames }
}
