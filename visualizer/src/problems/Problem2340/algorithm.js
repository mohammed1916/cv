// LeetCode 2340: Minimum Adjacent Swaps to Make a Valid Array.
// A valid array has a minimum at the front and a maximum at the back. Move the leftmost minimum to the
// front with adjacent swaps, then move the rightmost maximum (recomputed after that) to the back.
// Moving a value past an element costs one swap, and that is the least possible for each move.

const MAX_LEN = 10
const MAX_VALUE = 10

export function parseInput(text) {
  let nums
  try { nums = JSON.parse(text) } catch { throw new Error('Use a JSON array of integers, e.g. [3,5,2,7,1,4].') }
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > MAX_LEN) throw new Error(`Use 1 to ${MAX_LEN} integers. The visualization caps the length at ${MAX_LEN}.`)
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= MAX_VALUE)) throw new Error(`Values are integers from 1 to ${MAX_VALUE}.`)
  return { nums }
}

export const code = `FUNCTION minSwaps(nums)
    lo ← smallest value; hi ← largest value
    swaps ← 0
    p ← first index holding lo
    FOR k from p DOWN TO 1
        swap nums[k - 1] and nums[k]; swaps ← swaps + 1
    q ← last index holding hi in the current array
    FOR k from q UP TO len(nums) - 2
        swap nums[k] and nums[k + 1]; swaps ← swaps + 1
    RETURN swaps`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def min_swaps(nums):
    nums = list(nums)
    n = len(nums)
    lo, hi = min(nums), max(nums)
    swaps = 0
    p = nums.index(lo)
    for k in range(p, 0, -1):
        nums[k - 1], nums[k] = nums[k], nums[k - 1]
        swaps += 1
    q = max(i for i in range(n) if nums[i] == hi)
    for k in range(q, n - 1):
        nums[k], nums[k + 1] = nums[k + 1], nums[k]
        swaps += 1
    return swaps
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
  { id: 'start', label: 'Targets', description: 'Find the smallest and largest values.' },
  { id: 'front', label: 'Min to front', description: 'Swap the minimum leftwards.' },
  { id: 'back', label: 'Max to back', description: 'Swap the maximum rightwards.' },
  { id: 'done', label: 'Result', description: 'Total adjacent swaps.' },
]

export function buildTrace({ nums }) {
  const a = [...nums]
  const n = a.length
  const lo = Math.min(...a)
  const hi = Math.max(...a)
  const frames = []
  let swaps = 0
  frames.push({ phase: 'start', activeLine: L('lo ← smallest'), pythonLine: P('lo, hi = min(nums)'), message: `Smallest ${lo}, largest ${hi}.`, array: a.slice(), moving: -1, swapped: null, swaps })
  const p = a.indexOf(lo)
  for (let k = p; k > 0; k--) {
    ;[a[k - 1], a[k]] = [a[k], a[k - 1]]
    swaps++
    frames.push({ phase: 'front', activeLine: L('swap nums[k - 1] and nums[k]'),pythonLine: P('for k in range(p, 0, -1)'), message: `Swap moves ${lo} left to index ${k - 1}. Swaps ${swaps}.`, array: a.slice(), moving: k - 1, swapped: [k - 1, k], swaps })
  }
  const q = a.lastIndexOf(hi)
  frames.push({ phase: 'back', activeLine: L('q ← last index'), pythonLine: P('q = max(i for i'), message: `Largest ${hi} sits at index ${q} now.`, array: a.slice(), moving: q, swapped: null, swaps })
  for (let k = q; k < n - 1; k++) {
    ;[a[k], a[k + 1]] = [a[k + 1], a[k]]
    swaps++
    frames.push({ phase: 'back', activeLine: L('swap nums[k] and nums[k + 1]'), pythonLine: P('for k in range(q, n - 1)'), message: `Swap moves ${hi} right to index ${k + 1}. Swaps ${swaps}.`, array: a.slice(), moving: k + 1, swapped: [k, k + 1], swaps })
  }
  frames.push({ phase: 'done', activeLine: L('RETURN swaps'), pythonLine: P('return swaps'), message: `Valid array after ${swaps} swap${swaps === 1 ? '' : 's'}.`, array: a.slice(), moving: -1, swapped: null, swaps })
  return { input: { nums }, result: swaps, frames }
}
