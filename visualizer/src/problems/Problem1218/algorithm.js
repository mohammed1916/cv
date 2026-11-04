// Own wording and sample data. The value-to-length map follows the Python solution in `python`.
export const phases = [
  { id: 'start', label: 'Start', description: 'No value has been seen, so no chain exists yet.' },
  { id: 'extend', label: 'Look back', description: 'The only possible predecessor of x is x minus the difference, so read its best chain length.' },
  { id: 'record', label: 'Record chain', description: 'Store the chain length ending at x and update the best overall answer.' },
  { id: 'done', label: 'Result', description: 'Return the longest chain found.' },
]

export const inputLabel = 'Object with arr (integers) and difference (JSON)'
export const complexity = 'O(n) expected time with a hash map, where n is the array length. The visualizer caps arr at 12 values from -10 to 10.'
export const examples = [
  { label: 'Step of two', input: '{"arr":[7,1,5,3,9,-1,4,-2],"difference":2}' },
  { label: 'Repeated values', input: '{"arr":[2,2,2,5],"difference":0}' },
  { label: 'No predecessor', input: '{"arr":[1,4,9],"difference":2}' },
]

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!Array.isArray(data.arr) || data.arr.length < 1 || data.arr.length > 12) throw new Error('arr must hold 1 to 12 integers.')
  data.arr.forEach((x, i) => { if (!Number.isInteger(x) || x < -10 || x > 10) throw new Error(`arr[${i}] must be an integer from -10 to 10.`) })
  if (!Number.isInteger(data.difference) || data.difference < -5 || data.difference > 5) throw new Error('difference must be an integer from -5 to 5.')
  return { arr: data.arr, difference: data.difference }
}

const codeLines = [
  "function longestSubsequence(arr, difference) {",
  "  const best = new Map()",
  "  let answer = 0",
  "  for (const x of arr) {",
  "    const length = (best.get(x - difference) ?? 0) + 1",
  "    best.set(x, length)",
  "    answer = Math.max(answer, length)",
  "  }",
  "  return answer",
  "}",
]
const codeText = codeLines.join('\n')
const pythonText = `def longest_subsequence(arr, difference):
    best = {}                                     # best[v]: longest chain ending at value v
    answer = 0
    for x in arr:
        length = best.get(x - difference, 0) + 1
        best[x] = length
        answer = max(answer, length)
    return answer`

export const code = codeText.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = pythonText
const L = key => codeText.split('\n').findIndex(line => line.includes(key)) + 1
const P = key => pythonText.split('\n').findIndex(line => line.includes(key)) + 1

export function buildTrace({ arr, difference }) {
  const best = new Map()
  const frames = []
  let answer = 0
  const snap = (extra = {}) => ({ best: [...best.entries()].map(([value, length]) => ({ value, length })), answer, ...extra })
  frames.push({
    phase: 'start', activeLine: L('const best = new Map()'), pythonLine: P('best = {}'),
    message: `The difference is ${difference}. The map starts empty, so no chain has been recorded.`,
    snapshot: snap({ x: null }),
  })
  arr.forEach((x, index) => {
    const predecessor = x - difference
    const before = best.has(predecessor) ? best.get(predecessor) : 0
    frames.push({
      phase: 'extend', activeLine: L('const length ='), pythonLine: P('length = best.get'),
      message: best.has(predecessor)
        ? `For x = ${x}, the predecessor ${predecessor} already ends a chain of length ${before}, so this chain is ${before + 1}.`
        : `For x = ${x}, the predecessor ${predecessor} has not appeared before, so the chain starts here with length 1.`,
      snapshot: snap({ x, index, predecessor }),
    })
    const length = before + 1
    best.set(x, length)
    answer = Math.max(answer, length)
    frames.push({
      phase: 'record', activeLine: L('best.set(x, length)'), pythonLine: P('best[x] = length'),
      message: `Record ${length} for value ${x}. The best chain so far is ${answer}.`,
      snapshot: snap({ x, index, predecessor, recorded: length }),
    })
  })
  frames.push({
    phase: 'done', activeLine: L('return answer'), pythonLine: P('return answer'),
    message: `The longest chain has length ${answer}.`,
    snapshot: snap({ x: null }),
  })
  return { input: { arr, difference }, result: answer, frames }
}
