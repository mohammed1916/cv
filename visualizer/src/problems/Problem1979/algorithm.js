export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with the first value as both the smallest and the largest.' },
  { id: 'scan', label: 'Scan extremes', description: 'Compare each value with the current smallest and largest.' },
  { id: 'euclid', label: 'Euclid steps', description: 'Replace the pair by its remainder until one value is zero.' },
  { id: 'done', label: 'Result', description: 'The non-zero value left is the greatest common divisor.' },
]

export const code = `function findGcdOfExtremes(nums) {
  let smallest = nums[0]
  let largest = nums[0]
  for (const value of nums) {
    if (value < smallest) smallest = value
    if (value > largest) largest = value
  }
  return gcd(smallest, largest)
}

function gcd(a, b) {
  while (b !== 0) {
    [a, b] = [b, a % b]
  }
  return a
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def find_gcd_of_extremes(nums):
    smallest = nums[0]
    largest = nums[0]
    for value in nums:
        if value < smallest:
            smallest = value
        if value > largest:
            largest = value
    return gcd(smallest, largest)

def gcd(a, b):
    while b != 0:
        a, b = b, a % b
    return a
`

const C = fragment => code.findIndex(c => c.text.includes(fragment)) + 1
const P = fragment => python.split('\n').findIndex(line => line.includes(fragment)) + 1

export function parseInput(text) {
  let nums
  try { nums = JSON.parse(text) } catch { throw new Error('Use a JSON array such as [2,5,6,9,10].') }
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 1000) throw new Error('nums must be an array of 2 to 1000 values.')
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= 1000)) throw new Error('Each value must be a whole number from 1 to 1000.')
  return nums
}

export function buildTrace(nums) {
  const frames = []
  const add = (phase, c, p, message, snapshot) => frames.push({
    phase, activeLine: C(c), pythonLine: P(p), message, snapshot: { nums, minIndex: -1, maxIndex: -1, index: -1, smallest: null, largest: null, a: null, b: null, ...snapshot },
  })
  let smallest = nums[0], largest = nums[0], minIndex = 0, maxIndex = 0
  add('start', 'let smallest', 'smallest = nums[0]', `Start with ${nums[0]} as both extremes.`, { index: 0, smallest, largest, minIndex, maxIndex })
  nums.forEach((value, i) => {
    if (value < smallest) { smallest = value; minIndex = i }
    if (value > largest) { largest = value; maxIndex = i }
    add('scan', 'for (const value', 'for value in nums', `Value ${value} at index ${i}. Smallest is ${smallest}, largest is ${largest}.`, { index: i, smallest, largest, minIndex, maxIndex })
  })
  let a = smallest, b = largest
  add('euclid', 'return gcd', 'return gcd', `Euclid starts with (${a}, ${b}).`, { index: -1, smallest, largest, minIndex, maxIndex, a, b })
  while (b !== 0) {
    const next = a % b
    a = b
    b = next
    add('euclid', '[a, b] =', 'a, b = b, a % b', `Replace the pair by (${a}, ${b}).`, { index: -1, smallest, largest, minIndex, maxIndex, a, b })
  }
  add('done', 'return a', 'return a', `The greatest common divisor is ${a}.`, { index: -1, smallest, largest, minIndex, maxIndex, a, b })
  return { input: nums, result: a, frames }
}
