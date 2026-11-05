export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with the keys nums and goal.')
  const { nums, goal } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 8) throw new Error('nums needs 1 to 8 integers.')
  if (nums.some(v => !Number.isInteger(v) || v < -20 || v > 20)) throw new Error('nums values are integers from -20 to 20.')
  if (!Number.isInteger(goal) || goal < -40 || goal > 40) throw new Error('goal is an integer from -40 to 40.')
  return { nums, goal }
}

const subsetSums = part => {
  let out = [0]
  for (const x of part) out = out.concat(out.map(s => s + x))
  return out.sort((a, b) => a - b)
}
export function buildTrace(input) {
  const { nums, goal } = input
  const half = Math.floor(nums.length / 2)
  const frames = []
  let best = Infinity
  let a = -1
  let candidate = -1
  let lsums = []
  let rsums = []
  let range = null
  const PY_LINE = { split: 2, left: 8, right: 9, start: 10, probe: 14, search: 12, update: 22, done: 23 }
  const snap = (phase, activeLine, message) => frames.push({
    phase, pythonLine: PY_LINE[phase], activeLine, a, candidate, lo: range ? range.lo : null, hi: range ? range.hi : null, lsums: [...lsums], rsums: [...rsums], best: best === Infinity ? null : best, message,
  })

  snap('split', L('const half = Math'), `Left half: [${nums.slice(0, half).join(', ')}]. Right half: [${nums.slice(half).join(', ')}].`)
  lsums = subsetSums(nums.slice(0, half))
  snap('left', L('const left = subsetSums'), `${lsums.length} left sums, sorted.`)
  rsums = subsetSums(nums.slice(half))
  snap('right', L('const right = subsetSums'), `${rsums.length} right sums, sorted.`)
  snap('start', L('let best = Infinity'), 'Start with best at a very large number.')
  for (let i = 0; i < lsums.length; i++) {
    a = i
    const target = goal - lsums[i]
    let lo = 0
    let hi = rsums.length
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      candidate = mid
      range = { lo, hi }
      snap('probe', L('while (lo < hi)'), `Search right sums for ${target}: testing index ${mid}, value ${rsums[mid]}.`)
      if (rsums[mid] < target) lo = mid + 1
      else hi = mid
    }
    candidate = lo
    range = { lo, hi }
    snap('search', L('const target = goal - a'), `For left sum ${lsums[i]}, the first right sum at least ${target} is at index ${lo}.`)
    for (const idx of [candidate - 1, candidate]) {
      if (idx < 0 || idx >= rsums.length) continue
      best = Math.min(best, Math.abs(goal - (lsums[i] + rsums[idx])))
    }
    snap('update', L('best = Math.min(best'), `Best difference so far: ${best}.`)
  }
  a = -1
  candidate = -1
  snap('done', L('return best'), `Closest subsequence sum gives difference ${best}.`)
  return { input, result: best, frames }
}

export const code = `function closestSubsequenceSum(nums, goal) {
  const half = Math.floor(nums.length / 2)
  const subsetSums = part => {
    let out = [0]
    for (const x of part) out = out.concat(out.map(s => s + x))
    return out.sort((a, b) => a - b)
  }
  const left = subsetSums(nums.slice(0, half))
  const right = subsetSums(nums.slice(half))
  let best = Infinity
  for (const a of left) {
    const target = goal - a
    let lo = 0
    let hi = right.length
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (right[mid] < target) lo = mid + 1
      else hi = mid
    }
    for (const idx of [lo - 1, lo]) {
      if (idx >= 0 && idx < right.length) best = Math.min(best, Math.abs(goal - (a + right[idx])))
    }
  }
  return best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def closest_subsequence_sum(nums, goal):
    half = len(nums) // 2
    def subset_sums(part):
        out = [0]
        for x in part:
            out = out + [s + x for s in out]
        return sorted(out)
    left = subset_sums(nums[:half])
    right = subset_sums(nums[half:])
    best = float('inf')
    for a in left:
        target = goal - a
        lo, hi = 0, len(right)
        while lo < hi:
            mid = (lo + hi) // 2
            if right[mid] < target:
                lo = mid + 1
            else:
                hi = mid
        for idx in (lo - 1, lo):
            if 0 <= idx < len(right):
                best = min(best, abs(goal - (a + right[idx])))
    return best
`
