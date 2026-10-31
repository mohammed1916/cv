const BUCKETS = 10

export function parseInput(text) {
  const ops = JSON.parse(text)
  if (!Array.isArray(ops) || ops.length < 1 || ops.length > 500) throw new Error('Enter 1–500 operations: ["add", key], ["remove", key] or ["contains", key].')
  for (const [name, key] of ops) {
    if (!['add', 'remove', 'contains'].includes(name) || !Number.isInteger(key) || key < 0 || key > 1000000) throw new Error('Keys are integers from 0 to 1,000,000.')
  }
  return ops
}

export const code = `hashSetOperations(ops):
  buckets = ten empty lists, indexed 0 through 9
  results = empty list
  for each [name, key] in ops
    bucket = buckets[key mod 10]
    if name is add, append key to bucket unless it is already there
    if name is remove, delete key from bucket if it is there
    if name is contains, append whether key is in bucket to results
  return results`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

// Chained hashing: key % 10 chooses a bucket; each bucket is a list of distinct keys.
export function buildTrace(ops) {
  const buckets = Array.from({ length: BUCKETS }, () => [])
  const log = []
  const frames = [{ phase: 'start', buckets: buckets.map(b => [...b]), op: null, activeLine: L('buckets = ten empty lists'), pythonLine: 2, message: `${BUCKETS} buckets; the bucket index is key mod ${BUCKETS}.` }]
  ops.forEach(([name, key], i) => {
    const bucket = key % BUCKETS
    const list = buckets[bucket]
    let returned = null
    if (name === 'add') { if (!list.includes(key)) list.push(key) }
    else if (name === 'remove') { const at = list.indexOf(key); if (at >= 0) list.splice(at, 1) }
    else returned = list.includes(key)
    log.push({ name, args: [key], returned })
    const line = name === 'add' ? L('append key to bucket unless it is already there') : name === 'remove' ? L('delete key from bucket if it is there') : L('append whether key is in bucket to results')
    frames.push({ phase: name, bucket, op: i, key, returned, buckets: buckets.map(b => [...b]), log: log.map(x => ({ ...x })), activeLine: line, pythonLine: name === 'add' ? 7 : name === 'remove' ? 10 : 13,
      message: `${name}(${key}) → bucket ${bucket}${returned === null ? '' : `, returns ${returned}`}.` })
  })
  frames.push({ phase: 'done', buckets: buckets.map(b => [...b]), log, activeLine: L('return results'), pythonLine: 14, message: 'All operations complete.' })
  return { input: ops, result: log.filter(x => x.name === 'contains').map(x => x.returned), log, frames }
}

export const python = `def hash_set_operations(ops):
    buckets = [[] for _ in range(10)]
    results = []
    for name, key in ops:
        bucket = buckets[key % 10]
        if name == 'add':
            if key not in bucket:
                bucket.append(key)
        elif name == 'remove':
            if key in bucket:
                bucket.remove(key)
        else:
            results.append(key in bucket)
    return results`
