export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and k.')
  const { nums, k } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 16 || !nums.every(v => Number.isInteger(v) && v >= 1 && v <= 99)) throw new Error('nums is 1 to 16 integers from 1 to 99.')
  if (!Number.isInteger(k) || k < 1 || k > nums.length) throw new Error('k is an integer from 1 to the length of nums.')
  return { nums, k }
}

export function buildTrace({ nums, k }) {
  const frames = []
  const n = nums.length
  const counts = new Map()
  for (const v of nums) counts.set(v, (counts.get(v) || 0) + 1)
  frames.push({ phase: 'count', value: null, count: 0, message: `Counted ${counts.size} distinct values.` })
  if (n % k !== 0) {
    frames.push({ phase: 'done', value: null, count: 0, message: `${n} is not divisible by ${k}, so no partition exists.` })
    return { input: { nums, k }, result: false, frames }
  }
  const groups = n / k
  frames.push({ phase: 'size', value: null, count: groups, message: `There must be ${groups} groups of ${k}.` })
  let result = true
  for (const [v, c] of counts) {
    if (c > groups) {
      result = false
      frames.push({ phase: 'fail', value: v, count: c, message: `${v} appears ${c} times, more than ${groups} groups can hold.` })
      break
    }
    frames.push({ phase: 'check', value: v, count: c, message: `${v} appears ${c} times, within ${groups} groups.` })
  }
  if (result) frames.push({ phase: 'done', value: null, count: groups, message: 'Every value fits once per group.' })
  else frames.push({ phase: 'done', value: null, count: groups, message: 'No partition exists.' })
  return { input: { nums, k }, result, frames }
}

export const code = `if length of nums is not divisible by k then return false
groups = length divided by k
count each value
for each value
  if its count is more than groups then return false
return true`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def can_partition(nums, k):
    if len(nums) % k != 0:
        return False
    groups = len(nums) // k
    counts = Counter(nums)
    for value, count in counts.items():
        if count > groups:
            return False
    return True
`
