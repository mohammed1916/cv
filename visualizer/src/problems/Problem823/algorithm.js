export function parseInput(text) {
  const data = JSON.parse(text)
  const arr = data?.arr
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > 200 || arr.some(v => !Number.isInteger(v) || v < 2 || v > 1000000000)) throw new Error('arr must be 1–200 integers from 2 to 1,000,000,000.')
  if (new Set(arr).size !== arr.length) throw new Error('Values in arr are distinct.')
  return { arr }
}

const MOD = 1000000007n
const JS_LINES = [
  'function numFactoredBinaryTrees(arr) {',
  '  const sorted = [...arr].sort((a, b) => a - b) // a factor is always smaller than its product',
  '  const count = new Map() // count.get(x) = trees whose root is x',
  '  for (const x of sorted) {',
  '    let total = 1n // a leaf alone',
  '    for (const a of sorted) {',
  '      if (a >= x) break',
  '      if (x % a === 0 && count.has(x / a)) total += count.get(a) * count.get(x / a) // a is the left child, x / a the right',
  '    }',
  '    count.set(x, total % MOD)',
  '  }',
  '  let answer = 0n',
  '  for (const v of count.values()) answer = (answer + v) % MOD',
  '  return Number(answer) // return the total over all roots',
  '}',
]
const PY_LINES = [
  'def num_factored_binary_trees(arr):',
  '    MOD = 10**9 + 7',
  '    arr = sorted(arr)',
  '    count = {}',
  '    for x in arr:',
  '        total = 1',
  '        for a in arr:',
  '            if a >= x:',
  '                break',
  '            if x % a == 0 and x // a in count:',
  '                total += count[a] * count[x // a]',
  '        count[x] = total % MOD',
  '    return sum(count.values()) % MOD',
]
const L = s => JS_LINES.findIndex(t => t.includes(s)) + 1
const P = s => PY_LINES.findIndex(t => t.includes(s)) + 1

export const code = JS_LINES.map((text, index) => ({ line: index + 1, text }))
export const python = PY_LINES.join('\n')

// Each root x has 1 leaf-only tree plus, for every factor a with x / a also present, count(a) * count(x / a) trees.
export function buildTrace({ arr }) {
  const sorted = [...arr].sort((a, b) => a - b)
  const count = new Map()
  const rows = []
  const frames = [{ phase: 'start', x: null, pairs: [], rows: [], activeLine: L('const sorted'), pythonLine: P('arr = sorted'), message: 'Sorted values: each root is built from smaller factors.' }]
  for (const x of sorted) {
    let total = 1n
    const pairs = []
    for (const a of sorted) {
      if (a >= x) break
      if (x % a === 0 && count.has(x / a)) {
        const add = count.get(a) * count.get(x / a)
        total += add
        pairs.push([a, x / a])
      }
    }
    count.set(x, total % MOD)
    rows.push({ value: x, pairs: pairs.map(([l, r]) => `${l}·${r}`).join(' ') || '–', trees: Number(total % MOD) })
    frames.push({ phase: pairs.length ? 'pairs' : 'leaf', x, pairs, rows: rows.map(r => ({ ...r })), activeLine: L('total += count.get(a)'), pythonLine: P('total += count[a]'),
      message: pairs.length ? `${x}: factor pairs ${pairs.map(([l, r]) => `${l}×${r}`).join(', ')} add ${total - 1n} trees on top of the single leaf.` : `${x} has no factor pair in the list, so it is a single leaf.` })
  }
  const result = Number([...count.values()].reduce((s, v) => (s + v) % MOD, 0n))
  frames.push({ phase: 'done', x: null, pairs: [], rows: rows.map(r => ({ ...r })), result, activeLine: L('return Number(answer)'), pythonLine: P('return sum'), message: `${result} trees in total.` })
  return { input: { arr }, result, frames }
}
