export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.nums) || !Number.isInteger(input.k)) throw new Error('Use a JSON object with a nums array and an integer k.')
  if (input.nums.length < 1 || input.nums.length > 12) throw new Error('nums needs 1 to 12 values (visualization cap).')
  if (input.nums.some(v => !Number.isInteger(v) || v < -9 || v > 9)) throw new Error('nums values are integers from -9 to 9.')
  if (!Number.isInteger(input.k) || input.k < 0 || input.k > 20) throw new Error('k must be an integer from 0 to 20 (visualization cap).')
  return input
}

export function buildTrace(input) {
  const { nums, k } = input
  const positions = []
  const values = []
  nums.forEach((x, i) => { if (x >= 0) { positions.push(i); values.push(x) } })
  const frames = [{ phase: 'collect', activeLine: L('positions = indices'), index: -1, out: [...nums], positions, message: `Non-negative positions: [${positions.join(', ')}].` }]
  if (values.length === 0) {
    frames.push({ phase: 'done', activeLine: L('if values is empty then return nums'), index: -1, out: [...nums], positions, message: 'No non-negative values, so nothing moves.' })
    return { input, result: [...nums], frames, positions }
  }
  const shift = k % values.length
  const rotated = values.slice(shift).concat(values.slice(0, shift))
  const out = [...nums]
  positions.forEach((pos, j) => {
    out[pos] = rotated[j]
    frames.push({ phase: 'write', activeLine: L('write rotated[j] into positions[j]'), index: pos, out: [...out], positions, message: `Write ${rotated[j]} into index ${pos}.` })
  })
  frames.push({ phase: 'done', activeLine: L('return the result'), index: -1, out: [...out], positions, message: `Rotated array: [${out.join(', ')}].` })
  return { input, result: out, frames, positions }
}

export const code = `rotate non negative elements (nums, k):
  positions = indices where nums holds a non-negative value
  values = the non-negative values, in the same order
  if values is empty then return nums
  shift = k modulo the number of values
  rotated = values from index shift to the end, then values from the start to shift
  write rotated[j] into positions[j] for each j
  return the result`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def rotate_non_negative_elements(nums, k):
    positions = [i for i, x in enumerate(nums) if x >= 0]
    values = [nums[i] for i in positions]
    if not values:
        return list(nums)
    shift = k % len(values)
    rotated = values[shift:] + values[:shift]
    out = list(nums)
    for j, pos in enumerate(positions):
        out[pos] = rotated[j]
    return out
`
