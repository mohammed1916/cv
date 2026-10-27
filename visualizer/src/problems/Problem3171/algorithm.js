export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with nums and k.')
  const { nums, k } = data
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 20) throw new Error('nums must be an array of 1 to 20 integers.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 255)) throw new Error('Each value is an integer from 1 to 255.')
  if (!Number.isInteger(k) || k < 1 || k > 255) throw new Error('k must be an integer from 1 to 255.')
  return { nums, k }
}

export function buildTrace({ nums, k }) {
  const frames = []
  let best = null
  let ors = []
  frames.push({ phase: 'start', activeLine: L('set best to nothing'), index: -1, ors: [], best, message: `Track the distinct OR values of subarrays ending at each index; target ${k}.` })
  for (let i = 0; i < nums.length; i++) {
    const v = nums[i]
    ors = [...new Set([v, ...ors.map(o => o | v)])]
    frames.push({ phase: 'extend', activeLine: L('build the list'), index: i, ors: [...ors], best, message: `Subarrays ending at ${i} have OR values ${ors.join(', ')}.` })
    for (const o of ors) {
      const d = Math.abs(o - k)
      if (best === null || d < best) {
        best = d
        frames.push({ phase: 'best', activeLine: L('set best to |o - k|'), index: i, ors: [...ors], best, message: `OR ${o} is ${d} away from ${k}; best distance is now ${d}.` })
      }
    }
  }
  frames.push({ phase: 'done', activeLine: L('return best'), index: -1, ors: [], best, message: `Smallest distance: ${best}.` })
  return { input: { nums, k }, result: best, frames }
}

export const code = `subarray OR closest to k
  set best to nothing and ors to an empty list
  for each value v of nums from left to right do
    build the list of v plus each value in ors ORed with v
    keep only the distinct values of that list as ors
    for each value o in ors do
      if best is nothing or |o - k| is less than best then
        set best to |o - k|
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error('missing code line: ' + s); return i + 1 }

export const python = `def closest_subarray_or(nums, k):
    best = None
    ors = []
    for v in nums:
        ors = list(dict.fromkeys([v] + [o | v for o in ors]))
        for o in ors:
            d = abs(o - k)
            if best is None or d < best:
                best = d
    return best
`
