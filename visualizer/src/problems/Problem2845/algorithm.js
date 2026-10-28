export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.nums) || input.nums.length < 1 || input.nums.length > 10) throw new Error('Use an object with nums: an array of 1 to 10 integers.')
  if (input.nums.some(v => !Number.isInteger(v) || v < 0 || v > 20)) throw new Error('Each nums entry is an integer from 0 to 20.')
  if (!Number.isInteger(input.modulo) || input.modulo < 2 || input.modulo > 6) throw new Error('modulo is an integer from 2 to 6.')
  if (!Number.isInteger(input.k) || input.k < 0 || input.k >= input.modulo) throw new Error('k is an integer from 0 up to modulo minus 1.')
  return { nums: input.nums, modulo: input.modulo, k: input.k }
}

export function buildTrace(input) {
  const { nums, modulo, k } = input
  const freq = new Array(modulo).fill(0)
  freq[0] = 1
  let cur = 0
  let count = 0
  const frames = [{ phase: 'start', activeLine: L('set freq[0]'), index: -1, cur, count, freq: [...freq], message: 'The empty prefix has residue 0 and is counted once.' }]
  nums.forEach((value, j) => {
    if (value % modulo === k) cur = (cur + 1) % modulo
    const target = (cur - k + modulo) % modulo
    const add = freq[target]
    count += add
    frames.push({ phase: 'scan', activeLine: L('add freq[target]'), index: j, cur, target, count, freq: [...freq], message: `Prefix residue ${cur}. ${add} earlier prefixes have residue ${target}, so the count grows by ${add}.` })
    freq[cur] += 1
  })
  frames.push({ phase: 'done', activeLine: L('return count'), index: nums.length, cur, count, freq: [...freq], message: `Interesting subarrays: ${count}.` })
  return { input, result: count, frames }
}

export const code = `count interesting subarrays using prefix residues
  set freq[0] to 1 for the empty prefix and every other entry to 0
  set cur to 0 and count to 0
  for each number v in nums do
    if v mod modulo equals k then add 1 to cur, modulo modulo
    set target to cur minus k, modulo modulo
    add freq[target] to count
    add 1 to freq[cur]
  return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_of_interesting_subarrays(nums, modulo, k):
    freq = [0] * modulo
    freq[0] = 1
    cur = 0
    count = 0
    for v in nums:
        if v % modulo == k:
            cur = (cur + 1) % modulo
        target = (cur - k) % modulo
        count += freq[target]
        freq[cur] += 1
    return count
`
