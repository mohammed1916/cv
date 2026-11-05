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

// Each line of JavaScript is paired with the Python line on the same row.
const LINES = [
  ['function previousPermutationWithOneSwap(arr) {', 'def previous_permutation(arr):'],
  ['  let i = arr.length - 2', '    i = len(arr) - 2'],
  ['  while (i >= 0 && arr[i] <= arr[i + 1]) i--', '    while i >= 0 and arr[i] <= arr[i + 1]: i -= 1'],
  ['  if (i < 0) return arr', '    if i < 0: return arr'],
  ['  let j = arr.length - 1', '    j = len(arr) - 1'],
  ['  while (arr[j] >= arr[i]) j--', '    while arr[j] >= arr[i]: j -= 1'],
  ['  let k = j', '    k = j'],
  ['  while (arr[k - 1] === arr[j]) k--', '    while arr[k - 1] == arr[j]: k -= 1'],
  ['  ;[arr[i], arr[k]] = [arr[k], arr[i]]', '    arr[i], arr[k] = arr[k], arr[i]'],
  ['  return arr', '    return arr'],
  ['}', ''],
]
const codeLines = LINES.map(([js]) => js)
export const code = codeLines.map((text, index) => ({ line: index + 1, text }))
const L = s => codeLines.findIndex(c => c.includes(s)) + 1
export const python = LINES.map(([, py]) => py).join('\n')
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export function buildTrace(input) {
  const frames = []
  const arr = [...input.arr]
  const snap = (extra = {}) => ({ arr: [...arr], i: -1, j: -1, k: -1, swapped: null, ...extra })
  const at = (phase, pythonLine, activeLine, message, extra) => frames.push({ phase, pythonLine, activeLine, message, snapshot: snap(extra) })

  at('start', P('i = len(arr) - 2'), L('let i = arr.length - 2'), `Start with [${arr.join(', ')}]. The goal is the largest arrangement that is still smaller, using at most one swap.`)

  // The suffix after the pivot is nondecreasing, so scanning from the right finds the pivot first.
  let i = arr.length - 2
  while (i >= 0) {
    at('scan', P('while i >= 0 and'), L('while (i >= 0'), `Compare arr[${i}] = ${arr[i]} with arr[${i + 1}] = ${arr[i + 1]}. ${arr[i] > arr[i + 1] ? 'The left value is larger, so this is the pivot.' : 'The left value is not larger, so move left.'}`, { i })
    if (arr[i] > arr[i + 1]) break
    i -= 1
  }

  if (i < 0) {
    at('pivot', P('if i < 0'), L('if (i < 0)'), 'No position has a larger value before a smaller one. The arrangement is already the smallest, so it is returned unchanged.')
    at('done', P('return arr'), L('return arr'), 'No single swap makes it smaller, so the answer is the input itself.')
    return { input, result: [...arr], frames }
  }
  at('pivot', P('j = len(arr) - 1'), L('let j = arr.length - 1'), `Position ${i} (value ${arr[i]}) is the pivot. Everything after it is nondecreasing.`, { i })

  let j = arr.length - 1
  while (arr[j] >= arr[i]) {
    at('partner', P('while arr[j] >= arr[i]'), L('while (arr[j] >= arr[i])'), `arr[${j}] = ${arr[j]} is not below the pivot ${arr[i]}, so look further left.`, { i, j })
    j -= 1
  }
  at('partner', P('while arr[j] >= arr[i]'), L('while (arr[j] >= arr[i])'), `arr[${j}] = ${arr[j]} is the largest value below the pivot ${arr[i]}. It is the best partner.`, { i, j })

  let k = j
  while (arr[k - 1] === arr[j]) {
    k -= 1
    at('duplicate', P('while arr[k - 1]'), L('while (arr[k - 1]'), `arr[${k}] also holds ${arr[j]}. Keep moving to its leftmost copy.`, { i, j, k })
  }
  at('duplicate', P('k = j'), L('let k = j'), `Use the leftmost copy of ${arr[j]}, at position ${k}.`, { i, j, k })

  ;[arr[i], arr[k]] = [arr[k], arr[i]]
  at('swap', P('arr[i], arr[k] = arr[k]'), L('[arr[i], arr[k]]'), `Swap positions ${i} and ${k}. Now [${arr.join(', ')}].`, { i, j, k, swapped: [i, k] })
  at('done', P('return arr'), L('return arr'), `The arrangement [${arr.join(', ')}] is the answer.`, { i, j, k, swapped: [i, k] })
  return { input, result: arr, frames }
}
