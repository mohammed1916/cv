export const phases = [
  { id: 'start', label: 'Start', description: 'Read the arrangement. We want the largest arrangement that is still smaller, using at most one swap.' },
  { id: 'scan', label: 'Find pivot', description: 'Scan from the right for the first position whose value is larger than the value after it.' },
  { id: 'pivot', label: 'Pivot found', description: 'This position is the rightmost place where a smaller arrangement can start.' },
  { id: 'partner', label: 'Pick partner', description: 'In the suffix, take the largest value that is still smaller than the pivot value.' },
  { id: 'duplicate', label: 'Leftmost copy', description: 'If that value repeats, use its leftmost copy so the larger value moves as far left as possible.' },
  { id: 'swap', label: 'Swap', description: 'Swap the pivot with the chosen partner.' },
  { id: 'done', label: 'Complete', description: 'The arrangement after the swap is the answer, or the input itself when no smaller one exists.' },
]

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.arr)) {
    throw new Error('Use an object with an arr array, for example {"arr":[3,1,2]}.')
  }
  const { arr } = data
  if (arr.length < 1 || arr.length > 40) throw new Error('arr must have 1 to 40 values.')
  if (!arr.every(v => Number.isInteger(v) && v >= 1 && v <= 100)) throw new Error('Each value must be an integer from 1 to 100.')
  return { arr }
}

const pseudo = `previous_permutation(arr):
  i = len(arr) - 2
  while i >= 0 and arr[i] <= arr[i + 1]: move i left
  if i < 0: return arr unchanged
  j = len(arr) - 1
  while arr[j] >= arr[i]: move j left
  k = j
  while arr[k - 1] equals arr[j]: move k left
  swap arr[i] and arr[k]
  return arr`
const py = `def previous_permutation(arr):
    i = len(arr) - 2
    while i >= 0 and arr[i] <= arr[i + 1]: i -= 1
    if i < 0: return arr
    j = len(arr) - 1
    while arr[j] >= arr[i]: j -= 1
    k = j
    while arr[k - 1] == arr[j]: k -= 1
    arr[i], arr[k] = arr[k], arr[i]
    return arr`

export const code = pseudo.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = py

const LINE = { start: 1, scan: 3, pivot: 4, partner: 6, duplicate: 8, swap: 9, done: 10 }

export function buildTrace(input) {
  const frames = []
  const arr = [...input.arr]
  const snap = (extra = {}) => ({ arr: [...arr], i: -1, j: -1, k: -1, swapped: null, ...extra })

  frames.push({ phase: 'start', activeLine: LINE.start, message: `Start with [${arr.join(', ')}]. The goal is the largest arrangement that is still smaller, using at most one swap.`, snapshot: snap() })

  // The suffix after the pivot is nondecreasing, so scanning from the right finds the pivot first.
  let i = arr.length - 2
  while (i >= 0) {
    frames.push({ phase: 'scan', activeLine: LINE.scan, message: `Compare arr[${i}] = ${arr[i]} with arr[${i + 1}] = ${arr[i + 1]}. ${arr[i] > arr[i + 1] ? 'The left value is larger, so this is the pivot.' : 'The left value is not larger, so move left.'}`, snapshot: snap({ i }) })
    if (arr[i] > arr[i + 1]) break
    i -= 1
  }

  if (i < 0) {
    frames.push({ phase: 'pivot', activeLine: LINE.pivot, message: 'No position has a larger value before a smaller one. The arrangement is already the smallest, so it is returned unchanged.', snapshot: snap() })
    frames.push({ phase: 'done', activeLine: LINE.done, message: 'No single swap makes it smaller, so the answer is the input itself.', snapshot: snap() })
    return { input, result: [...arr], frames }
  }
  frames.push({ phase: 'pivot', activeLine: LINE.pivot, message: `Position ${i} (value ${arr[i]}) is the pivot. Everything after it is nondecreasing.`, snapshot: snap({ i }) })

  let j = arr.length - 1
  while (arr[j] >= arr[i]) {
    frames.push({ phase: 'partner', activeLine: LINE.partner, message: `arr[${j}] = ${arr[j]} is not below the pivot ${arr[i]}, so look further left.`, snapshot: snap({ i, j }) })
    j -= 1
  }
  frames.push({ phase: 'partner', activeLine: LINE.partner, message: `arr[${j}] = ${arr[j]} is the largest value below the pivot ${arr[i]}. It is the best partner.`, snapshot: snap({ i, j }) })

  let k = j
  while (arr[k - 1] === arr[j]) {
    k -= 1
    frames.push({ phase: 'duplicate', activeLine: LINE.duplicate, message: `arr[${k}] also holds ${arr[j]}. Keep moving to its leftmost copy.`, snapshot: snap({ i, j, k }) })
  }
  frames.push({ phase: 'duplicate', activeLine: LINE.duplicate, message: `Use the leftmost copy of ${arr[j]}, at position ${k}.`, snapshot: snap({ i, j, k }) })

  ;[arr[i], arr[k]] = [arr[k], arr[i]]
  frames.push({ phase: 'swap', activeLine: LINE.swap, message: `Swap positions ${i} and ${k}. Now [${arr.join(', ')}].`, snapshot: snap({ i, j, k, swapped: [i, k] }) })
  frames.push({ phase: 'done', activeLine: LINE.done, message: `The arrangement [${arr.join(', ')}] is the answer.`, snapshot: snap({ i, j, k, swapped: [i, k] }) })
  return { input, result: arr, frames }
}
