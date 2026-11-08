// The solution itself. The optional observer lets the trace watch the real Proxy fire.
export function createInfiniteObject(onRead = () => {}) {
  return new Proxy({}, {
    get: (target, name) => {
      onRead(name)
      return () => String(name)
    },
  })
}

export const inputLabel = 'Object with methods: the names to call on the object, in order'
export const complexity = 'O(1) per call and O(1) stored state: nothing is saved on the target, and each closure lives only until it is called. The official name length is up to 1000; the visualization caps a run at 8 calls.'
export const examples = [
  { label: 'Made-up names', input: '{"methods":["greetUser","sum-of-2 odds!"]}' },
  { label: 'Names a plain object already has', input: '{"methods":["toString","constructor","__proto__"]}' },
  { label: 'Edge: empty name', input: '{"methods":[""]}' },
  { label: 'Single name', input: '{"methods":["add"]}' },
  { label: 'Repeated name', input: '{"methods":["sum","sum"]}' },
  { label: 'Longest list: eight names', input: '{"methods":["alpha","beta","gamma","delta","epsilon","zeta","eta","theta"]}' },
]

export const phases = [
  { id: 'start', label: 'Create', description: 'Wrap an empty object in a Proxy.' },
  { id: 'read', label: 'Read', description: 'The caller reads a property by name.' },
  { id: 'trap', label: 'Get trap', description: 'The Proxy intercepts the read and receives the name.' },
  { id: 'closure', label: 'Closure', description: 'The trap hands back a function that remembers the name.' },
  { id: 'call', label: 'Call', description: 'The caller invokes that function.' },
  { id: 'returned', label: 'Return', description: 'The function returns the remembered name.' },
  { id: 'done', label: 'Result', description: 'Every call returned its own name.' },
]

export const code = `create the object
  wrap an empty target in a Proxy with a get trap
for each method name the caller uses
  reading obj[name] fires the get trap with that name
  the trap builds a closure that remembers name
  calling the closure takes no arguments
  the closure returns the remembered name
report what each call returned`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing pseudocode line: ${key}`)
  return index + 1
}

export const python = `class InfiniteObject:
    def __getattribute__(self, name):
        return lambda: name

def call_all(method_names):
    obj = InfiniteObject()
    returned = []
    for method_name in method_names:
        method = getattr(obj, method_name)
        returned.append(method())
    return returned
`
const PY_LINES = python.split('\n')
const PY = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing Python line: ${key}`)
  return index + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with methods.')
  const { methods } = input
  if (!Array.isArray(methods) || methods.length < 1 || methods.length > 8) throw new Error('methods needs 1 to 8 names.')
  for (const name of methods) {
    if (typeof name !== 'string') throw new Error('Each method name is a string.')
    if (name.length > 1000) throw new Error('A method name has at most 1000 characters.')
  }
  return { methods }
}

// What the same call does on an ordinary {}: the contrast that shows why a trap is needed.
export function plainObjectOutcome(name) {
  const plain = {}
  const member = plain[name]
  if (typeof member !== 'function') return `throws TypeError: obj[${JSON.stringify(name)}] is not a function`
  try {
    const value = member.call(plain)
    return `returns ${typeof value === 'string' ? JSON.stringify(value) : 'an inherited result'}, not the name`
  } catch {
    return 'throws an error from the inherited method'
  }
}

export function buildTrace({ methods }) {
  const frames = []
  const reads = []
  const obj = createInfiniteObject(name => reads.push(name))
  const ops = methods.map(name => ({ name: `obj[${JSON.stringify(name)}]`, args: [] }))
  const push = (phase, activeLine, pythonLine, message, at, extra = {}) => frames.push({
    phase, activeLine, pythonLine, message, at, stage: phase,
    method: at >= 0 ? methods[at] : null,
    plain: at >= 0 ? plainObjectOutcome(methods[at]) : null,
    ops: ops.map(op => ({ ...op })),
    trapReads: reads.length,
    targetKeys: Object.keys(obj).length,
    ...extra,
  })

  push('start', L('wrap an empty'), PY('obj = InfiniteObject'), 'The object is an empty target behind a Proxy. No method names are stored anywhere.', -1)
  const result = []
  for (let at = 0; at < methods.length; at++) {
    const name = methods[at]
    const shown = JSON.stringify(name)
    push('read', L('reading obj[name]'), PY('for method_name'), `Call ${at + 1}: the caller reads obj[${shown}]. The target has no such key of its own to answer with.`, at)
    const closure = obj[name]
    push('trap', L('reading obj[name]'), PY('def __getattribute__'), `The read goes to the get trap, which receives the name ${shown} as a plain argument.`, at)
    push('closure', L('the trap builds'), PY('return lambda'), `The trap returns a new closure that remembers ${shown}. The name is captured, not stored on the object.`, at)
    push('call', L('calling the closure'), PY('returned.append'), 'The caller adds () to what it just received, so the closure runs with no arguments.', at)
    const value = closure()
    result.push(value)
    ops[at].returned = value
    push('returned', L('the closure returns'), PY('return lambda'), `The closure returns ${JSON.stringify(value)}, exactly the name it was reached by.`, at, { value })
  }
  push('done', L('report what'), PY('return returned'), `All ${methods.length} call${methods.length === 1 ? '' : 's'} returned their own name, and the target still has ${Object.keys(obj).length} own keys.`, -1, { through: methods.length - 1 })
  return { input: { methods }, result, frames }
}
