export function parseInput(text) {
  const value = JSON.parse(text)
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Use an object with nums and k.')
  const { nums, k } = value
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 10) throw new Error('nums must have 2 to 10 integers.')
  if (nums.some(v => !Number.isInteger(v) || v < 0 || v > 50)) throw new Error('nums values are integers from 0 to 50.')
  if (!Number.isInteger(k) || k < 1 || k > 10) throw new Error('k is an integer from 1 to 10.')
  return { nums, k }
}

export function buildTrace({ nums, k }) {
  let total = nums.reduce((sum, v) => sum + v, 0)
  const gains = nums.map(v => (v ^ k) - v)
  const frames = [{ phase: 'start', activeLine: L('set total to the sum'), index: -1, gains, count: 0, total, message: `Start with the plain sum ${total}. Each flip of a value changes it by its gain.` }]
  let count = 0
  gains.forEach((g, i) => {
    if (g > 0) {
      total += g
      count++
      frames.push({ phase: 'gain', activeLine: L('if the gain is positive'), index: i, gains, count, total, message: `Node ${i}: gain ${g} is positive, so flip it. Total ${total}.` })
    } else {
      frames.push({ phase: 'skip', activeLine: L('if the gain is positive'), index: i, gains, count, total, message: `Node ${i}: gain ${g} is not positive, so leave it.` })
    }
  })
  if (count % 2 === 1) {
    const cheapest = Math.min(...gains.map(g => Math.abs(g)))
    total -= cheapest
    frames.push({ phase: 'parity', activeLine: L('subtract the smallest'), index: -1, gains, count, total, message: `${count} flips is odd, which is not allowed. Subtract the smallest gain size ${cheapest}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return total'), index: -1, gains, count, total, message: `Maximum sum: ${total}.` })
  return { input: { nums, k }, result: total, frames }
}

export const code = `maximum sum of node values after paired flips:
  set total to the sum of all values
  for each value, compute its gain as value xor k minus value
  if the gain is positive then add it to total and count it
  if the count is odd then
    subtract the smallest absolute gain from total
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def maximum_value_sum(nums, k):
    total = sum(nums)
    gains = [(v ^ k) - v for v in nums]
    count = 0
    for g in gains:
        if g > 0:
            total += g
            count += 1
    if count % 2 == 1:
        total -= min(abs(g) for g in gains)
    return total
`
