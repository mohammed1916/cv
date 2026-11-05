export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 30 || nums.some(v => !Number.isInteger(v) || Math.abs(v) > 1000000)) throw new Error('Enter a JSON array of 1–30 integers from −1,000,000 to 1,000,000 (the table shows every cell).')
  return nums
}

// For each index i, length[i] is the longest increasing subsequence ending at i and count[i] how many have that
// length. Extending a shorter run keeps its count; a tie in length adds to the count.
export function buildTrace(nums) {
  const n = nums.length
  const length = Array(n).fill(1)
  const count = Array(n).fill(1)
  const snapshot = () => [[...length], [...count]]
  const frames = [{ phase: 'start', i: null, j: null, table: snapshot(), activeLine: L('const length = Array'), pythonLine: P('length = [1] * n'), message: 'Every single value is an increasing run of length 1, counted once.' }]
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) {
        if (length[j] + 1 > length[i]) {
          length[i] = length[j] + 1
          count[i] = count[j]
          frames.push({ phase: 'extend', i, j, table: snapshot(), activeLine: L('length[i] = length[j] + 1'), pythonLine: P('length[i] = length[j] + 1'), message: `${nums[j]} < ${nums[i]}: extend the run ending at ${nums[j]}, length ${length[i]}, count ${count[i]}.` })
        } else if (length[j] + 1 === length[i]) {
          count[i] += count[j]
          frames.push({ phase: 'tie', i, j, table: snapshot(), activeLine: L('count[i] += count[j]'), pythonLine: P('count[i] += count[j]'), message: `${nums[j]} < ${nums[i]} gives another run of length ${length[i]}: add its count, now ${count[i]}.` })
        }
      }
    }
  }
  const longest = Math.max(...length)
  const result = length.reduce((sum, l, i) => (l === longest ? sum + count[i] : sum), 0)
  frames.push({ phase: 'done', i: null, j: null, table: snapshot(), result, activeLine: L('return'), pythonLine: P('return sum('), message: `Longest length ${longest}; ${result} such subsequence(s).` })
  return { input: nums, result, frames }
}

const SOURCE = `function findNumberOfLIS(nums) {
  const n = nums.length
  const length = Array(n).fill(1)
  const count = Array(n).fill(1)
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) {
        if (length[j] + 1 > length[i]) {
          length[i] = length[j] + 1
          count[i] = count[j]
        } else if (length[j] + 1 === length[i]) {
          count[i] += count[j]
        }
      }
    }
  }
  const longest = Math.max(...length)
  return length.reduce((sum, l, i) => (l === longest ? sum + count[i] : sum), 0)
}`
export const code = SOURCE.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def find_number_of_lis(nums):
    n = len(nums)
    length = [1] * n
    count = [1] * n
    for i in range(n):
        for j in range(i):
            if nums[j] < nums[i]:
                if length[j] + 1 > length[i]:
                    length[i] = length[j] + 1
                    count[i] = count[j]
                elif length[j] + 1 == length[i]:
                    count[i] += count[j]
    longest = max(length)
    return sum(c for l, c in zip(length, count) if l == longest)`
const P = s => python.split('\n').findIndex(t => t.includes(s)) + 1
