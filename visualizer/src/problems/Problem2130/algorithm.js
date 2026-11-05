// LeetCode 2130: Maximum Twin Sum of a Linked List.
// Node i and node n-1-i are twins. Walking one pointer from each end pairs twins directly.
// The list is given here as an array of its values, in order.

export function parseInput(text) {
  let values
  try { values = JSON.parse(text) } catch { throw new Error('Use a JSON array of node values with even length, e.g. [5,4,2,1].') }
  if (!Array.isArray(values) || values.length < 2 || values.length > 40 || values.length % 2 !== 0 || values.some(v => !Number.isInteger(v) || v < 1 || v > 100000)) {
    throw new Error('Use an even number of node values (2 to 40), each an integer from 1 to 100000.')
  }
  return { values }
}

export const code = `function maxTwinSum(values) {
  let l = 0
  let r = values.length - 1
  let best = 0
  while (l < r) {
    best = Math.max(best, values[l] + values[r])
    l++
    r--
  }
  return best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `# entry: max_twin_sum
def max_twin_sum(values):
    l = 0
    r = len(values) - 1
    best = 0
    while l < r:
        best = max(best, values[l] + values[r])
        l += 1
        r -= 1
    return best
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
  { id: 'start', label: 'Ends', description: 'Put one pointer on the head and one on the last node.' },
  { id: 'pair', label: 'Twin pair', description: 'The two pointed nodes are twins; add their values.' },
  { id: 'move', label: 'Move inward', description: 'Both pointers step toward the middle.' },
  { id: 'done', label: 'Result', description: 'The largest twin sum.' },
]

export function buildTrace({ values }) {
  const frames = []
  let l = 0
  let r = values.length - 1
  let best = 0
  frames.push({ phase: 'start', activeLine: L('let l = 0'), pythonLine: P('l = 0'), message: 'Pointers start at the head and the last node.', l, r, sum: null, best, pairs: [] })
  const pairs = []
  while (l < r) {
    const sum = values[l] + values[r]
    best = Math.max(best, sum)
    pairs.push({ left: values[l], right: values[r], sum })
    frames.push({ phase: 'pair', activeLine: L('best = Math.max'), pythonLine: P('best = max'), message: `Twins ${values[l]} + ${values[r]} = ${sum}; best ${best}.`, l, r, sum, best, pairs: [...pairs] })
    l++
    r--
    if (l < r) frames.push({ phase: 'move', activeLine: L('l++'), pythonLine: P('l += 1'), message: 'Move both pointers one node inward.', l, r, sum: null, best, pairs: [...pairs] })
  }
  frames.push({ phase: 'done', activeLine: L('return best'), pythonLine: P('return best'), message: `The maximum twin sum is ${best}.`, l: -1, r: -1, sum: null, best, pairs: [...pairs] })
  return { input: { values }, result: best, frames }
}
