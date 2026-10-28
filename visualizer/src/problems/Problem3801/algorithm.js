export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.lists)) throw new Error('Use a JSON object with a lists array.')
  const { lists } = input
  if (lists.length < 2 || lists.length > 4) throw new Error('lists needs 2 to 4 sorted lists (visualization cap).')
  let total = 0
  for (const lst of lists) {
    if (!Array.isArray(lst) || lst.length < 1) throw new Error('Each list must be non-empty.')
    if (lst.some(v => !Number.isInteger(v) || v < -20 || v > 20)) throw new Error('Values are integers from -20 to 20.')
    for (let i = 1; i < lst.length; i++) if (lst[i] < lst[i - 1]) throw new Error('Each list must be sorted in non-decreasing order.')
    total += lst.length
  }
  if (total > 12) throw new Error('The total length of all lists is at most 12 (visualization cap).')
  return input
}

const median = vals => vals[(vals.length - 1) >> 1]

export function buildTrace(input) {
  const { lists } = input
  const m = lists.length
  const full = (1 << m) - 1
  const owner = []
  lists.forEach((lst, i) => lst.forEach(() => owner.push(i)))
  const members = mask => {
    const vals = []
    for (let i = 0; i < m; i++) if (mask >> i & 1) vals.push(...lists[i])
    return vals.sort((a, b) => a - b)
  }
  const cost = Array(full + 1).fill(0)
  const frames = [{ phase: 'start', activeLine: L('cost of a single list is 0'), sub: 0, other: 0, mask: 0, candidate: null, message: 'A single list costs nothing. Merge groups of lists in increasing order.' }]
  for (let mask = 1; mask <= full; mask++) {
    if ((mask & (mask - 1)) === 0) continue
    let best = Infinity
    for (let sub = (mask - 1) & mask; sub > 0; sub = (sub - 1) & mask) {
      const other = mask ^ sub
      if (sub < other) continue
      const a = members(sub)
      const b = members(other)
      const candidate = cost[sub] + cost[other] + a.length + b.length + Math.abs(median(a) - median(b))
      if (candidate < best) best = candidate
      frames.push({ phase: 'combine', activeLine: L('candidate = cost(A)'), sub, other, mask, candidate, message: `Merge group ${sub} with group ${other} for a cost of ${candidate}.` })
    }
    cost[mask] = best
  }
  const result = cost[full]
  frames.push({ phase: 'done', activeLine: L('return cost of all lists'), sub: 0, other: 0, mask: full, candidate: result, message: `Minimum total cost: ${result}.` })
  return { input, result, frames, owner, values: owner.map((_, i) => flatten(lists)[i]) }
}

function flatten(lists) {
  const out = []
  for (const lst of lists) out.push(...lst)
  return out
}

export const code = `minimum cost to merge sorted lists (lists):
  cost of a single list is 0
  for each group of lists in increasing mask order
    best = unset
    for each way to split the group into parts A and B
      candidate = cost(A) + cost(B) + len(A) + len(B) + |median(A) - median(B)|
      if best is unset or candidate is less than best then set best to candidate
    cost of the group = best
  return cost of all lists`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimum_cost_to_merge_sorted_lists(lists):
    m = len(lists)
    full = (1 << m) - 1

    def members(mask):
        vals = []
        for i in range(m):
            if (mask >> i) & 1:
                vals.extend(lists[i])
        return sorted(vals)

    def median(vals):
        return vals[(len(vals) - 1) // 2]

    cost = [0] * (full + 1)
    for mask in range(1, full + 1):
        if (mask & (mask - 1)) == 0:
            continue
        best = None
        sub = (mask - 1) & mask
        while sub > 0:
            other = mask ^ sub
            if sub > other:
                a = members(sub)
                b = members(other)
                c = cost[sub] + cost[other] + len(a) + len(b) + abs(median(a) - median(b))
                if best is None or c < best:
                    best = c
            sub = (sub - 1) & mask
        cost[mask] = best
    return cost[full]
`
