// The sample functions run for real against a logging proxy, so every read shown is one the code made.
export const FUNCTIONS = {
  discount: {
    params: ['rate'],
    source: ['function discount(rate) {', '  return this.price * (1 - rate)', '}'],
    run: function (rate) { return this.price * (1 - rate) },
    logLines: [1],
    pyKey: 'return self["price"]',
  },
  badge: {
    params: ['before', 'after'],
    source: ['function badge(before, after) {', '  return before + this.name + after', '}'],
    run: function (before, after) { return before + this.name + after },
    logLines: [1],
    pyKey: 'return before + self["name"]',
  },
  bump: {
    params: ['by'],
    source: ['function bump(by) {', '  this.hits += by', '  return this.hits', '}'],
    run: function (by) { this.hits += by; return this.hits },
    logLines: [1, 1, 2],
    pyKeys: ['self["hits"] += by', 'self["hits"] += by', 'return self["hits"]'],
  },
  keyCount: {
    params: [],
    source: ['function keyCount() {', '  return Object.keys(this).length', '}'],
    run: function () { return Object.keys(this).length },
    logLines: [1],
    pyKey: 'return len(self)',
  },
  lastItem: {
    params: [],
    source: ['function lastItem() {', '  return this[this.length - 1]', '}'],
    run: function () { return this[this.length - 1] },
    logLines: [1, 1],
    pyKey: 'return self[-1] if self else None',
  },
  readOwner: {
    params: [],
    source: ['function readOwner() {', '  return this.owner', '}'],
    run: function () { return this.owner },
    logLines: [1],
    pyKey: 'return self.get("owner")',
  },
}

export const POLYFILL_SOURCE = [
  'Function.prototype.callPolyfill = function (context, ...args) {',
  "  const key = Symbol('fn')",
  '  context[key] = this',
  '  const result = context[key](...args)',
  '  delete context[key]',
  '  return result',
  '}',
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with fn and args.')
  const { fn, args } = input
  if (!Object.hasOwn(FUNCTIONS, fn)) throw new Error(`fn is one of the sample functions: ${Object.keys(FUNCTIONS).join(', ')}.`)
  if (!Array.isArray(args) || args.length < 1 || args.length > 6) throw new Error('args has 1 to 6 entries in this visualization; the first is the context object.')
  if (typeof args[0] !== 'object' || args[0] === null) throw new Error('args[0], the context, must be an object or array.')
  if (Object.keys(args[0]).length > 12) throw new Error('The context has at most 12 keys in this visualization.')
  return { fn, args: JSON.parse(JSON.stringify(args)) }
}

export const code = `call a function with a chosen this
  the first argument is the context, the rest go to the function
  make a brand new symbol that no existing key can equal
  store the function on the context under that symbol
  call it through the context so this becomes the context
    the function body runs, reading this as the context
  delete the temporary symbol key
  return what the function returned`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Pseudocode line missing: ${key}`)
  return index + 1
}

// Python has no this keyword; a function bound to an object receives that object as self, which plays the same role.
export const python = `def call_polyfill(fn, args):
    context = args[0]
    rest = args[1:]
    bound = FUNCTIONS[fn].__get__(context)
    result = bound(*rest)
    return result


def discount(self, rate):
    return self["price"] * (1 - rate)


def badge(self, before, after):
    return before + self["name"] + after


def bump(self, by):
    self["hits"] += by
    return self["hits"]


def key_count(self):
    return len(self)


def last_item(self):
    return self[-1] if self else None


def read_owner(self):
    return self.get("owner")


FUNCTIONS = {
    "discount": discount,
    "badge": badge,
    "bump": bump,
    "keyCount": key_count,
    "lastItem": last_item,
    "readOwner": read_owner,
}`

const PY_LINES = python.split('\n')
const PY = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Python line missing: ${key}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Plain call', description: 'Without a receiver, this has no object.' },
  { id: 'split', label: 'Split', description: 'Separate the context from the ordinary arguments.' },
  { id: 'key', label: 'Symbol', description: 'Create a key that cannot collide.' },
  { id: 'attach', label: 'Attach', description: 'Temporarily make the function a method of the context.' },
  { id: 'invoke', label: 'Invoke', description: 'A call through an object sets this to that object.' },
  { id: 'body', label: 'Body', description: 'Each access through this reaches the context.' },
  { id: 'remove', label: 'Clean up', description: 'Leave no trace on the caller\'s object.' },
  { id: 'done', label: 'Result', description: 'Hand back what the function returned.' },
]

// Readable text for any value the sample functions can produce, including undefined and NaN.
export function show(value) {
  if (value === undefined) return 'undefined'
  if (typeof value === 'number' && !Number.isFinite(value)) return String(value)
  return JSON.stringify(value)
}

const entriesOf = (target, key) => {
  const rows = Object.keys(target).map(name => ({ key: name, value: show(target[name]), temporary: false }))
  if (key !== null && Object.getOwnPropertySymbols(target).includes(key)) rows.push({ key: 'Symbol(fn)', value: 'the function', temporary: true })
  return rows
}

const propertyText = (name, isArray) => (isArray && /^-?\d+$/.test(name) ? `this[${name}]` : `this.${name}`)

export function buildTrace({ fn, args }) {
  const spec = FUNCTIONS[fn]
  const original = JSON.parse(JSON.stringify(args))
  const context = original[0]
  const rest = original.slice(1)
  const isArray = Array.isArray(context)
  const log = []
  let key = null

  // A forwarding proxy records what the function touches. Symbol lookups belong to the polyfill, not the body.
  const receiver = new Proxy(context, {
    get(target, name) {
      const value = target[name]
      if (typeof name === 'string') log.push({ type: 'read', name, value, state: entriesOf(target, key), text: `${propertyText(name, isArray)} is ${show(value)}` })
      return value
    },
    set(target, name, value) {
      const old = target[name]
      target[name] = value
      if (typeof name === 'string') log.push({ type: 'write', name, value, state: entriesOf(target, key), text: `${propertyText(name, isArray)} changes from ${show(old)} to ${show(value)}` })
      return true
    },
    ownKeys(target) {
      const keys = Reflect.ownKeys(target)
      log.push({ type: 'keys', name: null, value: null, state: entriesOf(target, key), text: `Object.keys(this) sees ${JSON.stringify(Object.keys(target))}; the symbol key stays hidden` })
      return keys
    },
  })

  // What happens without the polyfill: modules run in strict mode, so this is undefined.
  let plainFailure
  try {
    spec.run.apply(undefined, rest)
    plainFailure = null
  } catch (error) {
    plainFailure = error.message
  }

  const callText = `${fn}.callPolyfill(${original.map(show).join(', ')})`
  const paramRows = () => spec.params.map((name, index) => ({ name, value: index < rest.length ? show(rest[index]) : 'undefined' }))
  const frames = []
  const push = (phase, codeKey, pyKey, message, extra = {}) => frames.push({
    phase, activeLine: L(codeKey), pythonLine: PY(pyKey), message,
    callText, thisValue: extra.thisValue ?? 'undefined', params: extra.params ?? [], contextRows: extra.contextRows ?? entriesOf(context, key),
    activeKey: extra.activeKey ?? null, stack: extra.stack ?? [], polyfillLine: extra.polyfillLine ?? -1, bodyLine: extra.bodyLine ?? -1,
    reads: extra.reads ?? [], returned: extra.returned, hasReturned: extra.hasReturned ?? false, plainFailure: extra.plainFailure ?? null,
    split: extra.split ?? false,
  })

  push('start', 'call a function', 'def call_polyfill', plainFailure
    ? `Calling ${fn} directly gives this no object, so it fails: ${plainFailure}.`
    : `Calling ${fn} directly gives this no object.`, { plainFailure })
  push('split', 'the first argument', 'context = args[0]', `The context is ${show(context)}. The other ${rest.length} argument${rest.length === 1 ? '' : 's'} go to the parameters.`, { stack: ['callPolyfill'], polyfillLine: 0, split: true })
  const baseStack = ['callPolyfill']
  key = Symbol('fn')
  push('key', 'make a brand new', 'bound = FUNCTIONS[fn]', 'A new Symbol is equal to nothing else, so it cannot overwrite a key the context already has.', { stack: baseStack, polyfillLine: 1, split: true })
  receiver[key] = spec.run
  push('attach', 'store the function', 'bound = FUNCTIONS[fn]', `The function is now reachable as a method of the context, in a temporary row.`, { stack: baseStack, polyfillLine: 2, split: true, activeKey: 'Symbol(fn)' })
  push('invoke', 'call it through', 'result = bound(*rest)', 'The call is written with the context before the brackets, and that is exactly what sets this to the context.', { stack: [...baseStack, fn], polyfillLine: 3, bodyLine: 0, thisValue: 'context', params: paramRows(), split: true, activeKey: 'Symbol(fn)' })

  const result = receiver[key](...rest)
  const reads = []
  log.forEach((entry, index) => {
    reads.push(entry.text)
    const lineIndex = spec.logLines[Math.min(index, spec.logLines.length - 1)]
    const pyKey = spec.pyKeys ? spec.pyKeys[Math.min(index, spec.pyKeys.length - 1)] : spec.pyKey
    push('body', 'the function body runs', pyKey, `${entry.text}.`, {
      stack: [...baseStack, fn], polyfillLine: 3, bodyLine: lineIndex, thisValue: 'context', params: paramRows(), reads: [...reads], split: true,
      contextRows: entry.state, activeKey: entry.name,
    })
  })
  push('body', 'the function body runs', spec.pyKeys ? spec.pyKeys.at(-1) : spec.pyKey, `The function returns ${show(result)}.`, {
    stack: [...baseStack, fn], polyfillLine: 3, bodyLine: spec.logLines.at(-1) ?? 1, thisValue: 'context', params: paramRows(), reads: [...reads], split: true, returned: result, hasReturned: true,
  })
  delete context[key]
  push('remove', 'delete the temporary', 'result = bound(*rest)', 'The temporary key is removed, so the object ends with only its own keys and any change the function made.', { stack: baseStack, polyfillLine: 4, reads: [...reads], split: true, returned: result, hasReturned: true })
  push('done', 'return what the function', 'return result', `callPolyfill returns ${show(result)}.`, { stack: baseStack, polyfillLine: 5, reads: [...reads], split: true, returned: result, hasReturned: true })
  return { input: { fn, args }, result, frames }
}
