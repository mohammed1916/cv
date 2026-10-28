export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.nums) || input.nums.length < 1 || input.nums.length > 12) throw new Error('Use an object with nums: an array of 1 to 12 integers.')
  if (input.nums.some(v => !Number.isInteger(v) || v < -10 || v > 10)) throw new Error('Each nums entry is an integer from -10 to 10.')
  if (!Number.isInteger(input.k) || input.k < 1 || input.k > input.nums.length) throw new Error('k is an integer from 1 to the length of nums.')
  return { nums: input.nums, k: input.k }
}

export function buildTrace(input) {
  const { nums, k } = input
  const n = nums.length
  const prefix = [0]
  for (const v of nums) prefix.push(prefix[prefix.length - 1] + v)
  // lowest[r] holds the prefix index with the smallest prefix sum among indices seen so far whose residue mod k is r.
  const lowest = new Array(k).fill(null)
  lowest[0] = 0
  let best = null
  let bestRange = null
  const frames = [{ phase: 'start', activeLine: L('set prefix[0]'), index: -1, candidate: null, best: null, range: null, message: 'Prefix index 0 is the lowest seen in residue class 0.' }]
  for (let e = 1; e <= n; e++) {
    const r = e % k
    let candidate = null
    if (lowest[r] !== null) {
      candidate = prefix[e] - prefix[lowest[r]]
      if (best === null || candidate > best) {
        best = candidate
        bestRange = [lowest[r], e - 1]
      }
    }
    frames.push({ phase: 'scan', activeLine: L('look up the lowest'), index: e - 1, candidate, best, range: bestRange, message: candidate === null ? `No earlier prefix has residue ${r}.` : `Subarray from ${lowest[r]} to ${e - 1} has sum ${candidate}. Best so far ${best}.` })
    if (lowest[r] === null || prefix[e] < prefix[lowest[r]]) lowest[r] = e
  }
  frames.push({ phase: 'done', activeLine: L('return best'), index: n, candidate: null, best, range: bestRange, message: `Maximum sum: ${best}.` })
  return { input, result: best, frames }
}

export const code = `maximum subarray sum whose length is divisible by k
  set prefix[0] to 0 and prefix[e] to the sum of the first e numbers
  set lowest[residue] to nothing for each residue, and lowest[0] to 0
  set best to nothing
  for each end e from 1 to n do
    set r to e mod k
    look up the lowest prefix index in class r
    if one exists then the candidate is prefix[e] minus that prefix
    if best is nothing or the candidate is larger then update best
    if prefix[e] is lower than the stored one then store e in class r
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def maximum_subarray_sum(nums, k):
    n = len(nums)
    prefix = [0] * (n + 1)
    for e in range(1, n + 1):
        prefix[e] = prefix[e - 1] + nums[e - 1]
    lowest = [None] * k
    lowest[0] = 0
    best = None
    for e in range(1, n + 1):
        r = e % k
        if lowest[r] is not None:
            candidate = prefix[e] - prefix[lowest[r]]
            if best is None or candidate > best:
                best = candidate
        if lowest[r] is None or prefix[e] < prefix[lowest[r]]:
            lowest[r] = e
    return best
`
