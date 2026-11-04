const MAX_CALLS = 14
const MAX_ARGS = 4

export const phases = [
  { id: 'start', label: 'Start', description: 'The cache tree holds only its root.' },
  { id: 'call', label: 'Call', description: 'A new call arrives; begin again at the root.' },
  { id: 'follow', label: 'Follow', description: 'This argument already has a branch here.' },
  { id: 'grow', label: 'Grow', description: 'No branch is === to this argument, so add one.' },
  { id: 'hit', label: 'Hit', description: 'The node holds a value, so fn stays idle.' },
  { id: 'miss', label: 'Miss', description: 'The node is empty, so fn runs once and the value is stored.' },
  { id: 'return', label: 'Return', description: 'Hand back the value stored at this node.' },
  { id: 'done', label: 'Result', description: 'Every call has been answered.' },
]

const isObjectLike = value => value !== null && typeof value === 'object'
const isRef = value => typeof value === 'string' && value.startsWith('@')

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with fn and calls.')
  const { fn, calls, objects = {} } = input
  if (!['add', 'merge', 'list'].includes(fn)) throw new Error('fn is "add", "merge" or "list".')
  if (!isObjectLike(objects) || Array.isArray(objects)) throw new Error('objects maps names to shared objects.')
  for (const value of Object.values(objects)) if (!isObjectLike(value)) throw new Error('Every entry of objects is an object or array.')
  if (!Array.isArray(calls) || calls.length < 1 || calls.length > MAX_CALLS) throw new Error(`calls has 1 to ${MAX_CALLS} entries.`)
  for (const call of calls) {
    if (!Array.isArray(call) || call.length > MAX_ARGS) throw new Error(`Each call is a list of at most ${MAX_ARGS} arguments.`)
    for (const arg of call) {
      if (isRef(arg) && !Object.hasOwn(objects, arg.slice(1))) throw new Error(`${arg} is not declared in objects.`)
      const resolved = isRef(arg) ? objects[arg.slice(1)] : arg
      if (fn === 'add' && !Number.isFinite(resolved)) throw new Error('add takes numbers only.')
      if (fn === 'merge' && (!isObjectLike(resolved) || Array.isArray(resolved))) throw new Error('merge takes objects only.')
    }
  }
  return { fn, objects, calls }
}

// Turns JSON into real values: an "@name" is one shared object, every literal object is a brand-new one.
export function resolveCalls({ objects = {}, calls }) {
  const shared = new Map(Object.entries(objects).map(([name, value]) => [name, structuredClone(value)]))
  let fresh = 0
  return calls.map(call => call.map(arg => {
    if (isRef(arg)) {
      const name = arg.slice(1)
      return { value: shared.get(name), label: name, isObject: true, content: JSON.stringify(shared.get(name)) }
    }
    if (isObjectLike(arg)) {
      fresh += 1
      return { value: structuredClone(arg), label: `${JSON.stringify(arg)} #${fresh}`, isObject: true, content: JSON.stringify(arg) }
    }
    return { value: arg, label: JSON.stringify(arg), isObject: false, content: null }
  }))
}

export const tools = {
  add: (...args) => args.reduce((total, value) => total + value, 0),
  merge: (...args) => Object.assign({}, ...args),
  list: (...args) => [...args],
}

export function buildTrace({ fn, objects = {}, calls }) {
  const frames = []
  const resolved = resolveCalls({ objects, calls })
  const makeNode = (id, label, content) => ({ id, label, content, next: new Map(), done: false, value: undefined })
  const root = makeNode(0, 'root', null)
  let nextId = 1
  let fnCalls = 0
  const log = calls.map(() => null)
  const snapshot = node => ({
    id: node.id, label: node.label, done: node.done,
    valueText: node.done ? JSON.stringify(node.value) : null,
    children: [...node.next.values()].map(snapshot),
  })
  const push = (phase, pseudo, py, message, extra = {}) => frames.push({
    phase, activeLine: L(pseudo), pythonLine: P(py), message,
    tree: snapshot(root), path: [0], focus: 0, callIndex: -1, args: [], argIndex: -1,
    outcome: null, lookalike: null, fnCalls, log: [...log], ...extra,
  })
  push('start', 'cache is a tree', 'root = new_node()', 'The cache starts as one empty root. No call has been answered yet.')
  const result = []
  resolved.forEach((args, callIndex) => {
    const labels = args.map(arg => arg.label)
    let node = root
    const path = [0]
    const base = () => ({ callIndex, args: labels, path: [...path], focus: node.id })
    push('call', 'start at the root', 'node = root', `Call ${callIndex + 1} passes ${labels.length ? labels.join(', ') : 'no arguments'}. Begin at the root.`, base())
    args.forEach((arg, argIndex) => {
      const existing = node.next.get(arg.value)
      if (existing) {
        node = existing
        path.push(node.id)
        push('follow', 'follow the branch', 'node = node["next"][key]', `Argument ${argIndex + 1} (${arg.label}) is === to an existing branch, so follow it.`, { ...base(), argIndex })
        return
      }
      const lookalike = arg.isObject
        ? [...node.next.values()].find(child => child.content !== null && child.content === arg.content) ?? null
        : null
      const child = makeNode(nextId++, arg.label, arg.content)
      node.next.set(arg.value, child)
      node = child
      path.push(node.id)
      push('grow', 'if this node has no branch', 'node["next"][key] = new_node(arg)',
        lookalike
          ? `${arg.label} has the same contents as ${lookalike.label} but is a different object, so === is false. It gets its own branch.`
          : `No branch here is === to ${arg.label}, so add one.`,
        { ...base(), argIndex, lookalike: lookalike ? { existing: lookalike.label, incoming: arg.label } : null })
    })
    if (node.done) {
      push('hit', 'if the node reached has no stored value', 'if not node["done"]:', `This exact argument sequence was seen before. The node already holds ${JSON.stringify(node.value)}, so fn does not run.`, { ...base(), outcome: 'hit' })
    } else {
      node.value = tools[fn](...args.map(arg => arg.value))
      node.done = true
      fnCalls += 1
      push('miss', 'call fn with the arguments', 'node["value"] = fn(*args)', `First time for this sequence. fn runs (call number ${fnCalls}) and ${JSON.stringify(node.value)} is stored at this node.`, { ...base(), outcome: 'miss' })
    }
    const outcome = frames[frames.length - 1].outcome
    log[callIndex] = { outcome, valueText: JSON.stringify(node.value), calls: fnCalls }
    result.push({ val: node.value, calls: fnCalls })
    push('return', 'return the value stored', 'output.append({"val": val, "calls": stats["calls"]})', `Call ${callIndex + 1} returns ${JSON.stringify(node.value)}. fn has run ${fnCalls} time${fnCalls === 1 ? '' : 's'} so far.`, { ...base(), outcome })
  })
  push('done', 'return the value stored', 'return output', `All ${calls.length} calls answered with ${fnCalls} run${fnCalls === 1 ? '' : 's'} of fn.`, { path: [0] })
  return { input: { fn, objects, calls }, result, frames }
}

export const code = `memoize(fn): build a wrapper that never repeats a call
  cache is a tree; its root means no argument has been read yet
  when memoized(arguments) is called
    start at the root
    for each argument a, in order
      if this node has no branch that is === to a, add one
      follow the branch for a
    if the node reached has no stored value
      call fn with the arguments, count it, store the value here
    return the value stored at this node`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Pseudocode line missing: ${s}`)
  return index + 1
}

export const python = `def identity(arg):
    if isinstance(arg, (dict, list)):
        return ("object", id(arg))
    return (type(arg).__name__, arg)


def new_node(arg=None):
    # Holding arg keeps the object alive, so its id() can never be reused.
    return {"arg": arg, "next": {}, "done": False, "value": None}


def memoize(fn, stats):
    root = new_node()

    def memoized(*args):
        node = root
        for arg in args:
            key = identity(arg)
            if key not in node["next"]:
                node["next"][key] = new_node(arg)
            node = node["next"][key]
        if not node["done"]:
            stats["calls"] += 1
            node["value"] = fn(*args)
            node["done"] = True
        return node["value"]

    return memoized


def run_memoized(fn, calls, objects=None):
    shared = {"@" + name: value for name, value in (objects or {}).items()}
    tools = {
        "add": lambda *a: sum(a),
        "merge": lambda *a: {k: v for d in a for k, v in d.items()},
        "list": lambda *a: list(a),
    }
    stats = {"calls": 0}
    memoized = memoize(tools[fn], stats)
    output = []
    for call in calls:
        args = [shared.get(a, a) if isinstance(a, str) else a for a in call]
        val = memoized(*args)
        output.append({"val": val, "calls": stats["calls"]})
    return output
`
const P = s => {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Python line missing: ${s}`)
  return index + 1
}
