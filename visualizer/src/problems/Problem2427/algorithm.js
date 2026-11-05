const MAX_VALUE = 60

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Number.isInteger(data.a) || !Number.isInteger(data.b)) throw new Error('Use an object like {"a":12,"b":6}.')
  if (data.a < 1 || data.b < 1 || data.a > MAX_VALUE || data.b > MAX_VALUE) throw new Error(`a and b are integers from 1 to ${MAX_VALUE}.`)
  return { a: data.a, b: data.b }
}

export function buildTrace({ a, b }) {
  const limit = Math.min(a, b)
  const factors = []
  let count = 0
  const frames = [{ phase: 'start', pythonLine: 2, activeLine: L('let count = 0'), x: 0, factors: [], count: 0, message: `Candidates run from 1 to ${limit}.` }]
  for (let x = 1; x <= limit; x++) {
    const common = a % x === 0 && b % x === 0
    if (common) { count++; factors.push(x) }
    frames.push({ phase: 'scan', pythonLine: common ? 5 : 4, activeLine: L('if (a % x === 0'), x, factors: [...factors], count, message: common ? `${x} divides both. Count: ${count}.` : `${x} does not divide both.` })
  }
  frames.push({ phase: 'done', pythonLine: 6, activeLine: L('return count'), x: limit, factors: [...factors], count, message: `${count} common factors.` })
  return { input: { a, b }, result: count, limit, frames }
}

export const code = `function countCommonFactors(a, b) {
  let count = 0
  for (let x = 1; x <= Math.min(a, b); x++) {
    if (a % x === 0 && b % x === 0) count++
  }
  return count
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export const python = `def count_common_factors(a, b):
    count = 0
    for x in range(1, min(a, b) + 1):
        if a % x == 0 and b % x == 0:
            count += 1
    return count
`
