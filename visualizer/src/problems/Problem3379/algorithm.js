export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12 || nums.some(v => !Number.isInteger(v) || v < -100 || v > 100)) throw new Error('Use 1 to 12 integers from -100 to 100.')
  return nums
}

export function buildTrace(nums) {
  const n = nums.length
  const result = []
  const frames = [{ phase: 'start', activeLine: L('create an empty result'), index: -1, landing: -1, result: [], message: 'Each value moves its own index around the circle.' }]
  for (let i = 0; i < n; i++) {
    const landing = (((i + nums[i]) % n) + n) % n
    result.push(nums[landing])
    frames.push({ phase: 'move', activeLine: L('move nums[i] steps'), index: i, landing, result: [...result], message: `Index ${i} moves ${nums[i]} step(s) and lands on ${landing}, so the result is ${nums[landing]}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return result'), index: -1, landing: -1, result: [...result], message: `Result: [${result.join(', ')}].` })
  return { input: nums, result, frames }
}

export const code = `transformed array of a circular list:
  create an empty result list
  for each index i from 0 to the last index
    move nums[i] steps from i around the circle, wrapping at the ends
    append the value at the landing index to result
  return result`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def transform_array(nums):
    n = len(nums)
    result = []
    for i in range(n):
        landing = (i + nums[i]) % n
        result.append(nums[landing])
    return result
`
