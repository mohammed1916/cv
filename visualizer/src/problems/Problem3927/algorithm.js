export const phases = [
  { id: 'start', label: 'Setup', description: 'Collect the distinct values in increasing order.' },
  { id: 'element', label: 'Element', description: 'Take the next value of the array.' },
  { id: 'test', label: 'Test divisor', description: 'Check whether a present value divides this element.' },
  { id: 'add', label: 'Add', description: 'Add the smallest reachable value to the sum.' },
  { id: 'done', label: 'Result', description: 'Report the minimum sum.' },
]

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('Use a JSON array of 1 to 12 positive integers.')
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= 100)) throw new Error('Each value is an integer from 1 to 100.')
  return { nums }
}

export function buildTrace({ nums }) {
  const present = [...new Set(nums)].sort((a, b) => a - b)
  const frames = []
  let total = 0
  frames.push({ phase: 'start', activeLine: L('let present be'), pythonLine: P('present = sorted'), message: `Present values, smallest first: ${present.join(', ')}.`, present, index: -1, value: null, candidate: null, divides: null, pick: null, total })
  nums.forEach((x, index) => {
    frames.push({ phase: 'element', activeLine: L('for each value x'), pythonLine: P('for x in nums'), message: `Element ${index} is ${x}. Look for the smallest present divisor.`, present, index, value: x, candidate: null, divides: null, pick: x, total })
    let pick = x
    for (const d of present) {
      if (d > x) {
        frames.push({ phase: 'test', activeLine: L('if d is greater'), pythonLine: P('if d > x'), message: `${d} is above ${x}, so the scan stops and ${x} stays.`, present, index, value: x, candidate: d, divides: false, pick, total })
        break
      }
      const divides = x % d === 0
      frames.push({ phase: 'test', activeLine: L('if x is divisible'), pythonLine: P('if x % d == 0'), message: divides ? `${d} divides ${x} exactly, so ${x} can become ${d}.` : `${d} does not divide ${x}.`, present, index, value: x, candidate: d, divides, pick, total })
      if (divides) {
        pick = d
        break
      }
    }
    total += pick
    frames.push({ phase: 'add', activeLine: L('add pick to total'), pythonLine: P('total += pick'), message: `Element ${index} settles at ${pick}; the total is ${total}.`, present, index, value: x, candidate: pick, divides: null, pick, total })
  })
  frames.push({ phase: 'done', activeLine: L('return total'), pythonLine: P('return total'), message: `The minimum sum is ${total}.`, present, index: -1, value: null, candidate: null, divides: null, pick: null, total })
  return { input: { nums }, result: total, frames }
}

export const code = `minimum sum after divisible replacements
  let present be the sorted distinct values
  let total be 0
  for each value x in nums
    let pick be x
    for each d in present in increasing order
      if d is greater than x then stop scanning
      if x is divisible by d then set pick to d and stop scanning
    add pick to total
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(line => line.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def min_array_sum(nums):
    present = sorted(set(nums))
    total = 0
    for x in nums:
        pick = x
        for d in present:
            if d > x:
                break
            if x % d == 0:
                pick = d
                break
        total += pick
    return total`

const pyLines = python.split('\n')
const P = s => {
  const index = pyLines.findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}
