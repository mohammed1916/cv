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

export const code = `hashMapOperations(ops):
  buckets = ten empty lists of [key, value] pairs
  results = empty list
  for each operation in ops
    bucket = buckets[key mod 10]
    if operation is put, update the pair for key in bucket, or append [key, value] if absent
    if operation is remove, delete the pair for key from bucket
    if operation is get, append the value for key in bucket, or -1 if absent, to results
  return results`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

// Chained hashing with (key, value) pairs; get returns −1 when the key is missing.
export function buildTrace(ops) {
  const buckets = Array.from({ length: BUCKETS }, () => [])
  const log = []
  const frames = [{ phase: 'start', buckets: buckets.map(b => [...b]), op: null, activeLine: L('buckets = ten empty lists'), message: `${BUCKETS} buckets of (key, value) pairs.` }]
  ops.forEach(([name, key, value], i) => {
    const bucket = key % BUCKETS
    const list = buckets[bucket]
    const at = list.findIndex(([k]) => k === key)
    let returned = null
    if (name === 'put') { if (at >= 0) list[at][1] = value; else list.push([key, value]) }
    else if (name === 'remove') { if (at >= 0) list.splice(at, 1) }
    else returned = at >= 0 ? list[at][1] : -1
    log.push({ name, args: name === 'put' ? [key, value] : [key], returned })
    const line = name === 'put' ? L('update the pair for key in bucket') : name === 'remove' ? L('delete the pair for key from bucket') : L('append the value for key in bucket')
    frames.push({ phase: name, bucket, op: i, key, returned, buckets: buckets.map(b => b.map(([k, v]) => `${k}:${v}`)), log: log.map(x => ({ ...x })), activeLine: line,
      message: `${name}(${key}${name === 'put' ? `, ${value}` : ''}) in bucket ${bucket}${returned === null ? '' : ` → ${returned}`}.` })
  })
  frames.push({ phase: 'done', buckets: buckets.map(b => b.map(([k, v]) => `${k}:${v}`)), op: ops.length - 1, log, activeLine: L('return results'), message: 'All operations complete.' })
  return { input: ops, result: log.filter(x => x.name === 'get').map(x => x.returned), log, frames }
}

export const python = `def hash_map_operations(ops):
    buckets = [[] for _ in range(10)]
    results = []
    for op in ops:
        name, key = op[0], op[1]
        bucket = buckets[key % 10]
        if name == 'put':
            value = op[2]
            for pair in bucket:
                if pair[0] == key:
                    pair[1] = value
                    break
            else:
                bucket.append([key, value])
        elif name == 'remove':
            bucket[:] = [pair for pair in bucket if pair[0] != key]
        else:
            found = -1
            for pair in bucket:
                if pair[0] == key:
                    found = pair[1]
            results.append(found)
    return results`
