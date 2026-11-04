export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a digit string s and an integer k.')
  const { s, k } = input
  if (typeof s !== 'string' || s.length < 1 || s.length > 12 || !/^[0-9]+$/.test(s)) throw new Error('s must be 1 to 12 digits.')
  if (!Number.isInteger(k) || k < 1 || k > 10000) throw new Error('k must be an integer from 1 to 10000.')
  return { s, k }
}

const MOD = 1000000007

export function buildTrace(input) {
  const { s, k } = input
  const n = s.length
  const ways = Array(n + 1).fill(0)
  ways[0] = 1
  const frames = [{ phase: 'start', activeLine: L('ways[0] = 1'), pythonLine: 5, end: 0, start: -1, ways: [...ways], total: null, message: 'The empty prefix can be split in one way.' }]
  for (let i = 1; i <= n; i++) {
    for (let j = 0; j < i; j++) {
      if (s[j] === '0') continue
      const value = Number(s.slice(j, i))
      if (value <= k) {
        ways[i] = (ways[i] + ways[j]) % MOD
        frames.push({ phase: 'piece', activeLine: L('ways[i] = (ways[i]'), pythonLine: 11, end: i, start: j, ways: [...ways], total: null, message: `Piece ${s.slice(j, i)} is at most ${k}, so ways up to ${j} add to ways up to ${i}.` })
      }
    }
  }
  const result = ways[n]
  frames.push({ phase: 'done', activeLine: L('return ways[n]'), pythonLine: 12, end: n, start: -1, ways: [...ways], total: result, message: `${result} ways to restore the array.` })
  return { input, result, frames }
}

const CODE = [
  'function numberOfArrays(s, k) {',
  '  const MOD = 1000000007',
  '  const n = s.length',
  '  const ways = Array(n + 1).fill(0)',
  '  ways[0] = 1',
  '  for (let i = 1; i <= n; i++) {',
  '    for (let j = 0; j < i; j++) {',
  "      if (s[j] === '0') continue",
  '      if (Number(s.slice(j, i)) <= k) {',
  '        ways[i] = (ways[i] + ways[j]) % MOD',
  '      }',
  '    }',
  '  }',
  '  return ways[n]',
  '}',
]
export const code = CODE.map((text, index) => ({ line: index + 1, text }))
const L = s => CODE.findIndex(text => text.includes(s)) + 1

export const python = `def number_of_arrays(s, k):
    MOD = 1000000007
    n = len(s)
    ways = [0] * (n + 1)
    ways[0] = 1
    for i in range(1, n + 1):
        for j in range(i):
            if s[j] == '0':
                continue
            if int(s[j:i]) <= k:
                ways[i] = (ways[i] + ways[j]) % MOD
    return ways[n]
`
