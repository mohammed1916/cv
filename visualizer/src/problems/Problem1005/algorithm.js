export const phases = [
  { id: 'start', label: 'Start', description: 'Read the values and the number of sign flips still available.' },
  { id: 'inspect', label: 'Sort by value', description: 'Sort ascending so the most negative values, which gain the most from a flip, come first.' },
  { id: 'update', label: 'Flip or fix parity', description: 'Flip negative values while flips remain; then, for an odd leftover, reduce the sum by twice the smallest magnitude.' },
  { id: 'done', label: 'Complete', description: 'Return the resulting sum.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"nums": [3, -7, -2, 6], "k": 3}.')
  const { nums, k } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12 || !nums.every(v => Number.isInteger(v) && Math.abs(v) <= 100)) throw new Error('nums is a list of 1 to 12 integers from -100 to 100.')
  if (!Number.isInteger(k) || k < 1 || k > 10) throw new Error('k is an integer from 1 to 10.')
  return { nums, k }
}

export function buildTrace({ nums, k }) {
  const values = [...nums].sort((a, b) => a - b)
  const frames = [{ phase: 'start', activeLine: L('values = sorted'), pythonLine: P('values = sorted'), snapshot: { values: [...nums], flipped: [], remaining: k, sum: null }, message: `Values ${nums.join(', ')} with ${k} flip${k === 1 ? '' : 's'} available.` }]
  const sorted = [...values]
  frames.push({ phase: 'inspect', activeLine: L('values = sorted'), pythonLine: P('values = sorted'), snapshot: { values: [...sorted], flipped: [], remaining: k, sum: null }, message: `Sorted ascending: ${sorted.join(', ')}.` })
  let remaining = k
  const flipped = []
  for (let i = 0; i < sorted.length && remaining > 0 && sorted[i] < 0; i++) {
    const before = sorted[i]
    sorted[i] = -before
    remaining--
    flipped.push(i)
    frames.push({ phase: 'update', activeLine: L('flip a negative value'), pythonLine: P('values[i] = -values[i]'), snapshot: { values: [...sorted], flipped: [...flipped], remaining, sum: null }, message: `Flip ${before} to ${-before}. ${remaining} flip${remaining === 1 ? '' : 's'} left.` })
  }
  let total = sorted.reduce((a, b) => a + b, 0)
  if (remaining % 2 === 1) {
    const smallest = Math.min(...sorted.map(v => Math.abs(v)))
    total -= 2 * smallest
    frames.push({ phase: 'update', activeLine: L('total -= 2 * smallest'), pythonLine: P('total -= 2 * min'), snapshot: { values: [...sorted], flipped: [...flipped], remaining, sum: total }, message: `One flip is left over. Spending it on the smallest magnitude ${smallest} costs ${2 * smallest}.` })
  }
  const result = total
  frames.push({ phase: 'done', activeLine: L('return total'), pythonLine: P('return total'), snapshot: { values: [...sorted], flipped: [...flipped], remaining, sum: result }, message: `The maximum sum is ${result}.` })
  return { input: { nums, k }, result, frames }
}

export const code = `maximize sum after negations (nums, k):
  values = sorted(nums)
  for i over values:
    if k is 0 or values[i] is not negative: stop
    values[i] = -values[i]  flip a negative value
    k = k - 1
  total = sum of values
  if k is odd:
    total -= 2 * smallest absolute value
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export const python = `def largest_sum_after_k_negations(nums, k):
    values = sorted(nums)
    for i in range(len(values)):
        if k == 0 or values[i] >= 0:
            break
        values[i] = -values[i]
        k -= 1
    total = sum(values)
    if k % 2 == 1:
        total -= 2 * min(abs(v) for v in values)
    return total
`
