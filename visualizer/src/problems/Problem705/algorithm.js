const BUCKETS = 10

export function parseInput(text) {
  const ops = JSON.parse(text)
  if (!Array.isArray(ops) || ops.length < 1 || ops.length > 500) throw new Error('Enter 1–500 operations: ["add", key], ["remove", key] or ["contains", key].')
  for (const [name, key] of ops) {
    if (!['add', 'remove', 'contains'].includes(name) || !Number.isInteger(key) || key < 0 || key > 1000000) throw new Error('Keys are integers from 0 to 1,000,000.')
  }
  return ops
}

// Chained hashing: key % 10 chooses a bucket; each bucket is a list of distinct keys.
export function buildTrace(ops) {
  const buckets = Array.from({ length: BUCKETS }, () => [])
  const log = []
  const frames = [{ phase: 'start', buckets: buckets.map(b => [...b]), op: null, activeLine: 2, message: `${BUCKETS} buckets; the bucket index is key mod ${BUCKETS}.` }]
  ops.forEach(([name, key], i) => {
    const bucket = key % BUCKETS
    const list = buckets[bucket]
    let returned = null
    if (name === 'add') { if (!list.includes(key)) list.push(key) }
    else if (name === 'remove') { const at = list.indexOf(key); if (at >= 0) list.splice(at, 1) }
    else returned = list.includes(key)
    log.push({ name, args: [key], returned })
    frames.push({ phase: name, bucket, op: i, key, returned, buckets: buckets.map(b => [...b]), log: log.map(x => ({ ...x })), activeLine: name === 'add' ? 5 : name === 'remove' ? 7 : 9,
      message: `${name}(${key}) → bucket ${bucket}${returned === null ? '' : `, returns ${returned}`}.` })
  })
  frames.push({ phase: 'done', buckets: buckets.map(b => [...b]), log, activeLine: 11, message: 'All operations complete.' })
  return { input: ops, result: log.filter(x => x.name === 'contains').map(x => x.returned), log, frames }
}

export const code = `class MyHashSet:
    def __init__(self):
        self.buckets = [[] for _ in range(10)]
    def add(self, key):
        b = self.buckets[key % 10]
        if key not in b: b.append(key)
    def remove(self, key):
        b = self.buckets[key % 10]
        if key in b: b.remove(key)
    def contains(self, key):
        return key in self.buckets[key % 10]`.split('\n').map((text, index) => ({ line: index + 1, text }))
