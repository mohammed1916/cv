export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.nums) || !Number.isInteger(input.k) || !Number.isInteger(input.m)) throw new Error('Use a JSON object with a nums array and integers k and m.')
  const n = input.nums.length
  if (n < 1 || n > 5) throw new Error('nums needs 1 to 5 values (visualization cap).')
  if (input.nums.some(v => !Number.isInteger(v) || v < 1 || v > 15)) throw new Error('nums values are integers from 1 to 15.')
  if (input.k < 1 || input.k > 30) throw new Error('k must be an integer from 1 to 30 (visualization cap).')
  if (input.m < 1 || input.m > n) throw new Error('m must be an integer from 1 to n.')
  return input
}

// Smallest value at least x that contains every bit of a.
const minSuperset = (x, a) => {
  if ((x & a) === a) return x
  for (let p = 0; p < 30; p++) {
    if ((x >> p) & 1) continue
    const high = ~((1 << (p + 1)) - 1)
    if ((a & high & ~x) !== 0) continue
    return (x & high) | (1 << p) | (a & ((1 << p) - 1))
  }
  return Infinity
}

export function buildTrace(input) {
  const { nums, k, m } = input
  let answer = 0
  const frames = [{ phase: 'start', activeLine: L('answer = 0'), bit: -1, candidate: 0, costs: [], ok: null, answer, message: 'Build the answer one bit at a time, from the highest bit down.' }]
  for (let b = 6; b >= 0; b--) {
    const candidate = answer | (1 << b)
    const costs = nums.map(x => minSuperset(x, candidate) - x)
    const sorted = [...costs].sort((x, y) => x - y)
    const total = sorted.slice(0, m).reduce((s, c) => s + c, 0)
    const ok = total <= k
    if (ok) answer = candidate
    frames.push({ phase: 'try', activeLine: L('if the m smallest costs'), bit: b, candidate, costs, ok, answer, message: ok ? `Bit ${b} fits: the ${m} cheapest raises cost ${total} <= ${k}. Answer so far: ${answer}.` : `Bit ${b} does not fit: the ${m} cheapest raises cost ${total} > ${k}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return answer'), bit: -1, candidate: answer, costs: [], ok: null, answer, message: `Maximum AND: ${answer}.` })
  return { input, result: answer, frames }
}

export const code = `maximum bitwise and after increments (nums, k, m):
  answer = 0
  for each bit b from the highest down to 0
    candidate = answer with bit b set
    cost of each number = smallest value at least it that contains every bit of candidate, minus the number
    if the m smallest costs add up to at most k then set answer to candidate
  return answer`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def maximum_bitwise_and_after_increment_operations(nums, k, m):
    def min_superset(x, a):
        if (x & a) == a:
            return x
        for p in range(62):
            if (x >> p) & 1:
                continue
            high = ~((1 << (p + 1)) - 1)
            if (a & high & ~x) != 0:
                continue
            return (x & high) | (1 << p) | (a & ((1 << p) - 1))
        return None

    answer = 0
    for b in range(40, -1, -1):
        candidate = answer | (1 << b)
        costs = sorted(min_superset(x, candidate) - x for x in nums)
        if sum(costs[:m]) <= k:
            answer = candidate
    return answer
`
