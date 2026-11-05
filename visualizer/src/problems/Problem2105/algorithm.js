// LeetCode 2105: Watering Plants II.
// Alice walks left to right and Bob right to left with two pointers, refilling when a can runs short.
// When both reach the same plant, the one holding more water waters it (Alice on a tie).

export function parseInput(text) {
  let data
  try { data = JSON.parse(text) } catch { throw new Error('Use a JSON object such as {"plants":[2,2,3,3],"capacityA":5,"capacityB":5}.') }
  const { plants, capacityA, capacityB } = data ?? {}
  if (!Array.isArray(plants) || plants.length < 1 || plants.length > 40 || plants.some(v => !Number.isInteger(v) || v < 1 || v > 50)) {
    throw new Error('plants must hold 1 to 40 integers from 1 to 50.')
  }
  const biggest = Math.max(...plants)
  if (!Number.isInteger(capacityA) || !Number.isInteger(capacityB) || capacityA < biggest || capacityB < biggest || capacityA > 100 || capacityB > 100) {
    throw new Error(`Both capacities must be integers from ${biggest} to 100 (at least the largest plant).`)
  }
  return { plants, capacityA, capacityB }
}

export const code = `function refills(plants, capacityA, capacityB) {
  let a = capacityA
  let b = capacityB
  let count = 0
  let l = 0
  let r = plants.length - 1
  while (l < r) {
    if (a < plants[l]) { count++; a = capacityA }
    a -= plants[l++]
    if (b < plants[r]) { count++; b = capacityB }
    b -= plants[r--]
  }
  if (l === r && Math.max(a, b) < plants[l]) count++
  return count
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `# entry: refills
def refills(plants, capacityA, capacityB):
    a = capacityA
    b = capacityB
    count = 0
    l = 0
    r = len(plants) - 1
    while l < r:
        if a < plants[l]:
            count += 1
            a = capacityA
        a -= plants[l]
        l += 1
        if b < plants[r]:
            count += 1
            b = capacityB
        b -= plants[r]
        r -= 1
    if l == r and max(a, b) < plants[l]:
        count += 1
    return count
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
  { id: 'start', label: 'Full cans', description: 'Both watering cans start full at opposite ends.' },
  { id: 'walk', label: 'Walk inward', description: 'Alice moves right and Bob moves left, one plant each per step.' },
  { id: 'refill', label: 'Refill', description: 'A can that cannot cover its plant is refilled first.' },
  { id: 'meet', label: 'Meet', description: 'If they reach one plant, the fuller can waters it.' },
  { id: 'done', label: 'Result', description: 'The total number of refills.' },
]

export function buildTrace({ plants, capacityA, capacityB }) {
  const frames = []
  let a = capacityA
  let b = capacityB
  let count = 0
  let l = 0
  let r = plants.length - 1
  const state = (extra = {}) => ({ l, r, a, b, count, ...extra })
  frames.push({ phase: 'start', activeLine: L('let a = capacityA'), pythonLine: P('a = capacityA'), message: `Alice has ${a} and Bob has ${b}; they start at plant 0 and plant ${r}.`, ...state(), marks: { [l]: 'Alice', [r]: 'Bob' } })
  while (l < r) {
    const marks = { [l]: 'Alice', [r]: 'Bob' }
    if (a < plants[l]) { count++; a = capacityA; frames.push({ phase: 'refill', activeLine: L('if (a < plants[l])'), pythonLine: P('if a < plants[l]'), message: `Alice refills to ${a} before plant ${l}.`, ...state({ refilled: 'A' }), marks }) }
    a -= plants[l]
    frames.push({ phase: 'walk', activeLine: L('a -= plants[l++]'), pythonLine: P('a -= plants[l]'), message: `Alice waters plant ${l} (${plants[l]} units), leaving ${a}.`, ...state(), marks })
    l++
    if (b < plants[r]) { count++; b = capacityB; frames.push({ phase: 'refill', activeLine: L('if (b < plants[r])'), pythonLine: P('if b < plants[r]'), message: `Bob refills to ${b} before plant ${r}.`, ...state({ refilled: 'B' }), marks: { [l]: 'Alice', [r]: 'Bob' } }) }
    b -= plants[r]
    frames.push({ phase: 'walk', activeLine: L('b -= plants[r--]'), pythonLine: P('b -= plants[r]'), message: `Bob waters plant ${r} (${plants[r]} units), leaving ${b}.`, ...state(), marks: { [l]: 'Alice', [r]: 'Bob' } })
    r--
  }
  if (l === r) {
    const needRefill = Math.max(a, b) < plants[l]
    if (needRefill) count++
    frames.push({ phase: 'meet', activeLine: L('if (l === r'), pythonLine: P('if l == r'), message: `Both reach plant ${l}; ${a >= b ? 'Alice' : 'Bob'} has the fuller can (${Math.max(a, b)} for ${plants[l]} units) ${needRefill ? 'and needs one refill' : 'and needs no refill'}.`, ...state(), marks: { [l]: 'meet' } })
  }
  frames.push({ phase: 'done', activeLine: L('return count'), pythonLine: P('return count'), message: `Total refills: ${count}.`, ...state(), marks: {} })
  return { input: { plants, capacityA, capacityB }, result: count, frames }
}
