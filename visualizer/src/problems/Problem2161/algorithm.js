// LeetCode 2161: Partition Array According to Given Pivot.
// Three groups keep their original order: smaller than the pivot, equal to it, and larger.
// Concatenating the groups in that order gives the rearrangement.

export function parseInput(text) {
  let data
  try { data = JSON.parse(text) } catch { throw new Error('Use a JSON object such as {"nums":[9,12,5,10,14,3,10],"pivot":10}.') }
  const { nums, pivot } = data ?? {}
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 30 || nums.some(v => !Number.isInteger(v) || Math.abs(v) > 100)) {
    throw new Error('nums holds 1 to 30 integers with absolute value up to 100.')
  }
  if (!Number.isInteger(pivot) || Math.abs(pivot) > 100) throw new Error('pivot is an integer from -100 to 100.')
  return { nums, pivot }
}

export const code = `function pivotArray(nums, pivot) {
  const smaller = []
  const equal = []
  const larger = []
  for (const value of nums) {
    if (value < pivot) smaller.push(value)
    else if (value === pivot) equal.push(value)
    else larger.push(value)
  }
  return [...smaller, ...equal, ...larger]
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `# entry: pivot_array
def pivot_array(nums, pivot):
    smaller = []
    equal = []
    larger = []
    for value in nums:
        if value < pivot:
            smaller.append(value)
        elif value == pivot:
            equal.append(value)
        else:
            larger.append(value)
    return smaller + equal + larger
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'scan', label: 'Scan', description: 'Read each value and sort it into a group.' },
  { id: 'group', label: 'Group', description: 'Smaller, equal and larger values each keep their order.' },
  { id: 'done', label: 'Result', description: 'The three groups joined in order.' },
]

export function buildTrace({ nums, pivot }) {
  const frames = []
  const smaller = []
  const equal = []
  const larger = []
  nums.forEach((value, i) => {
    let group
    if (value < pivot) { smaller.push(value); group = 'smaller' }
    else if (value === pivot) { equal.push(value); group = 'equal' }
    else { larger.push(value); group = 'larger' }
    frames.push({ phase: group === 'smaller' ? 'group' : 'scan', activeLine: L(`${group === 'smaller' ? 'if (value < pivot)' : group === 'equal' ? 'else if (value === pivot)' : 'else larger.push'}`), pythonLine: P(group === 'smaller' ? 'if value < pivot' : group === 'equal' ? 'elif value == pivot' : 'larger.append'), message: `${value} is ${group} than ${pivot}; it joins the ${group} group.`, i, smaller: [...smaller], equal: [...equal], larger: [...larger], output: null })
  })
  const result = [...smaller, ...equal, ...larger]
  frames.push({ phase: 'done', activeLine: L('return [...smaller'), pythonLine: P('return smaller + equal'), message: `Groups joined: ${result.join(', ')}.`, i: -1, smaller, equal, larger, output: result })
  return { input: { nums, pivot }, result, frames }
}
