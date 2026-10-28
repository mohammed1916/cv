export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.nums)) throw new Error('Use an object with nums and k.')
  const { nums, k } = obj
  if (nums.length < 1 || nums.length > 12) throw new Error('Use 1 to 12 numbers for the visualization.')
  if (nums.some(v => !Number.isInteger(v) || v < 2 || v > 1000)) throw new Error('Each number must be an integer from 2 to 1000 for the visualization.')
  if (!Number.isInteger(k) || k < 1 || k > 12) throw new Error('k must be an integer from 1 to 12 for the visualization.')
  return { nums, k }
}

const primesOf = x => {
  const out = []
  let v = x
  for (let d = 2; d * d <= v; d++) {
    if (v % d === 0) {
      out.push(d)
      while (v % d === 0) v /= d
    }
  }
  if (v > 1) out.push(v)
  return out
}

export function buildTrace(input) {
  const { nums, k } = input
  const counts = new Map()
  const frames = []
  let distinct = 0
  let left = 0
  let best = 0
  for (let right = 0; right < nums.length; right++) {
    for (const p of primesOf(nums[right])) {
      if ((counts.get(p) ?? 0) === 0) distinct++
      counts.set(p, (counts.get(p) ?? 0) + 1)
      frames.push({ phase: 'extend', activeLine: L('add 1 to counts[p]'), left, right, distinct, best, message: `Add ${nums[right]}; prime ${p} enters the window. ${distinct} distinct prime${distinct === 1 ? '' : 's'} now.` })
    }
    while (distinct > k) {
      for (const p of primesOf(nums[left])) {
        counts.set(p, counts.get(p) - 1)
        if (counts.get(p) === 0) distinct--
        frames.push({ phase: 'shrink', activeLine: L('subtract 1 from counts[p]'), left, right, distinct, best, message: `Drop ${nums[left]}; prime ${p} leaves the window.` })
      }
      left++
    }
    best = Math.max(best, right - left + 1)
    frames.push({ phase: 'record', activeLine: L('set best to the larger of'), left, right, distinct, best, message: `Window [${left}..${right}] has at most ${k} distinct primes; best is ${best}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return best'), left, right: nums.length - 1, distinct, best, message: `Longest valid subarray: ${best}.` })
  return { input, result: best, frames }
}

export const code = `longest subarray with at most k distinct primes(nums, k)
  set best to 0 and left to 0
  set counts to an empty map and distinct to 0
  for each right index r in nums do
    for each distinct prime p of nums[r] do
      if counts[p] is zero then add 1 to distinct
      add 1 to counts[p]
    while distinct is greater than k do
      for each distinct prime p of nums[left] do
        subtract 1 from counts[p] and if it became zero subtract 1 from distinct
      add 1 to left
    set best to the larger of best and r minus left plus 1
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def longest_k_prime_subarray(nums, k):
    def primes_of(x):
        out = []
        d = 2
        while d * d <= x:
            if x % d == 0:
                out.append(d)
                while x % d == 0:
                    x //= d
            d += 1
        if x > 1:
            out.append(x)
        return out

    counts = {}
    distinct = 0
    left = 0
    best = 0
    for right in range(len(nums)):
        for p in primes_of(nums[right]):
            if counts.get(p, 0) == 0:
                distinct += 1
            counts[p] = counts.get(p, 0) + 1
        while distinct > k:
            for p in primes_of(nums[left]):
                counts[p] -= 1
                if counts[p] == 0:
                    distinct -= 1
            left += 1
        best = max(best, right - left + 1)
    return best
`
