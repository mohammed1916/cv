// LeetCode 1940: a value belongs to the answer when it appears in every sorted array. Count appearances per value, keep the values whose count equals the number of arrays.
const SOURCE = [
  'function longestCommonSubsequence(arrays) {',
  '  const count = new Map()',
  '  for (const arr of arrays) {',
  '    for (const x of new Set(arr)) count.set(x, (count.get(x) || 0) + 1)',
  '  }',
  '  const common = [...count].filter(([, c]) => c === arrays.length).map(([x]) => x)',
  '  return common.sort((a, b) => a - b)',
  '}',
]

export const code = SOURCE.map((text, index) => ({ line: index + 1, text }))

export const python = `def longest_common_subsequence(arrays):
    count = {}
    for arr in arrays:
        for x in set(arr):
            count[x] = count.get(x, 0) + 1
    common = [x for x, c in count.items() if c == len(arrays)]
    return sorted(common)
`

const L = text => { const i = SOURCE.findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no code line: ${text}`); return i + 1 }
const P = text => { const i = python.split('\n').findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no python line: ${text}`); return i + 1 }

export const phases = [
  { id: 'count', label: 'Count appearances', description: 'Count the arrays each value appears in.' },
  { id: 'pick', label: 'Keep common', description: 'Keep values present in every array.' },
  { id: 'done', label: 'Result', description: 'Common values in sorted order.' },
]

export function parseInput(text) {
  let arrays
  try { arrays = JSON.parse(text) } catch { throw new Error('Enter a JSON array of sorted arrays, for example [[1,3,4],[1,4,5]].') }
  if (!Array.isArray(arrays) || arrays.length < 1 || arrays.length > 5) throw new Error('Use 1 to 5 arrays.')
  for (const arr of arrays) {
    if (!Array.isArray(arr) || arr.length < 1 || arr.length > 8 || !arr.every(v => Number.isInteger(v) && v >= 1 && v <= 50)) throw new Error('Each array holds 1 to 8 integers from 1 to 50.')
    for (let i = 1; i < arr.length; i++) if (arr[i] <= arr[i - 1]) throw new Error('Each array is strictly increasing.')
  }
  return { arrays }
}

export function buildTrace({ arrays }) {
  const count = new Map()
  const frames = []
  for (let a = 0; a < arrays.length; a++) {
    for (const x of new Set(arrays[a])) count.set(x, (count.get(x) || 0) + 1)
    frames.push({ phase: 'count', activeLine: L('for (const arr of arrays)'), pythonLine: P('for arr in arrays'), message: `Array ${a} is counted.`, arrayIndex: a, count: Object.fromEntries(count), common: [] })
  }
  const common = [...count].filter(([, c]) => c === arrays.length).map(([x]) => x).sort((a, b) => a - b)
  frames.push({ phase: 'pick', activeLine: L('const common'), pythonLine: P('common = [x'), message: `Values in all ${arrays.length} arrays: ${common.join(', ') || 'none'}.`, arrayIndex: -1, count: Object.fromEntries(count), common })
  frames.push({ phase: 'done', activeLine: L('return common.sort'), pythonLine: P('return sorted'), message: 'Sorted common values are the answer.', arrayIndex: -1, count: Object.fromEntries(count), common, result: common })
  return { input: { arrays }, result: common, frames }
}
