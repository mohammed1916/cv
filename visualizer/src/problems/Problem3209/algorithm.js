export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with nums and k.')
  const { nums, k } = data
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 20) throw new Error('nums must be an array of 1 to 20 integers.')
  if (nums.some(v => !Number.isInteger(v) || v < 0 || v > 63)) throw new Error('Each value is an integer from 0 to 63.')
  if (!Number.isInteger(k) || k < 0 || k > 63) throw new Error('k must be an integer from 0 to 63.')
  return { nums, k }
}

export function buildTrace({ nums, k }) {
  const frames = []
  let total = 0
  let groups = []
  frames.push({ phase: 'start', activeLine: L('set total to 0'), index: -1, groups: [], total, message: `Count subarrays whose AND is ${k}.` })
  for (let i = 0; i < nums.length; i++) {
    const v = nums[i]
    const merged = new Map([[v, 1]])
    for (const [value, count] of groups) {
      const key = value & v
      merged.set(key, (merged.get(key) || 0) + count)
    }
    groups = [...merged.entries()]
    frames.push({ phase: 'extend', activeLine: L('build the new groups'), index: i, groups: groups.map(g => [...g]), total, message: `Subarrays ending at ${i} have AND values ${groups.map(([a, c]) => `${a} (x${c})`).join(', ')}.` })
    const hits = merged.get(k) || 0
    if (hits > 0) {
      total += hits
      frames.push({ phase: 'count', activeLine: L('add the count to total'), index: i, groups: groups.map(g => [...g]), total, message: `${hits} subarray(s) ending at ${i} have AND ${k}; total is now ${total}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return total'), index: -1, groups: [], total, message: `Subarrays with AND ${k}: ${total}.` })
  return { input: { nums, k }, result: total, frames }
}

export const code = `count subarrays whose AND equals k
  set total to 0 and groups to an empty list of (value, count) pairs
  for each value v of nums from left to right do
    build the new groups: AND each old value with v, and add (v, 1)
    merge groups with equal values by adding their counts
    set groups to the new groups
    if the count for value k is positive then
      add the count to total
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error('missing code line: ' + s); return i + 1 }

export const python = `def count_and_equal(nums, k):
    total = 0
    groups = {}
    for v in nums:
        new = {v: 1}
        for value, count in groups.items():
            key = value & v
            new[key] = new.get(key, 0) + count
        groups = new
        total += groups.get(k, 0)
    return total
`
