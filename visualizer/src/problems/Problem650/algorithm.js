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

export const code = `set remaining to n and operations to 0
for each candidate factor from 2 while factor times factor is at most remaining:
  while remaining is divisible by factor:
    divide remaining by factor and add factor to operations
if remaining is greater than 1, add remaining to operations as its final prime factor
return operations`.split('\n').map((text, index) => ({ line: index + 1, text }))

// Collection trace: codeStage 'factor' is line 4, 'prime' is line 5, and 'return' is line 6.
const STAGE_LINE = { factor: 4, prime: 5, return: 6 }
export const LINE_MAP = { 1: 1, 3: 4, 4: 5, 5: 6 }

export function familyLine(frame) {
  return STAGE_LINE[frame.codeStage] ?? LINE_MAP[frame.activeLine] ?? frame.activeLine
}

export const python = `def min_steps(n):
    remaining = n
    operations = 0
    factor = 2
    while factor * factor <= remaining:
        while remaining % factor == 0:
            remaining //= factor
            operations += factor
        factor += 1
    if remaining > 1:
        operations += remaining
    return operations`
