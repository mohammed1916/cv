const lines = text => text.split('\n').map((t, i) => ({ line: i + 1, text: t }))
const frame = (phase, line, message, state = {}) => ({ phase, pythonLine: line, activeLine: line, message, state })
export const PHASES = [
  { id: 'setup', label: 'Setup', description: 'Read the input and prepare the model.' },
  { id: 'step', label: 'Step', description: 'Process one event or item.' },
  { id: 'done', label: 'Result', description: 'The final value.' },
]
export const INPUT_LABEL = 'Object with arr (sorted integers, 1 to 12 items) and target (integer)'
export const URL = 'https://leetcode.com/problems/array-upper-bound/'
export const COMPLEXITY = 'O(log n) time for the binary search. This model returns the last index of the target, or -1.'
export const EXAMPLES = [
  { label: 'Found', input: '{"arr":[1,2,2,2,5],"target":2}' },
  { label: 'Missing', input: '{"arr":[1,2,2,2,5],"target":3}' },
]
export const WHY = [
  'The sorted list lets a binary search halve the range each step instead of checking every item.',
  'Searching for the first index whose value is greater than the target finds the boundary just after every copy of it.',
  'The index just before that boundary is the last copy, if it equals the target.',
]
export function parseInput(text) {
  const input = JSON.parse(text)
  if (!Array.isArray(input?.arr) || input.arr.length < 1 || input.arr.length > 12) throw new Error('arr has 1 to 12 items.')
  if (!input.arr.every(Number.isInteger) || input.arr.some((v, i) => i > 0 && v < input.arr[i - 1])) throw new Error('arr must be sorted integers.')
  if (!Number.isInteger(input.target)) throw new Error('target is an integer.')
  return input
}
export function buildTrace({ arr, target }) {
  let lo = 0
  let hi = arr.length
  const frames = [frame('setup', 1, `Search for the boundary after ${target}.`, { lo, hi })]
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (arr[mid] <= target) {
      frames.push(frame('step', 4, `arr[${mid}] = ${arr[mid]} is not above ${target}; search right.`, { lo, hi, mid }))
      lo = mid + 1
    } else {
      frames.push(frame('step', 5, `arr[${mid}] = ${arr[mid]} is above ${target}; search left.`, { lo, hi, mid }))
      hi = mid
    }
  }
  const last = lo - 1
  const result = last >= 0 && arr[last] === target ? last : -1
  frames.push(frame('done', 7, result === -1 ? 'No copy of the target.' : `Last copy is at index ${result}.`, { boundary: lo, result }))
  return { input: { arr, target }, result, frames }
}
export const code = lines(`set lo to 0 and hi to the length
while lo is less than hi
  mid is the middle of lo and hi
  if arr[mid] is at most target then lo = mid plus one
  otherwise hi = mid
if the item before lo equals target return its index
return -1`)
export const python = `def last_index(arr, target):
    lo, hi = 0, len(arr)
    while lo < hi:
        mid = (lo + hi) // 2
        if arr[mid] <= target:
            lo = mid + 1
        else:
            hi = mid
    last = lo - 1
    return last if last >= 0 and arr[last] == target else -1`
