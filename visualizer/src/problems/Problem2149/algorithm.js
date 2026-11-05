// LeetCode 2149: Rearrange Array Elements by Sign.
// Positives go to even slots and negatives to odd slots, in their original order. Two write pointers, one
// for each sign, move forward by 2 each time they place a value, so relative order is preserved.

export function parseInput(text) {
  let nums
  try { nums = JSON.parse(text) } catch { throw new Error('Use a JSON array with equal positive and negative numbers, e.g. [3,-2,1,-5].') }
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 40 || nums.length % 2 !== 0) throw new Error('Use an even-length array of 2 to 40 values.')
  if (nums.some(v => !Number.isInteger(v) || v === 0 || Math.abs(v) > 100000)) throw new Error('Values are non-zero integers up to 100000 in absolute value.')
  const positives = nums.filter(v => v > 0).length
  if (positives * 2 !== nums.length) throw new Error('There must be equally many positive and negative numbers.')
  return { nums }
}

export const code = `function rearrangeArray(nums) {
  const result = new Array(nums.length)
  let p = 0
  let q = 1
  for (const value of nums) {
    if (value > 0) {
      result[p] = value
      p += 2
    } else {
      result[q] = value
      q += 2
    }
  }
  return result
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `# entry: rearrange_array
def rearrange_array(nums):
    result = [0] * len(nums)
    p = 0
    q = 1
    for value in nums:
        if value > 0:
            result[p] = value
            p += 2
        else:
            result[q] = value
            q += 2
    return result
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Two write pointers', description: 'p writes positives into even slots; q writes negatives into odd slots.' },
  { id: 'positive', label: 'Place positive', description: 'The positive goes to the next even slot.' },
  { id: 'negative', label: 'Place negative', description: 'The negative goes to the next odd slot.' },
  { id: 'done', label: 'Result', description: 'The alternating array.' },
]

export function buildTrace({ nums }) {
  const frames = []
  const result = new Array(nums.length).fill(null)
  let p = 0
  let q = 1
  frames.push({ phase: 'start', activeLine: L('let p = 0'), pythonLine: P('p = 0'), message: 'p starts at slot 0 and q at slot 1.', i: -1, p, q, result: [...result] })
  nums.forEach((value, i) => {
    if (value > 0) {
      result[p] = value
      frames.push({ phase: 'positive', activeLine: L('result[p] = value'), pythonLine: P('result[p] = value'), message: `${value} is positive: write it to slot ${p}.`, i, p, q, result: [...result] })
      p += 2
    } else {
      result[q] = value
      frames.push({ phase: 'negative', activeLine: L('result[q] = value'), pythonLine: P('result[q] = value'), message: `${value} is negative: write it to slot ${q}.`, i, p, q, result: [...result] })
      q += 2
    }
  })
  frames.push({ phase: 'done', activeLine: L('return result'), pythonLine: P('return result'), message: `Rearranged: ${result.join(', ')}.`, i: -1, p, q, result: [...result] })
  return { input: { nums }, result, frames }
}
