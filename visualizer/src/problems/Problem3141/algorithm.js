// LeetCode 3141: for every number, the largest Hamming distance to any number in the array.
// Numbers are read as m-bit binary strings, so leading zeros count. The distance between
// two numbers is the count of bit positions where they differ: the set bits of their XOR.
// This trace scans every pair, which keeps each step visible.

const MAX_M = 10
const MAX_COUNT = 10

const CODE_TEXT = `FUNCTION maxHammingDistances(nums, m)
    answer ← list of zeros with one entry per number
    FOR each index i in nums
        best ← 0
        FOR each index j in nums
            diff ← nums[i] XOR nums[j], keeping only the lowest m bits
            count ← number of 1 bits in diff
            IF count > best THEN best ← count
        answer[i] ← best
    RETURN answer`

export const code = CODE_TEXT.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def max_hamming_distances(nums, m):
    mask = (1 << m) - 1
    answer = [0] * len(nums)
    for i, a in enumerate(nums):
        best = 0
        for b in nums:
            diff = (a ^ b) & mask
            count = bin(diff).count("1")
            if count > best:
                best = count
        answer[i] = best
    return answer
`
const PY = s => {
  const index = python.split('\n').findIndex(c => c.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and m.')
  const { nums, m } = input
  if (!Number.isInteger(m) || m < 1 || m > MAX_M) throw new Error(`m is an integer from 1 to ${MAX_M}.`)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > MAX_COUNT) throw new Error(`nums has 1 to ${MAX_COUNT} numbers.`)
  for (const value of nums) {
    if (!Number.isInteger(value) || value < 0 || value >= 2 ** m) throw new Error(`Each number is an integer from 0 to ${2 ** m - 1} when m is ${m}.`)
  }
  return { nums, m }
}

export function buildTrace({ nums, m }) {
  const mask = (1 << m) - 1
  const answer = Array(nums.length).fill(0)
  const frames = []
  frames.push({ phase: 'start', pythonLine: PY('answer = [0]'), activeLine: L('list of zeros'), nums, m, i: -1, j: -1, diff: 0, count: 0, best: 0, answer: answer.slice(), message: `Read ${nums.length} numbers as ${m}-bit strings.` })
  for (let i = 0; i < nums.length; i++) {
    let best = 0
    frames.push({ phase: 'row', pythonLine: PY('for i, a in enumerate'), activeLine: L('FOR each index i'), nums, m, i, j: -1, diff: 0, count: 0, best, answer: answer.slice(), message: `Find the farthest partner for ${nums[i]}.` })
    for (let j = 0; j < nums.length; j++) {
      const diff = (nums[i] ^ nums[j]) & mask
      const count = countBits(diff)
      const improved = count > best
      if (improved) best = count
      frames.push({ phase: improved ? 'improve' : 'pair', pythonLine: PY('diff = (a ^ b) & mask'), activeLine: L('diff ← nums[i] XOR'), nums, m, i, j, diff, count, best, answer: answer.slice(), message: `${nums[i]} vs ${nums[j]} differ in ${count} bit${count === 1 ? '' : 's'}${improved ? ': new best' : ''}.` })
    }
    answer[i] = best
    frames.push({ phase: 'store', pythonLine: PY('answer[i] = best'), activeLine: L('answer[i] ← best'), nums, m, i, j: -1, diff: 0, count: 0, best, answer: answer.slice(), message: `Record ${best} for ${nums[i]}.` })
  }
  frames.push({ phase: 'done', pythonLine: PY('return answer'), activeLine: L('RETURN answer'), nums, m, i: -1, j: -1, diff: 0, count: 0, best: 0, answer: answer.slice(), message: `Every number has its answer: [${answer.join(', ')}].` })
  return { input: { nums, m }, result: answer, frames }
}

function countBits(value) {
  let count = 0
  for (let v = value; v > 0; v &= v - 1) count++
  return count
}
