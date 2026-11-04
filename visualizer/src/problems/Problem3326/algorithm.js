export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums.')
  const { nums } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('nums has 1 to 12 integers.')
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= 1000000)) throw new Error('Each value is a whole number from 1 to 1000000.')
  return { nums }
}

// Smallest prime factor by trial division. Dividing x by its greatest proper divisor gives x / (x / spf) = spf.
export function smallestPrimeFactor(x) {
  if (x < 2) return x
  for (let d = 2; d * d <= x; d++) if (x % d === 0) return d
  return x
}

// Work from the right. Each element can only move down its chain x -> spf(x) -> ...
// Keep the largest chain value that does not exceed the already fixed right neighbour.
export function buildTrace({ nums }) {
  const cur = [...nums]
  const frames = []
  let ops = 0
  let impossible = false
  frames.push({ pythonLine: PL('for i in range'), phase: 'scan', activeLine: L('for (let i = cur.length - 2'), index: null, value: null, next: null, chain: [], ops, message: `Start from the right with ${cur.join(', ')}.` })
  for (let i = cur.length - 2; i >= 0 && !impossible; i--) {
    if (cur[i] <= cur[i + 1]) {
      frames.push({ pythonLine: PL('if nums[i] <= nums[i + 1]'), phase: 'keep', activeLine: L('if (cur[i] <= cur[i + 1]) continue'), index: i, value: cur[i], next: cur[i + 1], chain: [cur[i]], ops, message: `${cur[i]} is already at most ${cur[i + 1]}.` })
      continue
    }
    const chain = [cur[i]]
    let value = cur[i]
    while (value > cur[i + 1]) {
      const p = smallestPrimeFactor(value)
      if (p === value) {
        impossible = true
        frames.push({ pythonLine: PL('return -1'), phase: 'stuck', activeLine: L('return -1'), index: i, value, next: cur[i + 1], chain, ops, message: `${value} is prime, so it cannot drop below ${cur[i + 1]}.` })
        break
      }
      value = p
      chain.push(value)
      ops += 1
      frames.push({ pythonLine: PL('value = p'), phase: 'divide', activeLine: L('value = p;'), index: i, value, next: cur[i + 1], chain: [...chain], ops, message: `Divide to reach ${value}; ${ops} operation${ops === 1 ? '' : 's'} so far.` })
    }
    if (!impossible) cur[i] = value
  }
  const result = impossible ? -1 : ops
  frames.push({ pythonLine: PL('return ops;'), phase: 'done', activeLine: L('return ops;'), index: null, value: null, next: null, chain: [], ops: result, message: impossible ? 'No sequence of operations makes the array non-decreasing.' : `Minimum operations: ${result}. Final array: ${cur.join(', ')}.` })
  return { input: { nums }, result, final: cur, frames }
}

// Code panel: real JavaScript. Python below mirrors it line for line.
export const code = [
  "function minDivisionOperations(nums) {",
  "  const cur = [...nums];",
  "  let ops = 0;",
  "  for (let i = cur.length - 2; i >= 0; i--) {",
  "    if (cur[i] <= cur[i + 1]) continue;",
  "    let value = cur[i];",
  "    while (value > cur[i + 1]) {",
  "      const p = smallestPrimeFactor(value);",
  "      if (p === value) return -1;",
  "      value = p;",
  "      ops += 1;",
  "    }",
  "    cur[i] = value;",
  "  }",
  "  return ops;",
  "}",
  "function smallestPrimeFactor(x) {",
  "  for (let d = 2; d * d <= x; d++) if (x % d === 0) return d;",
  "  return x;",
  "}",
].map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const PY = s => python.split('\n').findIndex(line => line.includes(s)) + 1

export const python = `def min_division_operations(nums):
    def spf(x):
        d = 2
        while d * d <= x:
            if x % d == 0:
                return d
            d += 1
        return x
    ops = 0
    for i in range(len(nums) - 2, -1, -1):
        if nums[i] <= nums[i + 1]:
            continue
        value = nums[i]
        while value > nums[i + 1]:
            p = spf(value)
            if p == value:
                return -1
            value = p
            ops += 1
        nums[i] = value
    return ops`
const PL = s => python.split('\n').findIndex(line => line.includes(s)) + 1
