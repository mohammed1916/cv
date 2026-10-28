const MAX_LENGTH = 10

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > MAX_LENGTH || nums.some(v => !Number.isInteger(v) || v < -10 || v > 10)) throw new Error(`Use 1 to ${MAX_LENGTH} integers from -10 to 10.`)
  return nums
}

export const code = `maximum total cost after splitting nums into contiguous pieces
  set best[0] to 0 for the empty prefix
  for each end e from 1 to n
    set best[e] to negative infinity
    for each start s from 0 to e minus 1
      set cost to the alternating sum of nums from s to e minus 1, starting with plus
      set best[e] to the larger of best[e] and best[s] plus cost
  return best[n]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

// The cost of nums[s..e-1] alternates in sign starting with plus at s.
const alternating = (nums, s, e) => {
  let cost = 0
  for (let i = s; i < e; i++) cost += (i - s) % 2 === 0 ? nums[i] : -nums[i]
  return cost
}

export function buildTrace(nums) {
  const n = nums.length
  const best = [0]
  const frames = [{ phase: 'start', end: 0, start: null, best: [...best], activeLine: L('set best[0] to 0'), message: 'The empty prefix costs 0.' }]
  for (let e = 1; e <= n; e++) {
    best[e] = -Infinity
    for (let s = 0; s < e; s++) {
      const cost = alternating(nums, s, e)
      if (best[s] + cost > best[e]) best[e] = best[s] + cost
      frames.push({ phase: 'piece', end: e, start: s, best: [...best], cost, activeLine: L('set best[e] to the larger'), message: `Piece ${s} to ${e - 1} costs ${cost}; best[${e}] is now ${best[e]}.` })
    }
  }
  frames.push({ phase: 'done', end: n, start: null, best: [...best], activeLine: L('return best[n]'), message: `Maximum total cost: ${best[n]}.` })
  return { input: nums, result: best[n], frames }
}

export const python = `def maximize_total_cost(nums):
    n = len(nums)
    best = [0] + [float('-inf')] * n
    for e in range(1, n + 1):
        for s in range(e):
            cost = 0
            for i in range(s, e):
                cost += nums[i] if (i - s) % 2 == 0 else -nums[i]
            best[e] = max(best[e], best[s] + cost)
    return best[n]
`
