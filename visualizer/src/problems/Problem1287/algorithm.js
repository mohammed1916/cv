export const phases = [
  { id: 'start', label: 'Start', description: 'Begin at the first position of the sorted array with no run measured yet.' },
  { id: 'begin', label: 'Begin run', description: 'Start a run at the current position; equal values are adjacent because the array is sorted.' },
  { id: 'extend', label: 'Extend run', description: 'Move right while the value stays the same, growing the run length.' },
  { id: 'check', label: 'Compare quarter', description: 'A value is the answer when its run is longer than a quarter of the array.' },
  { id: 'found', label: 'Answer found', description: 'This run is more than 25% of the array, so its value is returned.' },
  { id: 'done', label: 'Complete', description: 'No run exceeded the quarter threshold, so there is no answer.' },
]

export function parseInput(text) {
  const arr = JSON.parse(text)
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > 100) throw new Error('Use a JSON array of 1 to 100 sorted integers, such as [1, 1, 2, 2, 2].')
  if (!arr.every(v => Number.isInteger(v) && Math.abs(v) <= 1000)) throw new Error('Every value must be an integer from -1000 to 1000.')
  for (let i = 1; i < arr.length; i++) if (arr[i] < arr[i - 1]) throw new Error('The array must be sorted in non-decreasing order.')
  return arr
}

export function buildTrace(arr) {
  const n = arr.length
  const frames = []
  const snap = (start, end, found) => ({ start, end, found, runLength: end === null || start === null ? 0 : end - start, n })
  frames.push({ phase: 'start', activeLine: L('set i to 0'), pythonLine: P('i = 0'), snapshot: snap(null, null, null), message: `The array has ${n} sorted values. A value needs more than ${n / 4} copies to qualify.` })
  let i = 0
  let result = null
  while (i < n && result === null) {
    frames.push({ phase: 'begin', activeLine: L('start a run'), pythonLine: P('j = i'), snapshot: snap(i, i + 1, null), message: `Start a run at index ${i} with value ${arr[i]}.` })
    let j = i + 1
    while (j < n && arr[j] === arr[i]) {
      j++
      frames.push({ phase: 'extend', activeLine: L('set j to'), pythonLine: P('while j < n'), snapshot: snap(i, j, null), message: `Index ${j - 1} also holds ${arr[i]}; the run now has ${j - i} values.` })
    }
    const len = j - i
    frames.push({ phase: 'check', activeLine: L('if 4 * (j - i)'), pythonLine: P('if 4 * (j - i)'), snapshot: snap(i, j, null), message: `${len} copies of ${arr[i]} out of ${n}: ${4 * len > n ? 'more than' : 'not more than'} a quarter.` })
    if (4 * len > n) {
      result = arr[i]
      frames.push({ phase: 'found', activeLine: L('return v'), pythonLine: P('return arr[i]'), snapshot: snap(i, j, result), message: `${arr[i]} appears ${len} times, which is more than 25%.` })
      break
    }
    i = j
  }
  frames.push({ phase: 'done', activeLine: L('return none'), pythonLine: P('return None'), snapshot: snap(null, null, result), message: result === null ? 'No run is longer than a quarter, so there is no answer.' : `Return ${result}.` })
  return { input: arr, result, frames }
}

export const code = `find the quarter value in a sorted array:
  set i to 0
  while i is inside the array:
    start a run at i with value v
    set j to the first index after i that differs from v
    if 4 * (j - i) is more than the array length:
      return v
    set i to j
  return none`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def find_quarter_value(arr):
    n = len(arr)
    i = 0
    while i < n:
        j = i + 1
        while j < n and arr[j] == arr[i]:
            j += 1
        if 4 * (j - i) > n:
            return arr[i]
        i = j
    return None
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
