// LeetCode 1977: f[i][len] counts ways to split the prefix that ends with the number num[i .. i+len-1]. The previous number must be no larger; shorter numbers always are (no leading zeros), equal lengths need a comparison. Prefix sums over previous lengths keep each start linear.
const MOD = 1000000007
const SOURCE = [
  'function numberOfCombinations(num) {',
  '  const n = num.length',
  '  if (num[0] === "0") return 0',
  '  const f = Array.from({ length: n + 1 }, () => new Array(n + 1).fill(0))',
  '  for (let len = 1; len <= n; len++) f[0][len] = 1',
  '  for (let i = 1; i < n; i++) {',
  '    if (num[i] === "0") continue',
  '    const prefix = new Array(i + 1).fill(0)',
  '    let total = 0',
  '    for (let m = 1; m <= i; m++) { total = (total + f[i - m][m]) % 1000000007; prefix[m] = total }',
  '    for (let len = 1; len <= n - i; len++) {',
  '      let ways = prefix[Math.min(len - 1, i)]',
  '      const p = i - len',
  '      if (p >= 0 && num.slice(p, p + len) <= num.slice(i, i + len)) ways += f[p][len]',
  '      f[i][len] = ways % 1000000007',
  '    }',
  '  }',
  '  let answer = 0',
  '  for (let i = 0; i < n; i++) answer = (answer + f[i][n - i]) % 1000000007',
  '  return answer',
  '}',
]

export const code = SOURCE.map((text, index) => ({ line: index + 1, text }))

export const python = `def number_of_combinations(num):
    MOD = 10**9 + 7
    n = len(num)
    if num[0] == "0":
        return 0
    f = [[0] * (n + 1) for _ in range(n + 1)]
    for length in range(1, n + 1):
        f[0][length] = 1
    for i in range(1, n):
        if num[i] == "0":
            continue
        prefix = [0] * (i + 1)
        total = 0
        for m in range(1, i + 1):
            total = (total + f[i - m][m]) % MOD
            prefix[m] = total
        for length in range(1, n - i + 1):
            ways = prefix[min(length - 1, i)]
            p = i - length
            if p >= 0 and num[p:p + length] <= num[i:i + length]:
                ways += f[p][length]
            f[i][length] = ways % MOD
    answer = 0
    for i in range(n):
        answer = (answer + f[i][n - i]) % MOD
    return answer
`

const L = text => { const i = SOURCE.findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no code line: ${text}`); return i + 1 }
const P = text => { const i = python.split('\n').findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no python line: ${text}`); return i + 1 }

export const phases = [
  { id: 'fill', label: 'Fill table', description: 'Fill f for each start position and length of the last number.' },
  { id: 'done', label: 'Result', description: 'Total ways.' },
]

export function parseInput(text) {
  const s = String(text).trim()
  if (!/^[0-9]{1,12}$/.test(s)) throw new Error('Enter 1 to 12 digits.')
  return { num: s }
}

export function buildTrace({ num }) {
  const n = num.length
  const frames = []
  if (num[0] === '0') {
    frames.push({ phase: 'done', activeLine: L('return 0'), pythonLine: P('return 0'), message: 'The string starts with 0, so no number can begin it.', table: null, start: -1, len: -1, result: 0 })
    return { input: { num }, result: 0, frames }
  }
  const f = Array.from({ length: n + 1 }, () => new Array(n + 1).fill(0))
  for (let len = 1; len <= n; len++) f[0][len] = 1
  for (let i = 1; i < n; i++) {
    if (num[i] === '0') {
      frames.push({ phase: 'fill', activeLine: L('continue'), pythonLine: P('continue'), message: `Position ${i} holds 0, so no number can start there.`, table: f.map(r => [...r]), start: i, len: 0 })
      continue
    }
    const prefix = new Array(i + 1).fill(0)
    let total = 0
    for (let m = 1; m <= i; m++) { total = (total + f[i - m][m]) % MOD; prefix[m] = total }
    for (let len = 1; len <= n - i; len++) {
      let ways = prefix[Math.min(len - 1, i)]
      const p = i - len
      if (p >= 0 && num.slice(p, p + len) <= num.slice(i, i + len)) ways += f[p][len]
      f[i][len] = ways % MOD
      frames.push({ phase: 'fill', activeLine: L('f[i][len] = ways'), pythonLine: P('f[i][length] = ways'), message: `Last number num[${i}..${i + len - 1}] = ${num.slice(i, i + len)}: ${f[i][len]} way(s).`, table: f.map(r => [...r]), start: i, len })
    }
  }
  let answer = 0
  for (let i = 0; i < n; i++) answer = (answer + f[i][n - i]) % MOD
  frames.push({ phase: 'done', activeLine: L('return answer'), pythonLine: P('return answer'), message: `${answer} list(s) of numbers fit the digits.`, table: f.map(r => [...r]), start: -1, len: -1, result: answer })
  return { input: { num }, result: answer, frames }
}
