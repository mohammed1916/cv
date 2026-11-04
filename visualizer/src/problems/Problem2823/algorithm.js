// The predicate is chosen by name: text typed on the page is never evaluated as code.
export const PREDICATES = {
  positive: { label: 'x > 0 (numbers only)', test: x => typeof x === 'number' && x > 0 },
  negative: { label: 'x < 0 (numbers only)', test: x => typeof x === 'number' && x < 0 },
  even: { label: 'x is an even number', test: x => typeof x === 'number' && x % 2 === 0 },
  odd: { label: 'x is an odd number', test: x => typeof x === 'number' && Math.abs(x % 2) === 1 },
  string: { label: 'typeof x === "string"', test: x => typeof x === 'string' },
  number: { label: 'typeof x === "number"', test: x => typeof x === 'number' },
  boolean: { label: 'typeof x === "boolean"', test: x => typeof x === 'boolean' },
  null: { label: 'x === null', test: x => x === null },
  truthy: { label: 'Boolean(x)', test: x => Boolean(x) },
  isArray: { label: 'Array.isArray(x)', test: x => Array.isArray(x) },
}
const MAX_NODES = 60

const isContainer = value => typeof value === 'object' && value !== null
const countNodes = value => !isContainer(value) ? 1 : 1 + Object.values(value).reduce((sum, child) => sum + countNodes(child), 0)

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with obj and fn.')
  const { obj, fn } = input
  if (!isContainer(obj)) throw new Error('obj is a JSON object or array.')
  if (typeof fn !== 'string' || !Object.hasOwn(PREDICATES, fn)) throw new Error(`fn is one of: ${Object.keys(PREDICATES).join(', ')}.`)
  if (countNodes(obj) > MAX_NODES) throw new Error(`Keep obj to ${MAX_NODES} values and containers here.`)
  return { obj, fn }
}

export const code = `deep filter of data
  if data is an array or an object
    start an empty container of the same kind
    for each child of data
      filter the child recursively
      if the child came back with nothing, leave it out
      otherwise add it to the container
    if the container is empty, return nothing, else return it
  otherwise data is a plain value
    return data if fn accepts it, else return nothing
finish: the root result, or undefined when it is nothing`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `DROP = object()

def deep_filter(obj, fn):
    def walk(data):
        if isinstance(data, list):
            kept = []
            for item in data:
                value = walk(item)
                if value is DROP:
                    continue
                kept.append(value)
            return kept if kept else DROP
        if isinstance(data, dict):
            kept = {}
            for key, item in data.items():
                value = walk(item)
                if value is DROP:
                    continue
                kept[key] = value
            return kept if kept else DROP
        return data if fn(data) else DROP
    result = walk(obj)
    return None if result is DROP else result
`

const pythonLines = python.split('\n')
const lineIn = (lines, fragment, from = 0) => {
  const index = lines.findIndex((text, i) => i >= from && text.includes(fragment))
  if (index < 0) throw new Error(`Line missing: ${fragment}`)
  return index + 1
}
const L = fragment => lineIn(code.map(entry => entry.text), fragment)
const LIST = lineIn(pythonLines, 'isinstance(data, list)')
const DICT = lineIn(pythonLines, 'isinstance(data, dict)')
const P = fragment => lineIn(pythonLines, fragment)
const inBranch = (kind, fragment) => lineIn(pythonLines, fragment, (kind === 'array' ? LIST : DICT) - 1)

function toNode(value, id, key) {
  const kind = Array.isArray(value) ? 'array' : isContainer(value) ? 'object' : 'leaf'
  const node = { id, key, kind, raw: value, children: [] }
  if (kind === 'array') node.children = value.map((child, i) => toNode(child, `${id}/${i}`, i))
  if (kind === 'object') node.children = Object.keys(value).map((childKey, i) => toNode(value[childKey], `${id}/k${i}`, childKey))
  return node
}
const summary = node => node.kind === 'array' ? '[ ]' : node.kind === 'object' ? '{ }' : JSON.stringify(node.raw)
const keyText = (key, parentKind) => key === null ? 'root' : parentKind === 'array' ? `[${key}]` : `"${key}"`
const labelOf = (node, parentKind, key = node.key) => `${keyText(key, parentKind)}: ${summary(node)}`
const nameOf = (node, parentKind) => `${keyText(node.key, parentKind)}`

function setOwn(target, key, value) {
  // A JSON key can be "__proto__"; define it so it stays ordinary data.
  Object.defineProperty(target, key, { value, enumerable: true, writable: true, configurable: true })
}

export function buildTrace({ obj, fn }) {
  const predicate = PREDICATES[fn]
  const root = toNode(obj, 'root', null)
  const frames = []
  const roles = {}
  const tags = {}
  const stack = []
  // Status decides what the result tree shows: 'open' and 'closed' containers, 'kept' values.
  const status = {}

  const inputTree = (node, parentKind) => ({ id: node.id, value: labelOf(node, parentKind), children: node.children.map(child => inputTree(child, node.kind)) })
  const outputTree = (node, parentKind, key) => {
    const state = status[node.id]
    if (state !== 'open' && state !== 'closed' && state !== 'kept') return null
    const shown = { id: node.id, value: labelOf(node, parentKind, key), children: [] }
    for (const child of node.children) {
      const next = outputTree(child, node.kind, node.kind === 'array' ? shown.children.length : child.key)
      if (next) shown.children.push(next)
    }
    return shown
  }
  const inputShape = inputTree(root, null)
  const push = (phase, codeLine, pythonLine, message, extra = {}) => frames.push({
    phase, activeLine: L(codeLine), pythonLine, message,
    tree: inputShape, roles: { ...roles }, tags: { ...tags }, built: outputTree(root, null, null), stack: [...stack], test: null, ...extra,
  })

  function walk(node, parentKind) {
    const name = nameOf(node, parentKind)
    stack.push(name)
    if (node.kind === 'leaf') {
      roles[node.id] = 'active'
      const passed = Boolean(predicate.test(node.raw))
      tags[node.id] = `fn: ${passed}`
      push('test', 'return data if fn', P('return data if fn(data)'), `fn(${JSON.stringify(node.raw)}) is ${passed}, so ${passed ? 'the value returns to its parent' : 'nothing returns'}.`, { test: { value: JSON.stringify(node.raw), passed } })
      stack.pop()
      return passed ? { value: node.raw } : null
    }
    const kept = node.kind === 'array' ? [] : {}
    status[node.id] = 'open'
    roles[node.id] = 'active'
    tags[node.id] = 'open'
    push('enter', 'start an empty container', inBranch(node.kind, 'kept ='), `Open ${name}: start an empty ${node.kind} and visit its ${node.children.length} child${node.children.length === 1 ? '' : 'ren'}.`)
    let count = 0
    for (const child of node.children) {
      roles[node.id] = 'visited'
      const returned = walk(child, node.kind)
      roles[node.id] = 'active'
      const childName = nameOf(child, node.kind)
      if (returned === null) {
        roles[child.id] = 'pruned'
        if (child.kind === 'leaf') tags[child.id] = 'removed'
        push('drop', 'came back with nothing', inBranch(node.kind, 'if value is DROP'), `${childName} came back with nothing, so ${name} leaves it out.`)
      } else {
        roles[child.id] = 'match'
        tags[child.id] = 'kept'
        if (child.kind === 'leaf') status[child.id] = 'kept'
        if (node.kind === 'array') kept.push(returned.value)
        else setOwn(kept, child.key, returned.value)
        count += 1
        push('keep', 'otherwise add it', inBranch(node.kind, node.kind === 'array' ? 'kept.append' : 'kept[key] ='), `${childName} survived; ${name} now holds ${count} entr${count === 1 ? 'y' : 'ies'}.`)
      }
    }
    const empty = count === 0
    status[node.id] = empty ? 'pruned' : 'closed'
    tags[node.id] = empty ? 'empty, removed' : `${count} kept`
    push('close', 'if the container is empty', inBranch(node.kind, 'return kept if kept'), empty
      ? `${name} ended up empty, so it returns nothing and disappears from the result.`
      : `${name} finished with ${count} entr${count === 1 ? 'y' : 'ies'} and returns.`)
    stack.pop()
    return empty ? null : { value: kept }
  }

  push('start', 'deep filter of data', P('result = walk(obj)'), `Start at the root, using fn = ${predicate.label}.`)
  const returned = walk(root, null)
  if (returned === null) roles[root.id] = 'pruned'
  else roles[root.id] = 'match'
  const result = returned === null ? undefined : returned.value
  push('done', 'finish: the root result', P('return None if result is DROP'), returned === null
    ? 'Nothing survived, so the answer is undefined.'
    : `The answer is ${JSON.stringify(result)}.`, { output: returned === null ? 'undefined' : JSON.stringify(result) })
  return { input: { obj, fn }, result, frames }
}
