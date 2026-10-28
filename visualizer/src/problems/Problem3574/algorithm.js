export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with nums and k, for example {"nums":[3,5,7],"k":2}.')
  const { nums, k } = data
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 8) throw new Error('nums must have 1 to 8 entries.')
  if (nums.some(x => !Number.isInteger(x) || x < 1 || x > 60)) throw new Error('Each value is an integer from 1 to 60.')
  if (!Number.isInteger(k) || k < 1 || k > nums.length) throw new Error('k must be an integer from 1 to the length of nums.')
  return { nums: [...nums], k }
}

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b))

export function buildTrace(input) {
  const { nums, k } = input
  const n = nums.length
  let best = 0
  let bestRange = null
  const frames = [{ phase: 'start', activeLine: L('set best to 0'), range: null, best: 0, message: 'Try every subarray. For each start, keep the (doublings used, gcd) pairs reachable so far.' }]
  for (let l = 0; l < n; l++) {
    let states = new Set()
    const seenStart = new Map()
    for (let r = l; r < n; r++) {
      const x = nums[r]
      const next = new Set()
      const pool = states.size ? states : new Set(['0,0'])
      for (const s of pool) {
        const [c, g] = s.split(',').map(Number)
        next.add(`${c},${gcd(g, x)}`)
        if (c < k) next.add(`${c + 1},${gcd(g, 2 * x)}`)
      }
      states = next
      for (const s of states) {
        const g = Number(s.split(',')[1])
        const score = (r - l + 1) * g
        if (score > best) { best = score; bestRange = [l, r] }
      }
      seenStart.set(r, states.size)
    }
    frames.push({ phase: 'start-index', activeLine: L('for each start l'), range: [l, n - 1], best, message: `Subarrays starting at ${l} are checked. Best score so far: ${best}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return best'), range: bestRange, best, message: `The maximum score is ${best}.` })
  return { input, result: best, frames }
}

export const code = `maximum subarray gcd score (nums, k)
  set best to 0
  for each start l
    set states to the single pair (0 doublings, gcd 0)
    for each end r from l to the last index
      set next to an empty set of pairs
      for each (c, g) in states, or (0, 0) for a new start
        add (c, gcd of g and nums[r])
        if c is less than k then add (c + 1, gcd of g and twice nums[r])
      set states to next
      for each (c, g) in states
        keep the length times g in best if it is larger
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from math import gcd

def maximum_gcd_score(nums, k):
    n = len(nums)
    best = 0
    for l in range(n):
        states = {(0, 0)}
        for r in range(l, n):
            x = nums[r]
            nxt = set()
            for c, g in states:
                nxt.add((c, gcd(g, x)))
                if c < k:
                    nxt.add((c + 1, gcd(g, 2 * x)))
            states = nxt
            for c, g in states:
                best = max(best, (r - l + 1) * g)
    return best
`
