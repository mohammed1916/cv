// LeetCode 2164: Sort Even and Odd Indices Independently.
// Collect the values at even indices and sort them ascending; collect the values at odd indices and sort them
// descending. Then put them back in order, taking from each sorted list in turn.

export function parseInput(text) {
  let nums
  try { nums = JSON.parse(text) } catch { throw new Error('Use a JSON array of integers, e.g. [4,1,2,3].') }
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 30 || nums.some(v => !Number.isInteger(v) || v < 1 || v > 100)) {
    throw new Error('Use 1 to 30 integers from 1 to 100.')
  }
  return { nums }
}

export const code = `function sortEvenOdd(nums) {
  const evens = nums.filter((_, i) => i % 2 === 0).sort((a, b) => a - b)
  const odds = nums.filter((_, i) => i % 2 === 1).sort((a, b) => b - a)
  const result = []
  let e = 0
  let o = 0
  for (let i = 0; i < nums.length; i++) {
    result.push(i % 2 === 0 ? evens[e++] : odds[o++])
  }
  return result
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `# entry: sort_even_odd
def sort_even_odd(nums):
    evens = sorted(nums[0::2])
    odds = sorted(nums[1::2], reverse=True)
    result = []
    e = 0
    o = 0
    for i in range(len(nums)):
        if i % 2 == 0:
            result.append(evens[e])
            e += 1
        else:
            result.append(odds[o])
            o += 1
    return result
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
  { id: 'collect', label: 'Collect', description: 'Separate the even-index and odd-index values.' },
  { id: 'sort', label: 'Sort each group', description: 'Even indices ascending, odd indices descending.' },
  { id: 'place', label: 'Place back', description: 'Each index takes the next value from its group.' },
  { id: 'done', label: 'Result', description: 'The rearranged array.' },
]

export function buildTrace({ nums }) {
  const frames = []
  const evens = nums.filter((_, i) => i % 2 === 0).sort((a, b) => a - b)
  const odds = nums.filter((_, i) => i % 2 === 1).sort((a, b) => b - a)
  frames.push({ phase: 'collect', activeLine: L('const evens'), pythonLine: P('evens = sorted'), message: `Even indices sorted ascending: ${evens.join(', ')}. Odd indices sorted descending: ${odds.join(', ') || 'none'}.`, evens, odds, placed: [], i: -1 })
  const result = []
  let e = 0
  let o = 0
  for (let i = 0; i < nums.length; i++) {
    const value = i % 2 === 0 ? evens[e++] : odds[o++]
    result.push(value)
    frames.push({ phase: 'place', activeLine: L('result.push(i % 2'), pythonLine: P('result.append(evens[e])'), message: `Index ${i} (${i % 2 === 0 ? 'even' : 'odd'}) takes ${value}.`, evens, odds, placed: [...result], i })
  }
  frames.push({ phase: 'done', activeLine: L('return result'), pythonLine: P('return result'), message: `Result: ${result.join(', ')}.`, evens, odds, placed: [...result], i: -1 })
  return { input: { nums }, result, frames }
}
