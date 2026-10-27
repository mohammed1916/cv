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
const lowerBound = (arr, target) => {
  let lo = 0
  let hi = arr.length
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (arr[mid] < target) lo = mid + 1
    else hi = mid
  }
  return lo
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
  const snap = (phase, activeLine, message) => frames.push({
    phase, activeLine, a, candidate, lsums: [...lsums], rsums: [...rsums], best: best === Infinity ? null : best, message,
  })

  snap('split', L('split the numbers'), `Left half: [${nums.slice(0, half).join(', ')}]. Right half: [${nums.slice(half).join(', ')}].`)
  lsums = subsetSums(nums.slice(0, half))
  snap('left', L('list every subset sum of the left half'), `${lsums.length} left sums, sorted.`)
  rsums = subsetSums(nums.slice(half))
  snap('right', L('list every subset sum of the right half'), `${rsums.length} right sums, sorted.`)
  snap('start', L('set best to a very large number'), 'Start with best at a very large number.')
  for (let i = 0; i < lsums.length; i++) {
    a = i
    candidate = lowerBound(rsums, goal - lsums[i])
    snap('search', L('find the right sum closest to goal minus a'), `For left sum ${lsums[i]}, look for right sums near ${goal - lsums[i]}.`)
    for (const idx of [candidate - 1, candidate]) {
      if (idx < 0 || idx >= rsums.length) continue
      best = Math.min(best, Math.abs(goal - (lsums[i] + rsums[idx])))
    }
    snap('update', L('update best with'), `Best difference so far: ${best}.`)
  }
  a = -1
  candidate = -1
  snap('done', L('return best'), `Closest subsequence sum gives difference ${best}.`)
  return { input, result: best, frames }
}

export const code = `split the numbers into a left half and a right half
list every subset sum of the left half, and sort them
list every subset sum of the right half, and sort them
set best to a very large number
for each left sum a
  find the right sum closest to goal minus a, using binary search
  update best with the distance from goal of a plus that right sum
return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from bisect import bisect_left

def min_difference(nums, goal):
    half = len(nums) // 2
    left = nums[:half]
    right = nums[half:]

    def subset_sums(part):
        out = [0]
        for x in part:
            out += [s + x for s in out]
        return sorted(out)

    lsums = subset_sums(left)
    rsums = subset_sums(right)
    best = float('inf')
    for a in lsums:
        k = bisect_left(rsums, goal - a)
        for idx in (k - 1, k):
            if 0 <= idx < len(rsums):
                best = min(best, abs(goal - (a + rsums[idx])))
    return best
`
