export function parseInput(text) {
  const n = JSON.parse(text)
  if (!Number.isInteger(n) || n < 0 || n > 10000) throw new Error('Enter an integer n from 0 to 10,000 (millilitres).')
  return n
}

const JS_LINES = [
  'function soupServings(n) {',
  '  const units = Math.ceil(n / 25) // soup comes in 25 ml units',
  '  if (units >= 200) return 1 // with this much soup, the chance of A emptying first is essentially 1',
  '  const memo = new Map()',
  '  const prob = (a, b) => {',
  '    if (a <= 0 && b <= 0) return 0.5 // both run out together',
  '    if (a <= 0) return 1 // A runs out first',
  '    if (b <= 0) return 0',
  '    const key = a * 1000 + b',
  '    if (memo.has(key)) return memo.get(key)',
  '    const value = 0.25 * (prob(a - 4, b) + prob(a - 3, b - 1) + prob(a - 2, b - 2) + prob(a - 1, b - 3))',
  '    memo.set(key, value)',
  '    return value',
  '  }',
  '  return prob(units, units) // equal starting amounts',
  '}',
]
const PY_LINES = [
  'def soup_servings(n):',
  '    units = (n + 24) // 25',
  '    if units >= 200:',
  '        return 1.0',
  '    memo = {}',
  '    def prob(a, b):',
  '        if a <= 0 and b <= 0:',
  '            return 0.5',
  '        if a <= 0:',
  '            return 1.0',
  '        if b <= 0:',
  '            return 0.0',
  '        if (a, b) not in memo:',
  '            memo[(a, b)] = 0.25 * (prob(a - 4, b) + prob(a - 3, b - 1) + prob(a - 2, b - 2) + prob(a - 1, b - 3))',
  '        return memo[(a, b)]',
  '    return prob(units, units)',
]
const L = s => JS_LINES.findIndex(t => t.includes(s)) + 1
const P = s => PY_LINES.findIndex(t => t.includes(s)) + 1

export const code = JS_LINES.map((text, index) => ({ line: index + 1, text }))
export const python = PY_LINES.join('\n')

// Each turn removes one of four portions (100, 75, 50 or 25 ml from A and the rest from B), each with probability 1/4.
// Every state is (A units, B units). The answer is the chance A empties first, counting a tie as one half.
export function buildTrace(n) {
  const units = Math.ceil(n / 25)
  const frames = [{ phase: 'start', a: units, b: units, rows: [], result: null, activeLine: L('const units'), pythonLine: P('units = (n + 24)'), message: `${n} ml is ${units} units of 25 ml each.` }]
  if (units >= 200) {
    frames.push({ phase: 'done', a: units, b: units, rows: [], result: 1, activeLine: L('return 1 //'), pythonLine: P('return 1.0'), message: 'With this much soup, A almost surely empties first, so the answer is 1.' })
    return { input: n, result: 1, frames }
  }
  const memo = new Map()
  const rows = []
  const prob = (a, b) => {
    if (a <= 0 && b <= 0) return 0.5
    if (a <= 0) return 1
    if (b <= 0) return 0
    const key = a * 1000 + b
    if (memo.has(key)) return memo.get(key)
    const value = 0.25 * (prob(a - 4, b) + prob(a - 3, b - 1) + prob(a - 2, b - 2) + prob(a - 1, b - 3))
    memo.set(key, value)
    rows.push({ a, b, p: Number(value.toFixed(5)) })
    return value
  }
  const result = prob(units, units)
  frames.push({ phase: 'done', a: units, b: units, rows: rows.map(r => ({ ...r })), result, activeLine: L('return prob(units, units)'), pythonLine: P('return prob(units, units)'), message: `Chance that A empties first (ties count half): ${result.toFixed(5)}.` })
  return { input: n, result, frames }
}
