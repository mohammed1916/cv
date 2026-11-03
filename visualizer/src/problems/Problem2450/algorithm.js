const MOD = 1000000007
const MAX_LENGTH = 12

const P = s => {
  const i = python.split('\n').findIndex(line => line.includes(s))
  if (i < 0) throw new Error(`missing python line: ${s}`)
  return i + 1
}
const L = s => {
  const i = code.findIndex(c => c.text.includes(s))
  if (i < 0) throw new Error(`missing pseudocode line: ${s}`)
  return i + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with s and k.')
  const { s, k } = input
  if (typeof s !== 'string' || s.length < 1 || s.length > MAX_LENGTH || !/^[01]+$/.test(s)) throw new Error(`s is a binary string of 1 to ${MAX_LENGTH} characters.`)
  if (!Number.isInteger(k) || k < 1 || k > s.length) throw new Error('k is an integer from 1 to the length of s.')
  return { s, k }
}

export function buildTrace({ s, k }) {
  const n = s.length
  const windows = n - k + 1
  const frames = []
  const frame = extra => ({ s, k, windows, count: 0, pivot: -1, value: 1, ...extra })

  frames.push(frame({ phase: 'start', activeLine: L('the number of windows'), pythonLine: P('windows = len'), message: `There are ${windows} window start${windows === 1 ? '' : 's'} of length ${k}, from index 0 to ${n - k}.` }))
  let result = 1
  frames.push(frame({ phase: 'start', activeLine: L('result = 1'), pythonLine: P('result = 1'), value: 1, message: 'Zero operations is one reachable string, so the count starts at 1.' }))
  for (let i = 0; i < windows; i++) {
    result = (result * 2) % MOD
    frames.push(frame({ phase: 'window', pivot: i, count: i + 1, value: result, activeLine: L('each window start'), pythonLine: P('result = result * 2'), message: `Window ${i} covers positions ${i} to ${i + k - 1} and has its own leading position ${i}, so it doubles the count to ${result}.` }))
  }
  frames.push(frame({ phase: 'done', count: windows, value: result, activeLine: L('return result'), pythonLine: P('return result'), message: `Each of the ${windows} windows gives an independent choice, so ${result} strings are reachable.` }))
  return { input: { s, k }, result, frames }
}

export const code = [
  'count the distinct strings reachable by window flips',
  'the number of windows is the length minus k plus one',
  'result = 1',
  'for each window start i from zero to windows minus one',
  '  window i has a leading position no other window owns, so it adds an independent choice',
  '  result doubles, modulo 1000000007',
  'return result',
].map((text, index) => ({ line: index + 1, text }))

export const python = `def count_distinct(s, k):
    windows = len(s) - k + 1
    result = 1
    for i in range(windows):
        result = result * 2 % 1000000007
    return result
`
