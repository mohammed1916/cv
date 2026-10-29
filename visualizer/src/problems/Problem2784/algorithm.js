export const code = [
  { line: 1, text: "n = largest value in nums" },
  { line: 2, text: "if length of nums is not n + 1, return false" },
  { line: 3, text: "counts = zeros for values 0 to n" },
  { line: 4, text: "for each x in nums, add one to counts[x]" },
  { line: 5, text: "for each v from 1 to n - 1" },
  { line: 6, text: "if counts[v] is not 1, return false" },
  { line: 7, text: "return counts[n] equals 2" },
]

export const python = `def isGood(nums):
    n = max(nums)
    if len(nums) != n + 1:
        return False
    count = [0] * (n + 1)
    for x in nums:
        count[x] += 1
    for v in range(1, n):
        if count[v] != 1:
            return False
    return count[n] == 2`

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.nums)) throw new Error('Use an object with an array nums, for example {"nums":[1,3,3,2]}.')
  if (data.nums.length < 1 || data.nums.length > 30) throw new Error('nums must have 1 to 30 values for this visualization.')
  if (data.nums.some(v => !Number.isInteger(v) || v < 1 || v > 30)) throw new Error('nums values must be integers from 1 to 30.')
  return { nums: [...data.nums] }
}

export function buildTrace({ nums }) {
  const frames = []
  const n = Math.max(...nums)
  frames.push({ phase: 'setup', activeLine: 1, pythonLine: 2, n, count: [], index: -1, message: `The largest value is ${n}, so the base array has length ${n + 1}.` })
  frames.push({ phase: 'length', activeLine: 2, pythonLine: 3, n, count: [], index: -1, message: `Compare length ${nums.length} with n + 1 = ${n + 1}.` })
  if (nums.length !== n + 1) {
    frames.push({ phase: 'done', activeLine: 2, pythonLine: 4, n, count: [], index: -1, result: false, message: 'The lengths differ, so return false.' })
    return { input: { nums }, result: false, frames }
  }
  const count = new Array(n + 1).fill(0)
  frames.push({ phase: 'count', activeLine: 3, pythonLine: 5, n, count: [...count], index: -1, message: `Create counts for values 0 to ${n}.` })
  for (const x of nums) {
    count[x] += 1
    frames.push({ phase: 'count', activeLine: 4, pythonLine: 7, n, count: [...count], index: x, message: `Count ${x}. It now appears ${count[x]} time${count[x] === 1 ? '' : 's'}.` })
  }
  for (let v = 1; v < n; v++) {
    frames.push({ phase: 'verify', activeLine: 5, pythonLine: 8, n, count: [...count], index: v, message: `Check value ${v}, which appears ${count[v]} time(s).` })
    if (count[v] !== 1) {
      frames.push({ phase: 'done', activeLine: 6, pythonLine: 10, n, count: [...count], index: v, result: false, message: `${v} must appear exactly once. Return false.` })
      return { input: { nums }, result: false, frames }
    }
  }
  const result = count[n] === 2
  frames.push({ phase: 'done', activeLine: 7, pythonLine: 11, n, count: [...count], index: n, result, message: `${n} appears ${count[n]} time(s). Return ${result}.` })
  return { input: { nums }, result, frames }
}
