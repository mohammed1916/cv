export function parseInput(text) {
  const ops = JSON.parse(text)
  const word = s => typeof s === 'string' && /^[a-z]{1,50}$/.test(s)
  if (!Array.isArray(ops) || ops.length < 1 || ops.length > 50) throw new Error('Enter 1–50 operations.')
  for (const op of ops) {
    if (!Array.isArray(op)) throw new Error('Each operation is ["insert", word, value] or ["sum", prefix].')
    if (op[0] === 'insert' && (op.length !== 3 || !word(op[1]) || !Number.isInteger(op[2]) || op[2] < 1 || op[2] > 1000)) throw new Error('insert needs a lowercase word and an integer value from 1 to 1,000.')
    else if (op[0] === 'sum' && (op.length !== 2 || !word(op[1]))) throw new Error('sum needs a lowercase prefix.')
    else if (op[0] !== 'insert' && op[0] !== 'sum') throw new Error('Operations are "insert" or "sum".')
  }
  return ops
}

// Keep the latest value of every key. A prefix sum scans the stored keys and adds the values that start with it.
export function buildTrace(ops) {
  const map = new Map()
  const out = []
  const frames = [{ phase: 'start', op: null, entries: [], matches: [], total: null, outputs: [], activeLine: L('const map = new Map()'), pythonLine: P('table = {}'), message: 'Start with an empty map of word values.' }]
  for (const op of ops) {
    if (op[0] === 'insert') {
      map.set(op[1], op[2])
      frames.push({ phase: 'insert', op, entries: [...map], matches: [], total: null, outputs: [...out], activeLine: L('map.set(op[1], op[2])'), pythonLine: P('table[op[1]] = op[2]'), message: `insert ${op[1]} = ${op[2]}: a repeated word replaces its old value.` })
    } else {
      const matches = [...map].filter(([key]) => key.startsWith(op[1]))
      const total = matches.reduce((sum, [, value]) => sum + value, 0)
      out.push(total)
      frames.push({ phase: 'sum', op, entries: [...map], matches, total, outputs: [...out], activeLine: L('key.startsWith(op[1])'), pythonLine: P('if key.startswith'), message: `sum ${op[1]}: ${matches.length ? matches.map(([k, v]) => `${k}=${v}`).join(' + ') : 'no words'} = ${total}.` })
    }
  }
  frames.push({ phase: 'done', op: null, entries: [...map], matches: [], total: null, outputs: [...out], result: out, activeLine: L('return out'), pythonLine: P('return results'), message: `Sums in order: [${out.join(', ')}].` })
  return { input: ops, result: out, frames }
}

const SOURCE = `function mapSumPairs(ops) {
  const map = new Map()
  const out = []
  for (const op of ops) {
    if (op[0] === 'insert') {
      map.set(op[1], op[2])
    } else {
      let total = 0
      for (const [key, value] of map) {
        if (key.startsWith(op[1])) total += value
      }
      out.push(total)
    }
  }
  return out
}`
export const code = SOURCE.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def map_sum_pairs(ops):
    table = {}
    results = []
    for op in ops:
        if op[0] == 'insert':
            table[op[1]] = op[2]
        else:
            total = 0
            for key, value in table.items():
                if key.startswith(op[1]):
                    total += value
            results.append(total)
    return results`
const P = s => python.split('\n').findIndex(t => t.includes(s)) + 1
