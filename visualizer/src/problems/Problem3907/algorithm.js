export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a nums list.')
  const { nums } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12 || !nums.every(v => Number.isInteger(v) && v >= -9 && v <= 9)) {
    throw new Error('nums has 1 to 12 integers from -9 to 9.')
  }
  return { nums }
}

const parityOf = v => ((v % 2) + 2) % 2

// Scan from the right. Two sorted shelves hold the values seen so far, one per parity. For each index, the
// answer is how many values on the opposite-parity shelf are strictly smaller than nums[i].
export function buildTrace({ nums }) {
  const n = nums.length
  const shelves = [[], []]
  const result = Array(n).fill(0)
  const frames = []
  const snap = extra => ({ shelves: [shelves[0].slice(), shelves[1].slice()], result: result.slice(), ...extra })
  frames.push(snap({ pythonLine: PY('seen = {0: []'), phase: 'start', activeLine: L('shelves = two empty sorted lists'), i: -1, parity: null, count: null, message: 'Scan from the last index toward the first, with empty shelves.' }))
  for (let i = n - 1; i >= 0; i -= 1) {
    const parity = parityOf(nums[i])
    const opposite = shelves[1 - parity]
    frames.push(snap({ pythonLine: PY('for i in range(n - 1, -1, -1)'), phase: 'scan', activeLine: L('for i from the last index'), i, parity, count: null, message: `Index ${i} holds ${nums[i]} (${parity === 0 ? 'even' : 'odd'}); look at the ${parity === 0 ? 'odd' : 'even'} shelf.` }))
    const count = opposite.filter(v => v < nums[i]).length
    result[i] = count
    frames.push(snap({ pythonLine: PY('result[i] = bisect_left'), phase: 'count', activeLine: L('count = number of values'), i, parity, count, message: `${count} value${count === 1 ? '' : 's'} on the opposite shelf are smaller than ${nums[i]}.` }))
    const at = shelves[parity].findIndex(v => v > nums[i])
    if (at < 0) shelves[parity].push(nums[i])
    else shelves[parity].splice(at, 0, nums[i])
    frames.push(snap({ pythonLine: PY('insort(seen[parity]'), phase: 'insert', activeLine: L('insert nums[i] into its own shelf'), i, parity, count, message: `Place ${nums[i]} on the ${parity === 0 ? 'even' : 'odd'} shelf.` }))
  }
  frames.push(snap({ pythonLine: PY('return result'), phase: 'done', activeLine: L('return result'), i: -1, parity: null, count: null, message: `Counts in index order: [${result.join(', ')}].` }))
  return { input: { nums }, result: result.slice(), frames }
}

export const code = `count later smaller values of opposite parity for each index
  shelves = two empty sorted lists, one for even and one for odd values
  result = list of zeros with one entry per index
  for i from the last index down to 0
    parity = parity of nums[i]
    count = number of values on the opposite shelf that are smaller than nums[i]
    result[i] = count
    insert nums[i] into its own shelf in sorted order
  return result`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `from bisect import bisect_left, insort

def count_smaller(nums):
    n = len(nums)
    result = [0] * n
    seen = {0: [], 1: []}
    for i in range(n - 1, -1, -1):
        parity = nums[i] % 2
        result[i] = bisect_left(seen[1 - parity], nums[i])
        insort(seen[parity], nums[i])
    return result
`

const PY = s => {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}
