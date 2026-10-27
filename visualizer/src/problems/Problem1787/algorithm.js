export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.nums) || !Number.isInteger(data.k)) throw new Error('Use an object such as {"nums":[1,2,0,3,0],"k":1}.')
  const { nums, k } = data
  if (nums.length < 1 || nums.length > 12) throw new Error('nums has 1 to 12 entries.')
  if (!nums.every(v => Number.isInteger(v) && v >= 0 && v <= 7)) throw new Error('Visualized values are integers from 0 to 7.')
  if (k < 1 || k > nums.length) throw new Error('k is an integer from 1 to the length of nums.')
  return { nums, k }
}

export function buildTrace({ nums, k }) {
  // Values below 8 use a domain of 8 xor states, which is enough to cover every value the DP needs.
  const domain = 1 << Math.max(3, Math.max(...nums).toString(2).length)
  let best = Array(domain).fill(Infinity)
  best[0] = 0
  const frames = [{ phase: 'start', activeLine: L('set cost of xor 0 to 0'), group: -1, best: best.slice(), message: `Index classes modulo ${k} must each share one value, and those values must xor to 0.` }]
  for (let r = 0; r < k; r++) {
    const group = nums.filter((_, i) => i % k === r)
    const counts = Array(domain).fill(0)
    group.forEach(v => { counts[v]++ })
    const next = Array(domain).fill(Infinity)
    for (let x = 0; x < domain; x++) {
      if (best[x] === Infinity) continue
      for (let p = 0; p < domain; p++) {
        const cost = best[x] + group.length - counts[p]
        if (cost < next[x ^ p]) next[x ^ p] = cost
      }
    }
    best = next
    frames.push({ phase: 'group', activeLine: L('for each group'), group: r, best: best.slice(), message: `Class ${r} (indices congruent to ${r} mod ${k}) is folded in. The cheapest way to reach xor 0 so far costs ${best[0]}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return the cost of xor 0'), group: -1, best: best.slice(), message: `Minimum changes: ${best[0]}.` })
  return { input: { nums, k }, result: best[0], frames }
}

export const code = `minimum changes so every segment xors to zero:
  split the indices into k classes by index modulo k
  set cost of xor 0 to 0 and every other xor to infinity
  for each group r from 0 to k minus 1:
    count how often each value appears in group r
    set next costs to infinity
    for each xor state x with a finite cost:
      for each value p in the domain:
        cost is the current cost plus group size minus the count of p
        update next[x xor p] to the smaller cost
    replace the costs with next
  return the cost of xor 0`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_changes_zero_segments(nums, k):
    domain = 1 << max(3, max(nums).bit_length())
    best = [float('inf')] * domain
    best[0] = 0
    for r in range(k):
        group = nums[r::k]
        counts = [0] * domain
        for v in group:
            counts[v] += 1
        nxt = [float('inf')] * domain
        for x in range(domain):
            if best[x] == float('inf'):
                continue
            for p in range(domain):
                cost = best[x] + len(group) - counts[p]
                if cost < nxt[x ^ p]:
                    nxt[x ^ p] = cost
        best = nxt
    return best[0]
`
