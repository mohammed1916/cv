// Stacks, queues and deques with a log of every operation and the reason for it.
// Pure JS (no React) so solvers and node tests can use it. A lane is one structure; the log is shared
// so the operations of several lanes (e.g. two stacks) stay in the order they happened.

export const STACKQ_VIEW_LIMIT = 24 // lanes holding more items than this are not drawn; callers keep their table

const WHERE = {
  stack: { back: 'top', front: 'bottom' },
  queue: { back: 'back', front: 'front' },
  deque: { back: 'back', front: 'front' },
}

export class StackqLog {
  constructor() { this.ops = []; this.lanes = []; this.nextId = 1 }
  lane(name, kind = 'stack', format = String) {
    const lane = new StackqLane(this, name, kind, format)
    this.lanes.push(lane)
    return lane
  }
  takeOps() { const ops = this.ops; this.ops = []; return ops }
}

export class StackqLane {
  constructor(log, name, kind, format) { this.log = log; this.name = name; this.kind = kind; this.format = format; this.cells = [] }
  get length() { return this.cells.length }
  get items() { return this.cells.map(cell => cell.value) }
  peek() { return this.cells.at(-1)?.value }       // top of a stack, back of a queue/deque
  front() { return this.cells[0]?.value }
  back() { return this.cells.at(-1)?.value }
  record(type, cell, why) {
    this.log.ops.push({ type, lane: this.name, kind: this.kind, id: cell.id, label: this.format(cell.value), end: type.endsWith('Front') ? 'front' : 'back', why })
  }
  push(value, why) { const cell = { id: this.log.nextId++, value }; this.cells.push(cell); this.record('push', cell, why); return value }
  pushFront(value, why) { const cell = { id: this.log.nextId++, value }; this.cells.unshift(cell); this.record('pushFront', cell, why); return value }
  pop(why) { const cell = this.cells.pop(); if (cell) this.record('pop', cell, why); return cell?.value }
  popFront(why) { const cell = this.cells.shift(); if (cell) this.record('popFront', cell, why); return cell?.value }
  /** The element is looked at and stays put. */
  keep(why, end = 'back') {
    const cell = end === 'front' ? this.cells[0] : this.cells.at(-1)
    if (cell) this.record(end === 'front' ? 'keepFront' : 'keep', cell, why)
  }
  /** A structure-wide event, e.g. "the stack is empty, so nothing can be popped". */
  note(why) { this.log.ops.push({ type: 'note', lane: this.name, kind: this.kind, why }) }
}

/** One plain-language sentence per operation. */
export function describeStackqOps(ops = []) {
  return ops.map(op => {
    const where = WHERE[op.kind] ?? WHERE.stack
    const reason = op.why ? ` ${op.why[0].toUpperCase()}${op.why.slice(1)}` : ''
    const name = op.lane.replace(/\s*\(.*\)$/, '')
    if (op.type === 'note') return `${name}: ${op.why[0].toUpperCase()}${op.why.slice(1)}`
    const end = op.end === 'front' ? where.front : where.back
    if (op.kind === 'queue') {
      if (op.type === 'push') return `enqueue ${op.label} at the back of ${name}.${reason}`
      if (op.type === 'popFront') return `dequeue ${op.label} from the front of ${name}.${reason}`
    }
    if (op.type === 'push') return `push ${op.label} onto the ${end} of ${name}.${reason}`
    if (op.type === 'pushFront') return `push ${op.label} onto the front of ${name}.${reason}`
    if (op.type === 'pop') return `pop ${op.label} off the ${end} of ${name}.${reason}`
    if (op.type === 'popFront') return `pop ${op.label} off the front of ${name}.${reason}`
    if (op.type === 'keepFront') return `keep ${op.label}, the front of ${name}.${reason}`
    return `keep ${op.label}, the ${where.back} of ${name}.${reason}`
  })
}

/** Snapshot of every lane for the view, draining the log. Returns {} when a lane is too large to draw. */
export function stackqView(log, limit = STACKQ_VIEW_LIMIT) {
  const ops = log.takeOps()
  if (log.lanes.some(lane => lane.length > limit)) return {}
  const pushed = new Set(ops.filter(op => op.type === 'push' || op.type === 'pushFront').map(op => op.id))
  const kept = new Set(ops.filter(op => op.type.startsWith('keep')).map(op => op.id))
  const lanes = log.lanes.map(lane => ({
    name: lane.name,
    kind: lane.kind,
    items: lane.cells.map(cell => ({ label: lane.format(cell.value), fresh: pushed.has(cell.id), kept: kept.has(cell.id) })),
    removed: ops.filter(op => op.lane === lane.name && (op.type === 'pop' || op.type === 'popFront'))
      .map(op => ({ label: op.label, end: op.type === 'popFront' ? 'front' : 'back' })),
  }))
  return { stackq: { lanes, ops } }
}
