export function parseInput(text) {
  const ops = JSON.parse(text)
  if (!Array.isArray(ops) || ops.length < 1 || ops.length > 30) throw new Error('Use 1 to 30 operations.')
  const last = new Map()
  for (const op of ops) {
    if (op[0] === 'set') {
      const [, key, value, ts] = op
      if (typeof key !== 'string' || !/^[a-z]{1,5}$/.test(key) || typeof value !== 'string' || !/^[a-z]{1,5}$/.test(value)) throw new Error('Keys and values are 1 to 5 lowercase letters.')
      if (!Number.isInteger(ts) || ts < 1 || ts > 100) throw new Error('Timestamps are integers from 1 to 100.')
      if (last.has(key) && ts <= last.get(key)) throw new Error(`Timestamps for ${key} must strictly increase.`)
      last.set(key, ts)
    } else if (op[0] === 'get') {
      const [, key, ts] = op
      if (typeof key !== 'string' || !Number.isInteger(ts)) throw new Error('get needs a key and a timestamp.')
    } else {
      throw new Error(`Unknown operation ${op[0]}: use set or get.`)
    }
  }
  return ops
}

export function buildTrace(ops) {
  const store = new Map()
  const result = []
  const frames = [{ phase: 'start', activeLine: L('start with an empty store'), key: null, entries: [], low: null, high: null, mid: null, found: null, result: null, message: 'Each key keeps its (timestamp, value) pairs in increasing timestamp order.' }]
  for (const op of ops) {
    if (op[0] === 'set') {
      const [, key, value, ts] = op
      if (!store.has(key)) store.set(key, [])
      store.get(key).push([ts, value])
      result.push(null)
      frames.push({ phase: 'set', activeLine: L('append (time, value) to store'), key, entries: store.get(key).map(e => [...e]), low: null, high: null, mid: null, found: null, result: null, message: `Store ${value} for ${key} at time ${ts}.` })
      continue
    }
    const [, key, ts] = op
    const entries = store.get(key) ?? []
    let low = 0, high = entries.length - 1
    let answer = ''
    let found = -1
    frames.push({ phase: 'search', activeLine: L('set lo to 0'), key, entries: entries.map(e => [...e]), low, high, mid: null, found: null, result: null, message: `Find the latest ${key} entry at or before time ${ts}.` })
    while (low <= high) {
      const mid = Math.floor((low + high) / 2)
      const [when, value] = entries[mid]
      frames.push({ phase: 'search', activeLine: L('set mid to the middle'), key, entries: entries.map(e => [...e]), low, high, mid, found: null, result: null, message: `Check time ${when}: ${when <= ts ? 'not after the query, so the answer is here or later' : 'after the query, so look earlier'}.` })
      if (when <= ts) {
        answer = value
        found = mid
        low = mid + 1
      } else {
        high = mid - 1
      }
    }
    result.push(answer)
    frames.push({ phase: 'answer', activeLine: L('append ans, or null'), key, entries: entries.map(e => [...e]), low, high, mid: null, found, result: answer, message: answer === '' ? `No ${key} entry at or before ${ts}: answer "".` : `The latest value at or before ${ts} is ${answer}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return the answers'), key: null, entries: [], low: null, high: null, mid: null, found: null, result: null, message: `${ops.length} operation(s) processed.` })
  return { input: ops, result, frames }
}

export const code = `processOps(ops) runs each operation in order and returns the answers
  start with an empty store, which maps each key to a list of (time, value) pairs
  for each operation in ops
    if it is set(key, value, time), then append (time, value) to store[key]
    otherwise it is get(key, time): set entries to store[key], or an empty list
      set lo to 0 and hi to the last index of entries, and set ans to ""
      while lo is at most hi
        set mid to the middle index between lo and hi
        if entries[mid] has a time at most time, then set ans to its value and lo to mid plus 1
        otherwise set hi to mid minus 1
      append ans, or null for a set, to the answers
  return the answers`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `class TimeMap:
    def __init__(self):
        self.store = {}
    def set(self, key, value, timestamp):
        self.store.setdefault(key, []).append((timestamp, value))
    def get(self, key, timestamp):
        entries = self.store.get(key, [])
        lo, hi = 0, len(entries) - 1
        ans = ''
        while lo <= hi:
            mid = (lo + hi) // 2
            if entries[mid][0] <= timestamp:
                ans = entries[mid][1]
                lo = mid + 1
            else:
                hi = mid - 1
        return ans

def time_based_key_value_store(ops):
    tm = TimeMap()
    answers = []
    for op in ops:
        if op[0] == 'set':
            tm.set(op[1], op[2], op[3])
            answers.append(None)
        else:
            answers.append(tm.get(op[1], op[2]))
    return answers`
