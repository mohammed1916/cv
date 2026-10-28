const MOD = 1000000007

export function parseInput(text) {
  const s = JSON.parse(text)
  if (typeof s !== 'string' || !/^[0-9]{5,40}$/.test(s)) throw new Error('Use a JSON string of 5 to 40 digits.')
  return s
}

export function buildTrace(s) {
  const n = s.length
  const digit = ch => ch.charCodeAt(0) - 48
  const grid = () => Array.from({ length: 10 }, () => Array(10).fill(0))
  let total = 0
  const frames = [{ phase: 'start', activeLine: L('set total to 0'), m: null, ways: 0, total, message: 'Start with no palindromes counted.' }]
  for (let m = 2; m <= n - 3; m++) {
    // left[x][y]: pairs (i, j) left of m with digits x then y. right[y][x]: pairs (k, l) right of m with digits y then x.
    const left = grid()
    const right = grid()
    for (let i = 0; i < m; i++) for (let j = i + 1; j < m; j++) left[digit(s[i])][digit(s[j])]++
    for (let k = m + 1; k < n; k++) for (let l = k + 1; l < n; l++) right[digit(s[k])][digit(s[l])]++
    let ways = 0
    for (let x = 0; x < 10; x++) for (let y = 0; y < 10; y++) ways += left[x][y] * right[y][x]
    total = (total + ways) % MOD
    frames.push({ phase: 'middle', activeLine: L('for each middle position'), m, ways, total, message: `Middle at index ${m} (digit ${s[m]}): ${ways} palindromes of length 5 use it. Running total ${total}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return total'), m: null, ways: 0, total, message: `The count of palindromic subsequences of length 5 is ${total}.` })
  return { input: s, result: total, frames }
}

export const code = `palindromes of length 5 in the digit string s:
  set total to 0
  for each middle position m with two characters on each side:
    count pairs (i, j) left of m with digits (x, y)
    count pairs (k, l) right of m with digits (y, x)
    add the sum of left[x][y] times right[y][x] to total
  return total modulo 1000000007`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_palindromes(s):
    mod = 1000000007
    n = len(s)
    total = 0
    for m in range(2, n - 2):
        left = [[0] * 10 for _ in range(10)]
        right = [[0] * 10 for _ in range(10)]
        for i in range(m):
            for j in range(i + 1, m):
                left[int(s[i])][int(s[j])] += 1
        for k in range(m + 1, n):
            for l in range(k + 1, n):
                right[int(s[k])][int(s[l])] += 1
        ways = 0
        for x in range(10):
            for y in range(10):
                ways += left[x][y] * right[y][x]
        total = (total + ways) % mod
    return total
`
