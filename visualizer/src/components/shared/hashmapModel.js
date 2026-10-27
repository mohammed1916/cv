// Hash maps and hash sets that log every operation, plus the plain-language descriptions the view shows.
// TrackedMap / TrackedSet are real Map / Set subclasses, so a solver only changes the constructor and
// spreads hashmapView(...) into the state it emits; its lookups, inserts, updates and deletes are logged.
let sequence = 0

export const HASH_VIEW_LIMIT = 40 // entries shown per map before the view says "+N more"
export const HASH_OPS_LIMIT = 14 // operation lines shown per step

const keyText = key => (typeof key === 'object' && key !== null ? JSON.stringify(key) : String(key))
export const hashKeyText = keyText

class MapLog {
  constructor(name, options) {
    this.name = name
    this.keyLabel = options.keyLabel ?? 'key'
    this.valueLabel = options.valueLabel ?? 'value'
    this.hitNote = options.hit ?? 'the earlier entry answers the question in one lookup, with no rescanning'
    this.missNote = options.miss ?? 'nothing earlier matches, so the scan carries on and may store this key for later'
    this.ops = []
  }

  record(op) {
    const last = this.ops[this.ops.length - 1]
    // Collapse the has(k) immediately followed by get(k) idiom into one logged lookup.
    if (last && op.type === 'lookup' && last.type === 'lookup' && last.key === op.key && last.hit === op.hit) return
    this.ops.push({ seq: sequence++, map: this.name, hitNote: this.hitNote, missNote: this.missNote, ...op })
  }
}

export class TrackedMap extends Map {
  constructor(name = 'map', options = {}) {
    super()
    Object.defineProperty(this, 'log', { value: new MapLog(name, options), enumerable: false })
    Object.defineProperty(this, 'isSet', { value: false, enumerable: false })
  }

  has(key) {
    const hit = super.has(key)
    this.log.record({ type: 'lookup', via: 'has', key, hit, value: hit ? super.get(key) : undefined })
    return hit
  }

  get(key) {
    const hit = super.has(key)
    const value = super.get(key)
    this.log.record({ type: 'lookup', via: 'get', key, hit, value })
    return value
  }

  set(key, value) {
    if (this.log === undefined) return super.set(key, value)
    const existed = super.has(key)
    const before = super.get(key)
    super.set(key, value)
    this.log.ops.push({ seq: sequence++, map: this.log.name, type: existed ? 'update' : 'insert', key, value, before })
    return this
  }

  delete(key) {
    const existed = super.has(key)
    const before = super.get(key)
    const result = super.delete(key)
    this.log.ops.push({ seq: sequence++, map: this.log.name, type: 'delete', key, existed, before })
    return result
  }

  clear() {
    const count = this.size
    super.clear()
    this.log.ops.push({ seq: sequence++, map: this.log.name, type: 'clear', count })
  }
}

export class TrackedSet extends Set {
  constructor(name = 'set', options = {}) {
    super()
    Object.defineProperty(this, 'log', { value: new MapLog(name, { keyLabel: 'member', ...options }), enumerable: false })
    Object.defineProperty(this, 'isSet', { value: true, enumerable: false })
  }

  has(key) {
    const hit = super.has(key)
    this.log.record({ type: 'lookup', via: 'has', key, hit })
    return hit
  }

  add(key) {
    if (this.log === undefined) return super.add(key)
    const existed = super.has(key)
    super.add(key)
    this.log.ops.push({ seq: sequence++, map: this.log.name, type: existed ? 'noop-add' : 'insert', key })
    return this
  }

  delete(key) {
    const existed = super.has(key)
    const result = super.delete(key)
    this.log.ops.push({ seq: sequence++, map: this.log.name, type: 'delete', key, existed })
    return result
  }

  clear() {
    const count = this.size
    super.clear()
    this.log.ops.push({ seq: sequence++, map: this.log.name, type: 'clear', count })
  }
}

/** One plain-language line per logged operation, with whether it was a hit or a miss and why that matters. */
export function describeHashOps(ops = [], text = keyText) {
  return ops.map(op => {
    const where = `${op.map}`
    const show = value => (value === undefined ? 'nothing' : text(value))
    if (op.type === 'lookup') {
      const call = `${op.via === 'has' ? 'has' : 'get'}(${text(op.key)})`
      if (op.hit) {
        const found = op.value === undefined ? '' : ` and returns ${text(op.value)}`
        return { kind: 'hit', text: `${where}.${call}: HIT. The key is present${found}. Why it matters: ${op.hitNote}.` }
      }
      return { kind: 'miss', text: `${where}.${call}: MISS. The key is absent. Why it matters: ${op.missNote}.` }
    }
    if (op.type === 'insert') {
      const stored = op.value === undefined ? '' : ` → ${text(op.value)}`
      return { kind: 'insert', text: `${where}.insert ${text(op.key)}${stored}: new key, the map grows by one entry.` }
    }
    if (op.type === 'update') {
      return { kind: 'update', text: `${where}.update ${text(op.key)}: value ${show(op.before)} is replaced by ${show(op.value)}; the key keeps its slot.` }
    }
    if (op.type === 'noop-add') return { kind: 'hit', text: `${where}.add(${text(op.key)}): already a member, so the set does not change.` }
    if (op.type === 'delete') {
      return op.existed
        ? { kind: 'delete', text: `${where}.delete ${text(op.key)}${op.before === undefined ? '' : ` (was ${text(op.before)})`}: the entry is removed.` }
        : { kind: 'miss', text: `${where}.delete ${text(op.key)}: MISS. There was nothing to remove.` }
    }
    return { kind: 'delete', text: `${where}.clear: all ${op.count} entries are removed.` }
  })
}

/** Role of each touched key (by key text): the last thing the operations did to it. */
export function hashEntryRoles(ops = [], text = keyText) {
  const roles = {}
  for (const op of ops) {
    const key = text(op.key)
    if (op.type === 'lookup') roles[key] = op.hit ? 'hit' : 'miss'
    else if (op.type === 'insert') roles[key] = 'insert'
    else if (op.type === 'update') roles[key] = 'update'
    else if (op.type === 'noop-add') roles[key] = 'hit'
    else if (op.type === 'delete') roles[key] = 'delete'
  }
  return roles
}

/** Entries in insertion order, capped; `total` lets the view say how many are hidden. */
export function limitHashEntries(entries, limit = HASH_VIEW_LIMIT) {
  return { shown: entries.slice(0, limit), hidden: Math.max(0, entries.length - limit) }
}

const snapshot = structure => ({
  name: structure.log.name,
  isSet: structure.isSet,
  keyLabel: structure.log.keyLabel,
  valueLabel: structure.log.valueLabel,
  entries: structure.isSet ? [...structure].map(key => [key]) : [...structure.entries()],
})

/** State for a story frame: the maps' contents and the operations since the previous frame. */
export function hashmapView(...structures) {
  const ops = []
  for (const structure of structures) { ops.push(...structure.log.ops); structure.log.ops = [] }
  ops.sort((a, b) => a.seq - b.seq)
  const kept = ops.length > HASH_OPS_LIMIT ? ops.slice(-HASH_OPS_LIMIT) : ops
  return { hash: { maps: structures.map(snapshot), ops: kept, skipped: ops.length - kept.length } }
}
