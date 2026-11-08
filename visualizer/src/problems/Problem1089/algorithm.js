export const phases = [
  { id: 'start', label: 'Start', description: 'Keep the original digits in one array of fixed length.' },
  { id: 'count', label: 'Count zeros', description: 'Each zero adds one extra virtual slot, so count them first.' },
  { id: 'read', label: 'Read backward', description: 'Read each original value from the right, so unread values are never overwritten.' },
  { id: 'write', label: 'Write expansion', description: 'Write the value, and a second zero when it is zero, at the virtual slot if it fits.' },
  { id: 'done', label: 'Complete', description: 'The array holds the expanded values truncated to the original length.' },
]

export const code = `function duplicateZeros(arr) {
  const zeros = arr.filter(v => v === 0).length
  let last = arr.length + zeros - 1
  for (let src = arr.length - 1; src >= 0; src--) {
    const value = arr[src]
    if (last < arr.length) arr[last] = value
    last -= 1
    if (value === 0) {
      if (last < arr.length) arr[last] = 0
      last -= 1
    }
  }
  return arr
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def duplicate_zeros(arr):
    zeros = arr.count(0)
    last = len(arr) + zeros - 1
    for src in range(len(arr) - 1, -1, -1):
        value = arr[src]
        if last < len(arr): arr[last] = value
        last -= 1
        if value == 0:
            if last < len(arr): arr[last] = 0
            last -= 1
    return arr
`

const codeLine = key => code.findIndex(line => line.text.includes(key)) + 1
const pythonLine = key => python.split('\n').findIndex(line => line.includes(key)) + 1

export function parseInput(text) {
  const arr = JSON.parse(text)
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > 20) throw new Error('Use a JSON array of 1 to 20 digits.')
  if (!arr.every(v => Number.isInteger(v) && v >= 0 && v <= 9)) throw new Error('Values must be single digits from 0 to 9.')
  return arr
}

export function buildTrace(input) {
  const arr = [...input]
  const n = arr.length
  const frames = []
  let last = null
  const push = (phase, key, message, extra = {}, pyKey = key) => frames.push({
    phase,
    activeLine: codeLine(key),
    pythonLine: pythonLine(pyKey),
    message,
    state: { arr: [...arr], n, last, src: null, value: null, ...extra },
  })

  push('start', 'const zeros = arr.filter', `Array length ${n}. Positions past the end are discarded.`, {}, 'zeros = arr.count(0)')
  const zeros = arr.filter(v => v === 0).length
  last = n + zeros - 1
  push('count', 'const zeros = arr.filter', `${zeros} zeros, so the expanded array has length ${n + zeros}. Its last slot is virtual index ${last}.`, {}, 'zeros = arr.count(0)')

  for (let src = n - 1; src >= 0; src--) {
    const value = arr[src]
    push('read', 'value = arr[src]', `Read ${value} from original index ${src}.`, { src, value })
    if (last < n) {
      arr[last] = value
      push('write', 'if (last < arr.length) arr[last] = value', `Write ${value} at index ${last}.`, { src, value }, 'if last < len(arr): arr[last] = value')
    } else {
      push('write', 'if (last < arr.length) arr[last] = value', `Virtual index ${last} is past the end, so ${value} is discarded.`, { src, value }, 'if last < len(arr): arr[last] = value')
    }
    last -= 1
    if (value === 0) {
      if (last < n) {
        arr[last] = 0
        push('write', 'if (last < arr.length) arr[last] = 0', `The zero also writes a second copy at index ${last}.`, { src, value }, 'if last < len(arr): arr[last] = 0')
      } else {
        push('write', 'if (last < arr.length) arr[last] = 0', `The second copy would land at ${last}, past the end, so it is discarded.`, { src, value }, 'if last < len(arr): arr[last] = 0')
      }
      last -= 1
    }
  }
  push('done', 'return arr', `Final array: [${arr.join(', ')}].`)
  return { input, result: arr, frames }
}

export const inputLabel = 'JSON array of single digits'
export const complexity = 'O(n) time and O(1) extra space. Writes go backward, so no unread value is overwritten.'
export const examples = [
  { label: 'Zeros in the middle', input: '[3,0,7,2,0,5]' },
  { label: 'Leading zero', input: '[0,3,9]' },
  { label: 'No zeros', input: '[8,9]' },
  { label: 'Single zero', input: '[0]' },
  { label: 'Adjacent zeros shift twice', input: '[1,0,0,2]' },
  { label: 'Zero at the end', input: '[4,5,0]' },
  { label: 'Twenty nines, no zeros', input: '[9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9]' },
  { label: 'Long run: 20 digits', input: '[3,0,9,6,7,8,5,6,0,5,6,6,6,6,1,7,4,7,0,1]' },
]
