export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Number.isInteger(input.length) || input.length < 1 || input.length > 6) throw new Error('Use {"length": 1 to 6, "ops": [...]}.')
  if (!Array.isArray(input.ops) || input.ops.length < 1 || input.ops.length > 16) throw new Error('ops holds 1 to 16 operations.')
  const isIndex = v => Number.isInteger(v) && v >= 0 && v < input.length
  let snaps = 0
  for (const op of input.ops) {
    if (!Array.isArray(op)) throw new Error('Each operation is an array such as ["set", 0, 5], ["snap"] or ["get", 0, 0].')
    if (op[0] === 'set' && op.length === 3 && isIndex(op[1]) && Number.isInteger(op[2]) && op[2] >= 0 && op[2] <= 50) continue
    if (op[0] === 'snap' && op.length === 1) { snaps += 1; continue }
    if (op[0] === 'get' && op.length === 3 && isIndex(op[1]) && Number.isInteger(op[2]) && op[2] >= 0 && op[2] < snaps) continue
    throw new Error('Use ["set", index, 0-50], ["snap"], or ["get", index, id] where id is an existing snapshot.')
  }
  return { length: input.length, ops: input.ops }
}

export function buildTrace({ length, ops }) {
  const current = Array(length).fill(0)
  // history[i] holds [snapshot id, value] pairs in time order; the first pair is the initial zero.
  const history = Array.from({ length }, () => [{ snap: -1, value: 0 }])
  const log = []
  const results = []
  let snaps = 0
  const frames = [{ phase: 'start', activeLine: L('start with every index'), op: -1, current: [...current], message: `Array of ${length} zeros with no snapshots yet.` }]
  ops.forEach((op, index) => {
    if (op[0] === 'set') {
      const [, at, value] = op
      current[at] = value
      const entries = history[at]
      if (entries[entries.length - 1].snap === snaps) entries[entries.length - 1].value = value
      else entries.push({ snap: snaps, value })
      log.push({ name: 'set', args: [at, value], returned: undefined })
      frames.push({ phase: 'set', activeLine: L('record the value'), op: index, current: [...current], message: `Set index ${at} to ${value}; it belongs to snapshot ${snaps}.` })
    } else if (op[0] === 'snap') {
      const id = snaps
      snaps += 1
      results.push(id)
      log.push({ name: 'snap', args: [], returned: id })
      frames.push({ phase: 'snap', activeLine: L('return the id'), op: index, current: [...current], message: `Snapshot ${id} is saved.` })
    } else {
      const [, at, id] = op
      const entries = history[at]
      let lo = 0
      let hi = entries.length - 1
      while (lo < hi) {
        const mid = (lo + hi + 1) >> 1
        if (entries[mid].snap <= id) lo = mid
        else hi = mid - 1
      }
      const value = entries[lo].value
      results.push(value)
      log.push({ name: 'get', args: [at, id], returned: value })
      frames.push({ phase: 'get', activeLine: L('find the last entry'), op: index, current: [...current], message: `Index ${at} in snapshot ${id} holds ${value}.` })
    }
  })
  frames.push({ phase: 'done', activeLine: L('return every returned value'), op: null, current: [...current], message: `Returned values: ${JSON.stringify(results)}.` })
  return { input: { length, ops }, log, result: results, frames }
}

export const code = `snapshot array of a fixed length
  start with every index at zero and no snapshots taken
  for each operation in order
    if the operation is set then
      record the value under the current snapshot number
    if the operation is snap then
      return the id of the new snapshot and move to the next id
    if the operation is get then
      find the last entry for the index whose snapshot id is at most the requested id
      return that value
  return every returned value in order`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def snapshot_array(length, ops):
    history = [[[-1, 0]] for _ in range(length)]
    snaps = 0
    results = []
    for op in ops:
        if op[0] == 'set':
            index, value = op[1], op[2]
            entries = history[index]
            if entries[-1][0] == snaps:
                entries[-1][1] = value
            else:
                entries.append([snaps, value])
        elif op[0] == 'snap':
            results.append(snaps)
            snaps += 1
        else:
            index, snap_id = op[1], op[2]
            entries = history[index]
            lo, hi = 0, len(entries) - 1
            while lo < hi:
                mid = (lo + hi + 1) // 2
                if entries[mid][0] <= snap_id:
                    lo = mid
                else:
                    hi = mid - 1
            results.append(entries[lo][1])
    return results
`
