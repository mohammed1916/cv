// LeetCode 3183: count the ways to make amount n from unlimited coins of value
// 1, 2 and 6, plus at most two coins of value 4. Coin order does not matter, and the count is
// returned modulo 1000000007. First count the ways using 1, 2 and 6 only (unbounded knapsack,
// one coin type at a time). Then add the ways for each number d (0, 1 or 2) of 4-coins.

const MOD = 1000000007
const MAX_AMOUNT = 200

const CODE_TEXT = `function countWays(n) {
  const MOD = 1000000007
  const ways = Array(n + 1).fill(0)
  ways[0] = 1
  for (const coin of [1, 2, 6]) {
    for (let x = coin; x <= n; x++) {
      ways[x] = (ways[x] + ways[x - coin]) % MOD
    }
  }
  let total = 0
  for (let d = 0; d <= 2 && 4 * d <= n; d++) {
    total = (total + ways[n - 4 * d]) % MOD
  }
  return total
}`

export const code = CODE_TEXT.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def count_ways(n):
    MOD = 1_000_000_007
    ways = [0] * (n + 1)
    ways[0] = 1
    for coin in (1, 2, 6):
        for x in range(coin, n + 1):
            ways[x] = (ways[x] + ways[x - coin]) % MOD
    total = 0
    for d in range(3):
        if 4 * d <= n:
            total = (total + ways[n - 4 * d]) % MOD
    return total
`
const PY = s => {
  const index = python.split('\n').findIndex(c => c.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}

export function parseInput(text) {
  const n = JSON.parse(text)
  if (!Number.isInteger(n) || n < 0 || n > MAX_AMOUNT) throw new Error(`Use an integer amount from 0 to ${MAX_AMOUNT}.`)
  return n
}

export function buildTrace(n) {
  const ways = Array(n + 1).fill(0)
  ways[0] = 1
  const frames = []
  const snapshot = () => ways.slice()
  frames.push({ phase: 'start', pythonLine: PY('ways[0] = 1'), activeLine: L('ways[0] = 1'), n, coin: 0, x: -1, ways: snapshot(), fours: [], total: 0, message: `Start with one way to make 0; amount ${n} is the target.` })
  for (const coin of [1, 2, 6]) {
    frames.push({ phase: 'coin', pythonLine: PY('for coin in (1, 2, 6)'), activeLine: L('for (const coin of'), n, coin, x: -1, ways: snapshot(), fours: [], total: 0, message: `Add coin ${coin} to the ways that use 1, 2 and 6 only.` })
    for (let x = coin; x <= n; x++) {
      ways[x] = (ways[x] + ways[x - coin]) % MOD
      frames.push({ phase: 'extend', pythonLine: PY('ways[x] = (ways[x] + ways[x - coin]) % MOD'), activeLine: L('ways[x] = (ways[x] + ways[x - coin])'), n, coin, x, ways: snapshot(), fours: [], total: 0, message: `Amount ${x} gains the ways that end in coin ${coin}: ${ways[x]}.` })
    }
  }
  let total = 0
  const fours = []
  for (let d = 0; d <= 2 && 4 * d <= n; d++) {
    total = (total + ways[n - 4 * d]) % MOD
    fours.push({ d, rest: n - 4 * d, value: ways[n - 4 * d] })
    frames.push({ phase: 'fours', pythonLine: PY('total = (total + ways[n - 4 * d]) % MOD'), activeLine: L('total = (total + ways[n - 4 * d])'), n, coin: 4, x: n - 4 * d, ways: snapshot(), fours: fours.slice(), total, message: `${d} coin${d === 1 ? '' : 's'} of 4 leave ${n - 4 * d}, with ${ways[n - 4 * d]} ways; total ${total}.` })
  }
  frames.push({ phase: 'done', pythonLine: PY('return total'), activeLine: L('return total'), n, coin: 0, x: -1, ways: snapshot(), fours: fours.slice(), total, message: `${total} ways to make ${n}.` })
  return { input: n, result: total, frames }
}
