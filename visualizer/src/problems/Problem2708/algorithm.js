export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || Array.isArray(obj) || !Array.isArray(obj.nums)) throw new Error('Use an object with an array key nums.')
  const { nums } = obj
  if (nums.length < 1 || nums.length > 12) throw new Error('nums has 1 to 12 entries.')
  if (nums.some(v => !Number.isInteger(v) || v < -9 || v > 9)) throw new Error('nums entries are integers from -9 to 9.')
  return { nums }
}

export function buildTrace(input) {
  const { nums } = input
  const positives = []
  const negatives = []
  nums.forEach((v, i) => { if (v > 0) positives.push(i); else if (v < 0) negatives.push(i) })
  const frames = [{ phase: 'start', activeLine: L('set chosen to every positive'), index: -1, marked: [], message: 'Positive values only help, so every positive joins the group.' }]
  const chosenPositive = positives.slice()
  frames.push({ phase: 'positive', activeLine: L('set chosen to every positive'), index: -1, marked: chosenPositive.slice(), message: `${chosenPositive.length} positive value(s) are in the group.` })
  negatives.sort((a, b) => nums[a] - nums[b])
  const pairs = negatives.slice(0, negatives.length - (negatives.length % 2))
  frames.push({ phase: 'pair', activeLine: L('add the negatives in pairs'), index: -1, marked: [...chosenPositive, ...pairs], message: pairs.length ? `Negatives are paired from the largest magnitude: ${pairs.map(i => nums[i]).join(', ')}.` : 'No pair of negatives is available.' })
  const chosen = [...chosenPositive, ...pairs]
  let result
  if (chosen.length === 0) {
    result = Math.max(...nums)
    frames.push({ phase: 'done', activeLine: L('return the largest value'), index: -1, marked: [], message: `Nothing positive can be formed, so the answer is the largest value ${result}.` })
  } else {
    result = chosen.reduce((p, i) => p * nums[i], 1)
    frames.push({ phase: 'done', activeLine: L('return the product'), index: -1, marked: chosen, message: `Product of the group: ${result}.` })
  }
  return { input, result, frames }
}

export const code = `maximum strength of a non-empty group
  set chosen to every positive value
  sort the negative values by size, largest first
  add the negatives in pairs, starting from the largest, to chosen
  if chosen is empty then
    return the largest value
  return the product of the chosen values`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_strength(nums):
    positives = [v for v in nums if v > 0]
    negatives = sorted(v for v in nums if v < 0)
    pairs = negatives[:len(negatives) - len(negatives) % 2]
    chosen = positives + pairs
    if not chosen:
        return max(nums)
    product = 1
    for v in chosen:
        product *= v
    return product
`
