export const phases = [
  { id: 'start', label: 'Start', description: 'Add up the values at even indices and at odd indices for the whole array.' },
  { id: 'scan', label: 'Test deletion', description: 'Deleting index i shifts later values by one place, so their parity flips. Combine the earlier sums with the flipped later sums.' },
  { id: 'decide', label: 'Fair check', description: 'The deletion is fair when the new even-index sum equals the new odd-index sum.' },
  { id: 'done', label: 'Count', description: 'Return how many deletions were fair.' },
]

const codeText = `ways to make fair (nums):
  evenTotal = sum of values at even indices
  oddTotal = sum of values at odd indices
  leftEven = leftOdd = 0, fair = 0
  for each index i:
    evenAfter = evenTotal - leftEven, minus nums[i] if i is even
    oddAfter = oddTotal - leftOdd, minus nums[i] if i is odd
    newEven = leftEven + oddAfter
    newOdd = leftOdd + evenAfter
    if newEven == newOdd: fair = fair + 1
    add nums[i] to leftEven or leftOdd by parity
  return fair`

export const code = codeText.split('\n').map((text, index) => ({ line: index + 1, text }))

const pythonText = `def ways_to_make_fair(nums):
    even_total = sum(nums[0::2])
    odd_total = sum(nums[1::2])
    left_even = left_odd = fair = 0
    for i, value in enumerate(nums):
        even_after = even_total - left_even - (value if i % 2 == 0 else 0)
        odd_after = odd_total - left_odd - (value if i % 2 == 1 else 0)
        new_even = left_even + odd_after
        new_odd = left_odd + even_after
        if new_even == new_odd:
            fair += 1
        if i % 2 == 0:
            left_even += value
        else:
            left_odd += value
    return fair
`

export const python = pythonText
const L = s => codeText.split('\n').findIndex(line => line.includes(s)) + 1
const P = s => pythonText.split('\n').findIndex(line => line.includes(s)) + 1

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!Array.isArray(input) || input.length < 1 || input.length > 20 || !input.every(v => Number.isInteger(v) && v >= 1 && v <= 100)) {
    throw new Error('Use a JSON array of 1 to 20 integers from 1 to 100, such as [2, 1, 6, 4].')
  }
  return input
}

export function buildTrace(nums) {
  const n = nums.length
  let evenTotal = 0
  let oddTotal = 0
  nums.forEach((value, i) => { if (i % 2 === 0) evenTotal += value; else oddTotal += value })
  const frames = [{
    phase: 'start', activeLine: L('evenTotal = sum'), pythonLine: P('even_total = sum'),
    snapshot: { index: null, newEven: null, newOdd: null, fair: null, count: 0, evenTotal, oddTotal },
    message: `Even-index total ${evenTotal}, odd-index total ${oddTotal}.`,
  }]
  let leftEven = 0
  let leftOdd = 0
  let count = 0
  for (let i = 0; i < n; i++) {
    const value = nums[i]
    const evenAfter = evenTotal - leftEven - (i % 2 === 0 ? value : 0)
    const oddAfter = oddTotal - leftOdd - (i % 2 === 1 ? value : 0)
    const newEven = leftEven + oddAfter
    const newOdd = leftOdd + evenAfter
    frames.push({
      phase: 'scan', activeLine: L('evenAfter = evenTotal'), pythonLine: P('even_after = '),
      snapshot: { index: i, newEven, newOdd, fair: null, count, evenTotal, oddTotal },
      message: `Delete index ${i} (${value}). Even-index sum becomes ${newEven}; odd-index sum becomes ${newOdd}.`,
    })
    const fair = newEven === newOdd
    if (fair) count += 1
    frames.push({
      phase: 'decide', activeLine: L('if newEven == newOdd'), pythonLine: P('if new_even == new_odd'),
      snapshot: { index: i, newEven, newOdd, fair, count, evenTotal, oddTotal },
      message: fair ? `Sums match, so deleting index ${i} is fair. Count is ${count}.` : `Sums differ, so index ${i} is not fair.`,
    })
    if (i % 2 === 0) leftEven += value
    else leftOdd += value
  }
  frames.push({
    phase: 'done', activeLine: L('return fair'), pythonLine: P('return fair'),
    snapshot: { index: null, newEven: null, newOdd: null, fair: null, count, evenTotal, oddTotal },
    message: `${count} fair deletion${count === 1 ? '' : 's'} found.`,
  })
  return { input: nums, result: count, frames }
}
