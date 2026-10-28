export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.nums) || !Number.isInteger(input.x)) throw new Error('Use {"nums": [...], "x": n}.')
  const { nums, x } = input
  if (nums.length < 2 || nums.length > 8) throw new Error('Use 2 to 8 numbers.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 20)) throw new Error('Numbers are integers from 1 to 20.')
  if (x < 0 || x > nums.length - 1) throw new Error('x is an integer from 0 to the number of entries minus one.')
  return { nums, x }
}

// First index whose value is at least x, in a sorted list.
const lowerBound = (list, v) => {
  let lo = 0
  let hi = list.length
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (list[mid] < v) lo = mid + 1
    else hi = mid
  }
  return lo
}

export function buildTrace({ nums, x }) {
  const seen = []
  let best = null
  const frames = [{ phase: 'start', activeLine: L('start with an empty sorted set'), j: null, best, seen: [], message: `Compare each value with values at least ${x} positions behind it.` }]
  for (let j = x; j < nums.length; j++) {
    const added = nums[j - x]
    seen.splice(lowerBound(seen, added), 0, added)
    const pos = lowerBound(seen, nums[j])
    for (const k of [pos - 1, pos]) {
      if (k >= 0 && k < seen.length) {
        const gap = Math.abs(seen[k] - nums[j])
        if (best === null || gap < best) best = gap
      }
    }
    frames.push({ phase: 'scan', activeLine: L('add the value at index'), j, best, seen: [...seen], message: `Add ${added} (index ${j - x}); check ${nums[j]} against its neighbours; best gap ${best}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return best'), j: null, best, seen: [...seen], message: `Minimum absolute difference: ${best}.` })
  return { input: { nums, x }, result: best, frames }
}

export const code = `minimum absolute difference between elements at least x apart
  start with an empty sorted set of values
  for each index j from x to the end
    add the value at index j minus x to the sorted set
    find the values in the set just below and just above the value at j
    keep the smallest gap found so far as best
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_absolute_difference(nums, x):
    import bisect
    best = None
    seen = []
    for j in range(x, len(nums)):
        bisect.insort(seen, nums[j - x])
        pos = bisect.bisect_left(seen, nums[j])
        for k in (pos - 1, pos):
            if 0 <= k < len(seen):
                gap = abs(seen[k] - nums[j])
                if best is None or gap < best:
                    best = gap
    return best
`
