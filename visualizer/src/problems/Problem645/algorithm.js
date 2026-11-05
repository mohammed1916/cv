export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 10000 || nums.some(v => !Number.isInteger(v) || v < 1 || v > nums.length)) throw new Error('Enter a JSON array of 2–10,000 integers, each from 1 to the array length.')
  const counts = Array(nums.length + 1).fill(0)
  for (const v of nums) counts[v]++
  if (!counts.slice(1).includes(0)) throw new Error('No value is missing, so the array is not damaged.')
  return nums
}

// Count how often each value 1…n appears. The value seen twice is the duplicate; the value never seen is missing.
export function buildTrace(nums) {
  const n = nums.length
  const counts = Array(n + 1).fill(0)
  const frames = [{ phase: 'start', counts: [...counts], value: null, duplicate: null, missing: null, activeLine: L('const counts = Array'), pythonLine: P('count = [0] * (n + 1)'), message: `Make one counter for each value from 1 to ${n}.` }]
  for (const v of nums) {
    counts[v]++
    frames.push({ phase: 'count', counts: [...counts], value: v, duplicate: null, missing: null, activeLine: L('counts[v]++'), pythonLine: P('count[v] += 1'), message: `Read ${v}: its counter is now ${counts[v]}.` })
  }
  let duplicate = 0, missing = 0
  for (let v = 1; v <= n; v++) {
    if (counts[v] === 2) duplicate = v
    if (counts[v] === 0) missing = v
    frames.push({ phase: 'scan', counts: [...counts], value: v, duplicate: duplicate || null, missing: missing || null, activeLine: L('for (let v = 1'), pythonLine: P('for v in range(1, n + 1)'), message: `Value ${v} was seen ${counts[v]} time(s).` })
  }
  const result = [duplicate, missing]
  frames.push({ phase: 'done', counts: [...counts], value: null, duplicate, missing, result, activeLine: L('return [duplicate, missing]'), pythonLine: P('return [duplicate, missing]'), message: `Duplicate ${duplicate}, missing ${missing}.` })
  return { input: nums, result, frames }
}

const SOURCE = `function findErrorNums(nums) {
  const n = nums.length
  const counts = Array(n + 1).fill(0)
  for (const v of nums) counts[v]++
  let duplicate = 0
  let missing = 0
  for (let v = 1; v <= n; v++) {
    if (counts[v] === 2) duplicate = v
    if (counts[v] === 0) missing = v
  }
  return [duplicate, missing]
}`
export const code = SOURCE.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def find_error_nums(nums):
    n = len(nums)
    count = [0] * (n + 1)
    for v in nums:
        count[v] += 1
    duplicate = missing = 0
    for v in range(1, n + 1):
        if count[v] == 2:
            duplicate = v
        if count[v] == 0:
            missing = v
    return [duplicate, missing]`
const P = s => python.split('\n').findIndex(t => t.includes(s)) + 1
