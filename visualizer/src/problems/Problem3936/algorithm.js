export const phases = [
  { id: 'start', label: 'Zones', description: 'Split the array into a head and a tail.' },
  { id: 'plan', label: 'Pair', description: 'List misplaced zeros in the head and misplaced values in the tail.' },
  { id: 'swap', label: 'Swap', description: 'Exchange one misplaced pair.' },
  { id: 'done', label: 'Result', description: 'Report the number of swaps.' },
]

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('Use a JSON array of 1 to 12 integers.')
  if (!nums.every(v => Number.isInteger(v) && v >= 0 && v <= 9)) throw new Error('Each value is an integer from 0 to 9.')
  return { nums }
}

export function buildTrace({ nums }) {
  const n = nums.length
  const zeros = nums.filter(v => v === 0).length
  const boundary = n - zeros
  const head = []
  const tail = []
  for (let i = 0; i < boundary; i++) if (nums[i] === 0) head.push(i)
  for (let i = boundary; i < n; i++) if (nums[i] !== 0) tail.push(i)
  const arr = nums.slice()
  let swaps = 0
  const frames = [{ phase: 'start', activeLine: L('let zeros be'), pythonLine: P('zeros = nums.count'), message: `There are ${zeros} zero${zeros === 1 ? '' : 's'}, so the last ${zeros} slot${zeros === 1 ? '' : 's'} must hold zeros.`, arr: arr.slice(), boundary, head: [], tail: [], left: -1, right: -1, swaps }]
  frames.push({ phase: 'plan', activeLine: L('let tail be'), pythonLine: P('tail = ['), message: `${head.length} misplaced zero${head.length === 1 ? '' : 's'} sit before the boundary and ${tail.length} misplaced value${tail.length === 1 ? '' : 's'} sit after it.`, arr: arr.slice(), boundary, head: head.slice(), tail: tail.slice(), left: -1, right: -1, swaps })
  for (let k = 0; k < head.length; k++) {
    const left = head[k]
    const right = tail[k]
    arr[left] = nums[right]
    arr[right] = nums[left]
    swaps++
    frames.push({ phase: 'swap', activeLine: L('swap the values'), pythonLine: P('arr[left], arr[right]'), message: `Swap positions ${left} and ${right}: the zero moves toward the end.`, arr: arr.slice(), boundary, head: head.slice(), tail: tail.slice(), left, right, swaps })
  }
  frames.push({ phase: 'done', activeLine: L('return swaps'), pythonLine: P('return swaps'), message: `${swaps} swap${swaps === 1 ? '' : 's'} place every zero after every non-zero.`, arr: arr.slice(), boundary, head: head.slice(), tail: tail.slice(), left: -1, right: -1, swaps })
  return { input: { nums }, result: swaps, frames }
}

export const code = `minimum swaps to move zeros to the end
  let zeros be the number of zeros
  let boundary be n minus zeros
  let head be the zeros that sit before the boundary
  let tail be the non-zeros that sit at or after the boundary
  for each pair (left, right) taken from head and tail
    swap the values at left and right and add one to swaps
  return swaps`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(line => line.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def min_swaps_zeros_to_end(nums):
    n = len(nums)
    zeros = nums.count(0)
    boundary = n - zeros
    head = [i for i in range(boundary) if nums[i] == 0]
    tail = [i for i in range(boundary, n) if nums[i] != 0]
    arr = nums[:]
    swaps = 0
    for left, right in zip(head, tail):
        arr[left], arr[right] = arr[right], arr[left]
        swaps += 1
    return swaps`

const pyLines = python.split('\n')
const P = s => {
  const index = pyLines.findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}
