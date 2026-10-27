export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and pattern.')
  const { nums, pattern } = input
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 12) throw new Error('nums must have 2 to 12 values.')
  if (nums.some(v => !Number.isInteger(v) || v < -5 || v > 5)) throw new Error('Each value is an integer from -5 to 5.')
  if (!Array.isArray(pattern) || pattern.length < 1 || pattern.length > nums.length - 1) throw new Error('pattern has 1 to n - 1 entries.')
  if (pattern.some(v => v !== -1 && v !== 0 && v !== 1)) throw new Error('Pattern entries are -1, 0 or 1.')
  return { nums, pattern }
}

const sign = x => (x > 0 ? 1 : x < 0 ? -1 : 0)

export function buildTrace({ nums, pattern }) {
  const signs = []
  for (let i = 0; i + 1 < nums.length; i++) signs.push(sign(nums[i + 1] - nums[i]))
  const m = pattern.length
  const frames = []
  frames.push({ phase: 'signs', activeLine: L('build the sign'), index: -1, k: 0, matches: 0, message: `Signs of adjacent differences: [${signs.join(', ')}].` })
  const fail = Array(m).fill(0)
  let k = 0
  for (let i = 1; i < m; i++) {
    while (k > 0 && pattern[i] !== pattern[k]) k = fail[k - 1]
    if (pattern[i] === pattern[k]) k++
    fail[i] = k
    frames.push({ phase: 'fail', activeLine: L('build the failure table'), index: i, k, matches: 0, message: `Failure entry ${i} is ${k}.` })
  }
  let matches = 0
  k = 0
  frames.push({ phase: 'scan', activeLine: L('set matches to 0'), index: -1, k, matches, message: 'Scan the signs for the pattern.' })
  for (let i = 0; i < signs.length; i++) {
    while (k > 0 && signs[i] !== pattern[k]) {
      k = fail[k - 1]
      frames.push({ phase: 'scan', activeLine: L('while k is above 0'), index: i, k, matches, message: `Sign ${signs[i]} misses; fall back to pattern position ${k}.` })
    }
    if (signs[i] === pattern[k]) k++
    frames.push({ phase: 'scan', activeLine: L('if signs at i equals'), index: i, k, matches, message: `Sign ${signs[i]} matches pattern position ${k - (signs[i] === pattern[k - 1] ? 1 : 0)}.` })
    if (k === m) {
      matches++
      k = fail[k - 1]
      frames.push({ phase: 'match', activeLine: L('if k equals the length'), index: i, k, matches, message: `A full match ends at sign ${i}. Matches: ${matches}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return matches'), index: -1, k, matches, message: `Matching subarrays: ${matches}.` })
  return { input: { nums, pattern }, result: matches, frames }
}

export const code = `count subarrays whose adjacent comparisons match the pattern
  build the sign of each adjacent difference of nums, as signs
  build the failure table for pattern
  set matches to 0 and k to 0
  for each sign i in signs
    while k is above 0 and signs at i differs from pattern at k do set k to failure at k minus 1
    if signs at i equals pattern at k then add one to k
    if k equals the length of pattern then add one to matches and set k to failure at k minus 1
  return matches`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_matching_subarrays(nums, pattern):
    signs = []
    for i in range(len(nums) - 1):
        signs.append((nums[i + 1] > nums[i]) - (nums[i + 1] < nums[i]))
    m = len(pattern)
    fail = [0] * m
    k = 0
    for i in range(1, m):
        while k > 0 and pattern[i] != pattern[k]:
            k = fail[k - 1]
        if pattern[i] == pattern[k]:
            k += 1
        fail[i] = k
    matches = 0
    k = 0
    for x in signs:
        while k > 0 and x != pattern[k]:
            k = fail[k - 1]
        if x == pattern[k]:
            k += 1
        if k == m:
            matches += 1
            k = fail[k - 1]
    return matches
`
