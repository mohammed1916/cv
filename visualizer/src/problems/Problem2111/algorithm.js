// LeetCode 2111: Minimum Operations to Make the Array K-Increasing.
// Positions in the same residue class mod k must be non-decreasing. Within each class, the values kept
// unchanged form a longest non-decreasing subsequence (found with patience tails and binary search);
// every other value in that class is changed once.

export function parseInput(text) {
  let data
  try { data = JSON.parse(text) } catch { throw new Error('Use a JSON object such as {"arr":[4,1,5,2,6,2],"k":2}.') }
  const { arr, k } = data ?? {}
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > 30 || arr.some(v => !Number.isInteger(v) || v < 1 || v > 50)) {
    throw new Error('arr must hold 1 to 30 positive integers up to 50.')
  }
  if (!Number.isInteger(k) || k < 1 || k > arr.length) throw new Error('k must be between 1 and the length of arr.')
  return { arr, k }
}

export const code = `function minOperations(arr, k) {
  let operations = 0
  for (let start = 0; start < k; start++) {
    const tails = []
    let size = 0
    for (let i = start; i < arr.length; i += k) {
      size++
      const x = arr[i]
      let lo = 0
      let hi = tails.length
      while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2)
        if (tails[mid] > x) hi = mid
        else lo = mid + 1
      }
      if (lo === tails.length) tails.push(x)
      else tails[lo] = x
    }
    operations += size - tails.length
  }
  return operations
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `# entry: min_operations
def min_operations(arr, k):
    operations = 0
    for start in range(k):
        tails = []
        size = 0
        for i in range(start, len(arr), k):
            size += 1
            x = arr[i]
            lo, hi = 0, len(tails)
            while lo < hi:
                mid = (lo + hi) // 2
                if tails[mid] > x:
                    hi = mid
                else:
                    lo = mid + 1
            if lo == len(tails):
                tails.append(x)
            else:
                tails[lo] = x
        operations += size - len(tails)
    return operations
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
  { id: 'class', label: 'Residue class', description: 'Positions start, start+k, start+2k, ... must be non-decreasing.' },
  { id: 'search', label: 'Find slot', description: 'Binary search on the tails: the first tail larger than the value.' },
  { id: 'place', label: 'Update tails', description: 'Append the value or replace the tail that it lowers.' },
  { id: 'done', label: 'Result', description: 'Changed values are the class size minus the kept values.' },
]

export function buildTrace({ arr, k }) {
  const frames = []
  let operations = 0
  const n = arr.length
  for (let start = 0; start < k; start++) {
    const tails = []
    let size = 0
    frames.push({ phase: 'class', activeLine: L('for (let start = 0'), pythonLine: P('for start in range'), message: `Class ${start}: positions ${start}, ${start + k}, ... must be non-decreasing.`, group: start, tails: [], lo: null, hi: null, mid: null, marks: groupMarks(n, k, start), operations })
    for (let i = start; i < n; i += k) {
      size++
      const x = arr[i]
      let lo = 0
      let hi = tails.length
      while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2)
        frames.push({ phase: 'search', activeLine: L('const mid'), pythonLine: P('mid = (lo + hi)'), message: `Value ${x} at position ${i}: compare with tail ${tails[mid]}.`, group: start, tails: [...tails], lo, hi, mid, x, marks: { ...groupMarks(n, k, start), [i]: 'value' }, operations })
        if (tails[mid] > x) hi = mid
        else lo = mid + 1
      }
      if (lo === tails.length) tails.push(x)
      else tails[lo] = x
      frames.push({ phase: 'place', activeLine: L('tails[lo] = x'), pythonLine: P('tails[lo] = x'), message: `${x} goes to tail slot ${lo}; ${tails.length} values can stay in this class so far.`, group: start, tails: [...tails], lo: null, hi: null, mid: null, x, marks: { ...groupMarks(n, k, start), [i]: 'value' }, operations })
    }
    operations += size - tails.length
  }
  frames.push({ phase: 'done', activeLine: L('return operations'), pythonLine: P('return operations'), message: `Total changes needed: ${operations}.`, group: -1, tails: [], lo: null, hi: null, mid: null, marks: {}, operations })
  return { input: { arr, k }, result: operations, frames }
}

function groupMarks(n, k, start) {
  const marks = {}
  for (let i = start; i < n; i += k) marks[i] = 'class'
  return marks
}
