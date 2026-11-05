export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.nums) || input.nums.length < 2 || input.nums.length > 12) throw new Error('Use an object with nums: an array of 2 to 12 integers.')
  if (input.nums.some(v => !Number.isInteger(v) || v < 1 || v > 10)) throw new Error('Each nums entry is an integer from 1 to 10.')
  if (!Number.isInteger(input.k) || input.k < 1 || 2 * input.k > input.nums.length) throw new Error('k is an integer from 1 to half the length of nums, rounded down.')
  return { nums: input.nums, k: input.k }
}

export function buildTrace(input) {
  const { nums, k } = input
  const n = nums.length
  // dec[j]: length of the non-increasing run that ends at index j.
  const dec = new Array(n).fill(1)
  // inc[j]: length of the non-decreasing run that starts at index j.
  const inc = new Array(n).fill(1)
  const frames = [{ phase: 'start', pythonLine: 3, activeLine: L('const dec = new Array'), index: -1, dec: [...dec], inc: [...inc], good: [], message: 'Every run has length 1 before it grows.' }]
  for (let j = 1; j < n; j++) {
    dec[j] = nums[j - 1] >= nums[j] ? dec[j - 1] + 1 : 1
    frames.push({ phase: 'left', pythonLine: 5, activeLine: L('extend dec'), index: j, dec: [...dec], inc: [...inc], good: [], message: `Non-increasing run ending at ${j} has length ${dec[j]}.` })
  }
  for (let j = n - 2; j >= 0; j--) {
    inc[j] = nums[j] <= nums[j + 1] ? inc[j + 1] + 1 : 1
    frames.push({ phase: 'right', pythonLine: 8, activeLine: L('extend inc'), index: j, dec: [...dec], inc: [...inc], good: [], message: `Non-decreasing run starting at ${j} has length ${inc[j]}.` })
  }
  const good = []
  for (let i = k; i <= n - 1 - k; i++) {
    const ok = dec[i - 1] >= k && inc[i + 1] >= k
    if (ok) good.push(i)
    frames.push({ phase: 'check', pythonLine: 9, activeLine: L('if dec[i - 1]'), index: i, dec: [...dec], inc: [...inc], good: [...good], message: ok ? `Index ${i} is good.` : `Index ${i} fails: left run ${dec[i - 1]}, right run ${inc[i + 1]}, need ${k}.` })
  }
  frames.push({ phase: 'done', pythonLine: 9, activeLine: L('return good'), index: n, dec: [...dec], inc: [...inc], good: [...good], message: `Good indices: ${good.length ? good.join(', ') : 'none'}.` })
  return { input, result: good, frames }
}

export const code = `function findGoodIndices(nums, k) {
  const n = nums.length
  const dec = new Array(n).fill(1) // dec[j]: length of the non-increasing run ending at j
  const inc = new Array(n).fill(1) // inc[j]: length of the non-decreasing run starting at j
  for (let j = 1; j < n; j++) {
    if (nums[j - 1] >= nums[j]) dec[j] = dec[j - 1] + 1 // extend dec
  }
  for (let j = n - 2; j >= 0; j--) {
    if (nums[j] <= nums[j + 1]) inc[j] = inc[j + 1] + 1 // extend inc
  }
  const good = []
  for (let i = k; i <= n - 1 - k; i++) {
    if (dec[i - 1] >= k && inc[i + 1] >= k) good.push(i) // if dec[i - 1] and inc[i + 1] are long enough
  }
  return good // return good
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export const python = `def find_good_indices(nums, k):
    n = len(nums)
    dec = [1] * n
    for j in range(1, n):
        dec[j] = dec[j - 1] + 1 if nums[j - 1] >= nums[j] else 1
    inc = [1] * n
    for j in range(n - 2, -1, -1):
        inc[j] = inc[j + 1] + 1 if nums[j] <= nums[j + 1] else 1
    return [i for i in range(k, n - k) if dec[i - 1] >= k and inc[i + 1] >= k]
`
