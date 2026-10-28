export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with s, k and min_length.')
  const { s, k, min_length: minLength } = input
  if (typeof s !== 'string' || s.length < 1 || s.length > 12 || !/^[1-9]+$/.test(s)) throw new Error('s must be 1 to 12 digits from 1 to 9.')
  if (!Number.isInteger(k) || k < 1 || k > 6) throw new Error('k must be an integer from 1 to 6.')
  if (!Number.isInteger(minLength) || minLength < 1 || minLength > 6) throw new Error('min_length must be an integer from 1 to 6.')
  return { s, k, min_length: minLength }
}

const PRIME = new Set(['2', '3', '5', '7'])
const MOD = 1000000007
const emptyTable = (rows, cols) => Array.from({ length: rows }, () => Array(cols).fill(0))
const copyTable = table => table.map(row => [...row])

export function buildTrace(input) {
  const { s, k, min_length: minLength } = input
  const n = s.length
  const ways = emptyTable(n + 1, k + 1)
  ways[0][0] = 1
  const frames = [{ phase: 'start', activeLine: L('set ways[0][0]'), end: 0, parts: 0, table: copyTable(ways), total: null, message: 'Zero digits make zero parts: one way.' }]
  for (let i = 1; i <= n; i++) {
    if (PRIME.has(s[i - 1])) {
      frames.push({ phase: 'skip', activeLine: L('skip this end position'), end: i, parts: 0, table: copyTable(ways), total: null, message: `The digit ${s[i - 1]} ending at position ${i} is prime, so no part can end here.` })
      continue
    }
    for (let j = 1; j <= k; j++) {
      let total = 0
      for (let a = 0; a <= i - minLength; a++) {
        if (PRIME.has(s[a])) total += ways[a][j - 1]
      }
      ways[i][j] = total % MOD
      frames.push({ phase: 'cell', activeLine: L('set total to 0'), end: i, parts: j, table: copyTable(ways), total: null, message: `${j} part(s) covering the first ${i} digits: ${ways[i][j]} ways.` })
    }
  }
  const result = ways[n][k]
  frames.push({ phase: 'done', activeLine: L('return ways[n][k]'), end: n, parts: k, table: copyTable(ways), total: result, message: `${result} beautiful partitions.` })
  return { input, result, frames }
}

export const code = `count beautiful partitions (s, k, min_length):
  set ways[0][0] to 1 and every other entry to 0
  for each end position i from 1 to n:
    if the digit ending at i is prime then skip this end position
    otherwise for each part count j from 1 to k:
      set total to 0
      for each start a where the part from a to i has length at least min_length:
        if the digit at a is prime then add ways[a][j - 1] to total
      set ways[i][j] to total modulo 1000000007
  return ways[n][k]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def beautiful_partitions(s, k, min_length):
    MOD = 1000000007
    primes = {'2', '3', '5', '7'}
    n = len(s)
    ways = [[0] * (k + 1) for _ in range(n + 1)]
    ways[0][0] = 1
    for i in range(1, n + 1):
        if s[i - 1] in primes:
            continue
        for j in range(1, k + 1):
            total = 0
            for a in range(0, i - min_length + 1):
                if s[a] in primes:
                    total += ways[a][j - 1]
            ways[i][j] = total % MOD
    return ways[n][k]
`
