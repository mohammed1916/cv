const BUCKETS = 10

export function parseInput(text) {
  const ops = JSON.parse(text)
  if (!Array.isArray(ops) || ops.length < 1 || ops.length > 500) throw new Error('Enter 1–500 operations: ["put", key, value], ["get", key] or ["remove", key].')
  for (const op of ops) {
    const [name, key, value] = op
    if (!['put', 'get', 'remove'].includes(name) || !Number.isInteger(key) || key < 0 || key > 1000000) throw new Error('Keys are integers from 0 to 1,000,000.')
    if (name === 'put' && (!Number.isInteger(value) || value < 0 || value > 1000000)) throw new Error('Values are integers from 0 to 1,000,000.')
  }
  return ops
}

// Chained hashing with (key, value) pairs; get returns −1 when the key is missing.
export function buildTrace(ops) {
  const buckets = Array.from({ length: BUCKETS }, () => [])
  const log = []
  const frames = [{ phase: 'start', buckets: buckets.map(b => [...b]), op: null, activeLine: 2, message: `${BUCKETS} buckets of (key, value) pairs.` }]
  ops.forEach(([name, key, value], i) => {
    const bucket = key % BUCKETS
    const list = buckets[bucket]
    const at = list.findIndex(([k]) => k === key)
    let returned = null
    if (name === 'put') { if (at >= 0) list[at][1] = value; else list.push([key, value]) }
    else if (name === 'remove') { if (at >= 0) list.splice(at, 1) }
    else returned = at >= 0 ? list[at][1] : -1
    log.push({ name, args: name === 'put' ? [key, value] : [key], returned })
    frames.push({ phase: name, bucket, op: i, key, returned, buckets: buckets.map(b => b.map(([k, v]) => `${k}:${v}`)), log: log.map(x => ({ ...x })), activeLine: name === 'put' ? 5 : name === 'remove' ? 8 : 10,
      message: `${name}(${key}${name === 'put' ? `, ${value}` : ''}) in bucket ${bucket}${returned === null ? '' : ` → ${returned}`}.` })
  })
  frames.push({ phase: 'done', buckets: buckets.map(b => b.map(([k, v]) => `${k}:${v}`)), op: ops.length - 1, log, activeLine: 12, message: 'All operations complete.' })
  return { input: ops, result: log.filter(x => x.name === 'get').map(x => x.returned), log, frames }
}

export const code = `class MyHashMap:
    def __init__(self):
        self.buckets = [[] for _ in range(10)]
    def put(self, key, value):
        b = self.buckets[key % 10]
        for pair in b:
            if pair[0] == key: pair[1] = value; return
        b.append([key, value])
    def get(self, key):
        for k, v in self.buckets[key % 10]:
            if k == key: return v
        return -1
    def remove(self, key):
        b = self.buckets[key % 10]
        b[:] = [p for p in b if p[0] != key]`.split('\n').map((text, index) => ({ line: index + 1, text }))
