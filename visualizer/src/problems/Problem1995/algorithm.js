export const phases = [
  { id: 'start', label: 'Start', description: 'Check each index d as the candidate sum, from left to right.' },
  { id: 'target', label: 'Target d', description: 'For this d, try every earlier triple a < b < c and compare its sum with nums[d].' },
  { id: 'match', label: 'Match', description: 'A triple whose sum equals nums[d] is one quadruplet, so the count goes up.' },
  { id: 'done', label: 'Result', description: 'Return the number of matching index quadruplets.' },
]

export const code = `function countSpecialQuadruplets(nums) {
  let count = 0
  for (let d = 3; d < nums.length; d++) {
    for (let a = 0; a < d; a++) {
      for (let b = a + 1; b < d; b++) {
        for (let c = b + 1; c < d; c++) {
          if (nums[a] + nums[b] + nums[c] === nums[d]) count++
        }
      }
    }
  }
  return count
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def count_special_quadruplets(nums):
    count = 0
    for d in range(3, len(nums)):
        for a in range(d):
            for b in range(a + 1, d):
                for c in range(b + 1, d):
                    if nums[a] + nums[b] + nums[c] == nums[d]:
                        count += 1
    return count
`

const C = fragment => code.findIndex(c => c.text.includes(fragment)) + 1
const P = fragment => python.split('\n').findIndex(line => line.includes(fragment)) + 1

export function parseInput(text) {
  let nums
  try { nums = JSON.parse(text) } catch { throw new Error('Use a JSON array such as [1,2,3,6].') }
  if (!Array.isArray(nums) || nums.length < 4 || nums.length > 30) throw new Error('nums must have 4 to 30 values here.')
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= 100)) throw new Error('Each value must be a whole number from 1 to 100.')
  return nums
}

export function buildTrace(nums) {
  const frames = []
  const found = []
  let count = 0
  const add = (phase, c, p, message, d, quad) => frames.push({
    phase, activeLine: C(c), pythonLine: P(p), message,
    snapshot: { nums, d, quad, count, found: found.slice() },
  })
  add('start', 'let count = 0', 'count = 0', 'Start with no quadruplets.', -1, null)
  for (let d = 3; d < nums.length; d++) {
    add('target', 'for (let d = 3', 'for d in range(3', `Target index ${d} with value ${nums[d]}: look for an earlier triple summing to it.`, d, null)
    for (let a = 0; a < d; a++) for (let b = a + 1; b < d; b++) for (let c = b + 1; c < d; c++) {
      if (nums[a] + nums[b] + nums[c] === nums[d]) {
        count++
        found.push([a, b, c, d])
        add('match', 'count++', 'count += 1', `(${a}, ${b}, ${c}, ${d}): ${nums[a]} + ${nums[b]} + ${nums[c]} = ${nums[d]}.`, d, [a, b, c, d])
      }
    }
  }
  add('done', 'return count', 'return count', `${count} special quadruplet(s).`, nums.length - 1, null)
  return { input: nums, result: count, frames }
}
