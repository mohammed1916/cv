export function parseInput(text) {
  const ops = JSON.parse(text)
  if (!Array.isArray(ops) || ops.length < 1 || ops.length > 1000) throw new Error('Enter a JSON array of 1–1,000 operations: ["insert", key, value] or ["sum", prefix].')
  const keyOk = s => typeof s === 'string' && /^[a-z]{1,50}$/.test(s)
  for (const op of ops) {
    if (!Array.isArray(op) || (op[0] === 'insert' && (op.length !== 3 || !keyOk(op[1]) || !Number.isInteger(op[2]) || op[2] < 0 || op[2] > 1000)) || (op[0] === 'sum' && (op.length !== 2 || !keyOk(op[1]))) || !['insert', 'sum'].includes(op[0])) {
      throw new Error('Operations: ["insert", key, value] with key a–z (≤ 50 letters) and value 0–1,000, or ["sum", prefix].')
    }
  }
  return ops
}

// Keys map to values; a sum scans the stored keys for the prefix (the trie version avoids the scan).
export function buildTrace(ops) {
  const map = new Map()
  const out = []
  const frames = [{ phase: 'start', ops: [], map: [], activeLine: 2, message: 'Start with an empty map.' }]
  ops.forEach((op, index) => {
    if (op[0] === 'insert') {
      map.set(op[1], op[2])
      out.push({ name: 'insert', args: [op[1], op[2]], returned: null })
      frames.push({ phase: 'insert', index, map: [...map.entries()], ops: out.map(o => ({ ...o })), activeLine: 4, message: `Store ${op[1]} = ${op[2]}; overwrites the old value if the key existed.` })
    } else {
      let total = 0
      const matches = []
      for (const [key, value] of map) if (key.startsWith(op[1])) { total += value; matches.push(key) }
      out.push({ name: 'sum', args: [op[1]], returned: total })
      frames.push({ phase: 'sum', index, prefix: op[1], matches, total, map: [...map.entries()], ops: out.map(o => ({ ...o })), activeLine: 7, message: `Sum of keys starting with ${op[1]}: ${matches.join(', ') || 'none'} → ${total}.` })
    }
  })
  frames.push({ phase: 'done', index: ops.length - 1, map: [...map.entries()], ops: out.map(o => ({ ...o })), result: out.filter(o => o.name === 'sum').map(o => o.returned), activeLine: 9, message: 'All operations complete.' })
  return { input: ops, result: out.filter(o => o.name === 'sum').map(o => o.returned), ops: out, frames }
}

export const code = `create an empty map of key values and an empty list of answers
for each operation in order
  if it is an insert, store its value under its key, replacing any old value
  if it is a sum query, add the values of all stored keys that start with the prefix and record that total
return the recorded totals`.split('\n').map((text, index) => ({ line: index + 1, text }))

// Family line 3 follows a sum query's prefix (line 4 here); family line 4 stores insert deltas (line 3 here).
export const LINE_MAP = { 1: 1, 3: 4, 4: 3, 5: 5 }

export const python = `def map_sum_pairs(operations):
    values = {}
    answers = []
    for op in operations:
        if op[0] == 'insert':
            values[op[1]] = op[2]
        else:
            prefix = op[1]
            answers.append(sum(v for key, v in values.items() if key.startswith(prefix)))
    return answers`
