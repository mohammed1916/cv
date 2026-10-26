export function parseInput(text) {
  const n = JSON.parse(text)
  if (!Number.isInteger(n) || n < 1 || n > 1000) throw new Error('Enter an integer n from 1 to 1,000.')
  return n
}

// Each prime factor p of n costs p operations: copy all, then paste (p − 1) times.
export function buildTrace(n) {
  let value = 1
  const operations = []
  const frames = [{ phase: 'start', value, n, ops: 0, factor: null, activeLine: 2, message: `Start with one 'A' and reach ${n}.` }]
  let remaining = n
  for (let p = 2; remaining > 1; p++) {
    while (remaining % p === 0) {
      remaining /= p
      operations.push(p)
      value *= p
      frames.push({ phase: 'factor', value, n, ops: operations.reduce((a, b) => a + b, 0), factor: p, activeLine: 4,
        message: `Factor ${p}: copy all (1 op) and paste ${p - 1} times (${p - 1} ops). Count is now ${value}.` })
    }
  }
  const result = operations.reduce((a, b) => a + b, 0)
  frames.push({ phase: 'done', value, n, ops: result, factor: null, result, activeLine: 6, message: `Minimum operations: ${result}.` })
  return { input: n, result: n === 1 ? 0 : result, frames }
}

export const code = `def minSteps(n):
    steps, p = 0, 2
    while n > 1:
        while n % p == 0:
            steps += p
            n //= p
        p += 1
    return steps`.split('\n').map((text, index) => ({ line: index + 1, text }))
