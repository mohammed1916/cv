export const phases = [
  { id: 'start', label: 'Values', description: 'Sort a copy to see where each value must end up.' },
  { id: 'factor', label: 'Link primes', description: 'Values sharing a prime factor are linked into one group, so they can be swapped with each other.' },
  { id: 'check', label: 'Compare positions', description: 'For each index the sorted value must come from the same group as the original value there.' },
  { id: 'done', label: 'Result', description: 'If every position matches a group, the array can be sorted.' },
]

export const code = `function primeFactors(x) {
  const factors = []
  for (let p = 2; p * p <= x; p++) {
    if (x % p === 0) {
      factors.push(p)
      while (x % p === 0) x /= p
    }
  }
  if (x > 1) factors.push(x)
  return factors
}

function canSortByGcdSwaps(nums) {
  const parent = new Map()
  const find = p => (parent.get(p) === p ? p : find(parent.get(p)))
  for (const x of nums) {
    const factors = primeFactors(x)
    for (const p of factors) if (!parent.has(p)) parent.set(p, p)
    for (let i = 1; i < factors.length; i++) parent.set(find(factors[0]), find(factors[i]))
  }
  const root = x => {
    const factors = primeFactors(x)
    return factors.length ? find(factors[0]) : null
  }
  const sorted = [...nums].sort((a, b) => a - b)
  return nums.every((value, i) => value === sorted[i] || (root(value) !== null && root(value) === root(sorted[i])))
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def prime_factors(x):
    factors = []
    p = 2
    while p * p <= x:
        if x % p == 0:
            factors.append(p)
            while x % p == 0:
                x //= p
        p += 1
    if x > 1:
        factors.append(x)
    return factors

def can_sort_by_gcd_swaps(nums):
    parent = {}
    def find(p):
        return p if parent[p] == p else find(parent[p])
    for x in nums:
        factors = prime_factors(x)
        for p in factors:
            if p not in parent:
                parent[p] = p
        for i in range(1, len(factors)):
            parent[find(factors[0])] = find(factors[i])
    def root(x):
        factors = prime_factors(x)
        return find(factors[0]) if factors else None
    ordered = sorted(nums)
    return all(value == ordered[i] or (root(value) is not None and root(value) == root(ordered[i]))
               for i, value in enumerate(nums))
`

const C = fragment => code.findIndex(c => c.text.includes(fragment)) + 1
const P = fragment => python.split('\n').findIndex(line => line.includes(fragment)) + 1

export function primeFactors(x) {
  const factors = []
  for (let p = 2; p * p <= x; p++) {
    if (x % p === 0) {
      factors.push(p)
      while (x % p === 0) x /= p
    }
  }
  if (x > 1) factors.push(x)
  return factors
}

export function parseInput(text) {
  let nums
  try { nums = JSON.parse(text) } catch { throw new Error('Use a JSON array such as [7,21,3].') }
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('nums must have 1 to 12 values here.')
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= 1000)) throw new Error('Each value must be a whole number from 1 to 1000.')
  return nums
}

export function buildTrace(nums) {
  const frames = []
  const parent = new Map()
  const find = p => (parent.get(p) === p ? p : find(parent.get(p)))
  const add = (phase, c, p, message, index) => frames.push({
    phase, activeLine: C(c), pythonLine: P(p), message,
    snapshot: { nums, sorted, index, groups: groupsOf(), parent: null },
  })
  const groupsOf = () => {
    const groups = new Map()
    for (const x of nums) {
      const f = primeFactors(x)
      if (!f.length) continue
      const r = find(f[0])
      if (!groups.has(r)) groups.set(r, [])
      if (!groups.get(r).includes(x)) groups.get(r).push(x)
    }
    return [...groups.values()]
  }
  const sorted = [...nums].sort((a, b) => a - b)
  add('start', 'const sorted', 'ordered = sorted', `Sorted target: ${sorted.join(', ')}.`, -1)
  for (const x of nums) {
    const factors = primeFactors(x)
    for (const p of factors) if (!parent.has(p)) parent.set(p, p)
    for (let i = 1; i < factors.length; i++) parent.set(find(factors[0]), find(factors[i]))
  }
  add('factor', 'for (const p of factors)', 'for p in factors', 'Values with a shared prime are now in one group.', -1)
  const root = x => {
    const f = primeFactors(x)
    return f.length ? find(f[0]) : null
  }
  let ok = true
  for (let i = 0; i < nums.length; i++) {
    const same = nums[i] === sorted[i] || (root(nums[i]) !== null && root(nums[i]) === root(sorted[i]))
    add('check', 'return nums.every', 'return all(', same ? `Position ${i}: ${nums[i]} and the target ${sorted[i]} share a group or match.` : `Position ${i}: ${nums[i]} cannot be swapped with ${sorted[i]}.`, i)
    if (!same) { ok = false; break }
  }
  add('done', 'return nums.every', 'return all(', ok ? 'Every position can be filled, so the array can be sorted.' : 'Some position cannot be filled, so sorting is impossible.', -1)
  return { input: nums, result: ok, frames }
}
