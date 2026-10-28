export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.nums)) throw new Error('Use a JSON object with a nums array.')
  if (input.nums.length < 1 || input.nums.length > 20) throw new Error('nums needs 1 to 20 values.')
  if (input.nums.some(v => !Number.isInteger(v) || v < 1 || v > 1000)) throw new Error('nums values are integers from 1 to 1000.')
  return input
}

const reflect = x => parseInt(x.toString(2).split('').reverse().join(''), 2)

export function buildTrace(input) {
  const { nums } = input
  const reflections = nums.map(reflect)
  const frames = []
  nums.forEach((x, i) => frames.push({ phase: 'key', activeLine: L('reverse the binary digits'), index: i, reflections, message: `${x} reflects to ${reflections[i]}.` }))
  const pairs = nums.map((x, i) => ({ x, r: reflections[i] }))
  pairs.sort((a, b) => a.r - b.r || a.x - b.x)
  const result = pairs.map(p => p.x)
  frames.push({ phase: 'sort', activeLine: L('sort the pairs'), index: -1, reflections, sorted: result, message: 'Sort by reflection, breaking ties by the original value.' })
  frames.push({ phase: 'done', activeLine: L('return the x values'), index: -1, reflections, sorted: result, message: `Sorted order: ${result.join(', ')}.` })
  return { input, result, frames, reflections }
}

export const code = `sort by binary reflection (nums):
  for each number x in nums
    reverse the binary digits of x to get its reflection
    store the pair of reflection and x
  sort the pairs by reflection, then by x
  return the x values in that order`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def sort_integers_by_binary_reflection(nums):
    def reflect(x):
        return int(bin(x)[2:][::-1], 2)
    return sorted(nums, key=lambda x: (reflect(x), x))
`
