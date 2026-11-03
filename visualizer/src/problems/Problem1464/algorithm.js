export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with no largest or runner-up value recorded.' },
  { id: 'scan', label: 'Read value', description: 'Read the next value and compare it with the two largest values seen so far.' },
  { id: 'update', label: 'Update top two', description: 'Keep the two largest values, whatever their positions.' },
  { id: 'answer', label: 'Form product', description: 'Subtract one from each of the two largest values and multiply.' },
  { id: 'done', label: 'Complete', description: 'Return the product.' },
]

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 500 || !nums.every(v => Number.isInteger(v) && v >= 1 && v <= 1000)) {
    throw new Error('Use a JSON array of 2 to 500 integers from 1 to 1000.')
  }
  return { nums }
}

const at = (activeLine, pythonLine = activeLine) => ({ activeLine, pythonLine })

export function buildTrace({ nums }) {
  let largest = 0
  let runner = 0
  let largestAt = null
  let runnerAt = null
  const snap = (index, action) => ({ index, value: index === null ? null : nums[index], largest, runner, largestAt, runnerAt, action })
  const frames = [{ phase: 'start', ...at(2), snapshot: snap(null, 'start'), message: 'Start with no two largest values. Every value is at least 1, so 0 is a safe placeholder.' }]
  nums.forEach((value, index) => {
    frames.push({ phase: 'scan', ...at(3), snapshot: snap(index, 'read'), message: `Read ${value} at position ${index}. Largest is ${largest}, runner-up is ${runner}.` })
    if (value > largest) {
      runner = largest
      runnerAt = largestAt
      largest = value
      largestAt = index
      frames.push({ phase: 'update', ...at(6), snapshot: snap(index, 'new largest'), message: `${value} is the new largest, and the old largest drops to runner-up.` })
    } else if (value > runner) {
      runner = value
      runnerAt = index
      frames.push({ phase: 'update', ...at(8), snapshot: snap(index, 'new runner-up'), message: `${value} beats the runner-up, so it replaces that value.` })
    } else {
      frames.push({ phase: 'update', ...at(7), snapshot: snap(index, 'skip'), message: `${value} does not beat either stored value, so nothing changes.` })
    }
  })
  const result = (largest - 1) * (runner - 1)
  frames.push({ phase: 'answer', ...at(9), snapshot: snap(null, 'multiply'), message: `(${largest} - 1) * (${runner} - 1) = ${result}.` })
  frames.push({ phase: 'done', ...at(9), snapshot: snap(null, 'done'), message: `Return ${result}.` })
  return { input: { nums }, result, frames }
}

export const code = [
  'max product of two elements (nums):',
  '  largest = 0; runner = 0',
  '  for value in nums:',
  '    if value > largest:',
  '      runner = largest',
  '      largest = value',
  '    else if value > runner:',
  '      runner = value',
  '  return (largest - 1) * (runner - 1)',
].map((text, index) => ({ line: index + 1, text }))

export const python = [
  'def max_product(nums):',
  '    largest = runner = 0',
  '    for value in nums:',
  '        if value > largest:',
  '            runner = largest',
  '            largest = value',
  '        elif value > runner:',
  '            runner = value',
  '    return (largest - 1) * (runner - 1)',
].join('\n')
