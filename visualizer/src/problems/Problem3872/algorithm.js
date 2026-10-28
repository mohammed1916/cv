export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.nums)) throw new Error('Use a JSON object with a "nums" array.')
  const { nums } = obj
  if (nums.length < 4 || nums.length > 30) throw new Error('nums must have 4 to 30 entries for this visualization.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 100000)) throw new Error('Each value must be an integer from 1 to 100000.')
  return { nums }
}

// A window can be fixed by one change if some position can be dropped so the rest share one integer step.
function fixable(nums, a, b) {
  if (b - a + 1 <= 3) return true
  for (let k = a; k <= b; k++) {
    const rest = []
    for (let i = a; i <= b; i++) if (i !== k) rest.push(i)
    const [p0, p1] = rest
    const diff = nums[p1] - nums[p0]
    const step = p1 - p0
    if (diff % step !== 0) continue
    const d = diff / step
    if (rest.every(i => nums[i] === nums[p0] + d * (i - p0))) return true
  }
  return false
}

export function buildTrace({ nums }) {
  const n = nums.length
  let best = 2
  let bestRange = [0, 1]
  const frames = [{ phase: 'start', activeLine: L('set best to 2'), a: -1, b: -1, ok: null, best, message: 'Any two neighbours form a run, so the answer is at least 2.' }]
  for (let a = 0; a < n; a++) {
    for (let b = a + 1; b < n; b++) {
      const ok = fixable(nums, a, b)
      if (ok && b - a + 1 > best) { best = b - a + 1; bestRange = [a, b] }
      frames.push({ phase: ok ? 'found' : 'check', activeLine: L('can be made arithmetic'), a, b, ok, best,
        message: `Window [${a}..${b}] (${nums.slice(a, b + 1).join(', ')}) ${ok ? 'can be made arithmetic with one change' : 'cannot be fixed with one change'}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return best'), a: bestRange[0], b: bestRange[1], ok: true, best, message: `Longest: ${best}.` })
  return { input: { nums }, result: best, frames }
}

export const code = `longest arithmetic subarray after changing at most one element (nums):
  set best to 2
  for each start index a
    for each end index b after a
      if the subarray from a to b can be made arithmetic with one change then
        set best to the larger of best and (b minus a plus 1)
  return best

a window of 3 or fewer always can; longer windows need one position whose
removal leaves the other values on a single shared integer step`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def longest_arithmetic_one_change(nums):
    def fixable(a, b):
        if b - a + 1 <= 3:
            return True
        for k in range(a, b + 1):
            rest = [i for i in range(a, b + 1) if i != k]
            p0, p1 = rest[0], rest[1]
            diff = nums[p1] - nums[p0]
            step = p1 - p0
            if diff % step != 0:
                continue
            d = diff // step
            if all(nums[i] == nums[p0] + d * (i - p0) for i in rest):
                return True
        return False

    n = len(nums)
    best = 2
    for a in range(n):
        for b in range(a + 1, n):
            if fixable(a, b):
                best = max(best, b - a + 1)
    return best
`
