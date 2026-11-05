const MAX_NUMS = 8

export function parseInput(text) {
  const data = JSON.parse(text)
  const { nums, k } = data ?? {}
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > MAX_NUMS) throw new Error(`nums must list 1 to ${MAX_NUMS} values.`)
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 16)) throw new Error('Values are integers from 1 to 16.')
  if (!Number.isInteger(k) || k < 1 || k > nums.length || nums.length % k !== 0) throw new Error('k must divide the length of nums.')
  return { nums, k }
}

export const code = `function minimumIncompatibility(nums, k) {
  const n = nums.length
  const size = n / k
  const full = (1 << n) - 1
  const popcount = m => [...m.toString(2)].filter(c => c === '1').length
  const cost = new Map()
  for (let mask = 1; mask <= full; mask++) {
    const values = nums.filter((_, i) => mask & (1 << i))
    if (values.length === size && new Set(values).size === size) {
      cost.set(mask, Math.max(...values) - Math.min(...values))
    }
  }
  const best = Array(full + 1).fill(Infinity)
  best[0] = 0
  for (let mask = 1; mask <= full; mask++) {
    if (popcount(mask) % size !== 0) continue
    const low = mask & -mask
    for (let sub = mask; sub > 0; sub = (sub - 1) & mask) {
      if (sub & low && cost.has(sub) && best[mask ^ sub] !== Infinity) {
        best[mask] = Math.min(best[mask], best[mask ^ sub] + cost.get(sub))
      }
    }
  }
  return best[full] === Infinity ? -1 : best[full]
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

const bitCount = m => { let c = 0; for (let x = m; x; x &= x - 1) c++; return c }

// Each full set of elements is a bitmask. The lowest element must belong to some group, so every mask is split by the group that holds it.
export function buildTrace({ nums, k }) {
  const n = nums.length
  const size = n / k
  const full = (1 << n) - 1
  const INF = Infinity
  const cost = new Map()
  for (let mask = 1; mask <= full; mask++) {
    if (bitCount(mask) !== size) continue
    const values = nums.filter((_, i) => mask & (1 << i))
    if (new Set(values).size === size) cost.set(mask, Math.max(...values) - Math.min(...values))
  }
  const best = Array(full + 1).fill(INF)
  const pick = Array(full + 1).fill(0)
  best[0] = 0
  const frames = [{ phase: 'start', pythonLine: 3, mask: 0, group: 0, value: 0, activeLine: L('const size = n / k'), message: `Each of the ${k} groups holds ${size} values, and the values in a group must all be different.` }]
  for (let mask = 1; mask <= full; mask++) {
    if (bitCount(mask) % size !== 0) continue
    const low = mask & -mask
    for (let sub = mask; sub; sub = (sub - 1) & mask) {
      if (!(sub & low) || !cost.has(sub) || best[mask ^ sub] === INF) continue
      const candidate = best[mask ^ sub] + cost.get(sub)
      if (candidate < best[mask]) { best[mask] = candidate; pick[mask] = sub }
    }
    frames.push({ phase: 'mask', pythonLine: 20, mask, group: best[mask] === INF ? 0 : pick[mask], value: best[mask], activeLine: L('best[mask] = Math.min'), message: best[mask] === INF ? `Elements ${bits(mask)} cannot be split into valid groups.` : `Elements ${bits(mask)}: the best split keeps a group ${bits(pick[mask])} at total ${best[mask]}.` })
  }
  const result = best[full] === INF ? -1 : best[full]
  frames.push({ phase: 'done', pythonLine: 22, mask: full, group: 0, value: result, activeLine: L('return best[full]'), result, message: result === -1 ? 'No split into equal groups with distinct values exists.' : `Minimum total incompatibility: ${result}.` })
  return { input: { nums, k }, result, frames }
  function bits(mask) { return nums.map((_, i) => i).filter(i => mask & (1 << i)).map(i => nums[i]).join(', ') || 'none' }
}

export const python = `def minimum_incompatibility(nums, k):
    n = len(nums)
    size = n // k
    full = (1 << n) - 1
    INF = float('inf')
    cost = {}
    for mask in range(1, full + 1):
        values = [nums[i] for i in range(n) if mask >> i & 1]
        if len(values) == size and len(set(values)) == size:
            cost[mask] = max(values) - min(values)
    best = [INF] * (full + 1)
    best[0] = 0
    for mask in range(1, full + 1):
        if bin(mask).count('1') % size != 0:
            continue
        low = mask & -mask
        sub = mask
        while sub > 0:
            if sub & low and sub in cost and best[mask ^ sub] < INF:
                best[mask] = min(best[mask], best[mask ^ sub] + cost[sub])
            sub = (sub - 1) & mask
    return best[full] if best[full] < INF else -1
`
