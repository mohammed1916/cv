export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n, x and y.')
  const { n, x, y } = input
  if (!Number.isInteger(n) || n < 2 || n > 12) throw new Error('n is an integer from 2 to 12 in this trace.')
  if (![x, y].every(v => Number.isInteger(v) && v >= 1 && v <= n)) throw new Error('x and y are houses from 1 to n.')
  return { n, x, y }
}

export function buildTrace({ n, x, y }) {
  const frames = []
  const ans = Array(n).fill(0)
  frames.push({ pythonLine: 2, phase: 'start', activeLine: L('ans = list of n zeros'), i: null, j: null, dist: null, ans: [...ans], message: `Count pairs of ${n} houses; the extra cable joins ${x} and ${y}.` })
  for (let i = 1; i <= n; i++) {
    for (let j = i + 1; j <= n; j++) {
      const dist = Math.min(j - i, Math.abs(i - x) + 1 + Math.abs(y - j), Math.abs(i - y) + 1 + Math.abs(x - j))
      ans[dist - 1] += 2
      frames.push({ pythonLine: 6, phase: 'pair', activeLine: L('add two ordered pairs'), i, j, dist, ans: [...ans], message: `Houses ${i} and ${j} are ${dist} apart; both orders are counted.` })
    }
  }
  frames.push({ pythonLine: 7, phase: 'done', activeLine: L('return ans'), i: null, j: null, dist: null, ans: [...ans], message: 'Every ordered pair is counted.' })
  return { input: { n, x, y }, result: ans, frames }
}

export const code = `count ordered pairs of houses by shortest distance
  ans = list of n zeros
  for each pair of houses i less than j
    dist = shortest distance using the line or the extra cable
    add two ordered pairs to ans at position dist minus one
  return ans`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_houses(n, x, y):
    ans = [0] * n
    for i in range(1, n + 1):
        for j in range(i + 1, n + 1):
            dist = min(j - i, abs(i - x) + 1 + abs(y - j), abs(i - y) + 1 + abs(x - j))
            ans[dist - 1] += 2
    return ans
`
