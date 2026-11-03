const MOD = 1000000007n
const codeLines = `count the people on each side of pos
  left = pos and right = n minus 1 minus pos
  set total to 0
  for a from 0 to min(left, k)
    b = k minus a
    if b is between 0 and right
      total += C(left, a) times C(right, b)
  return 2 times total modulo 1000000007`.split('\n').map((text, index) => ({ line: index + 1, text: text.trim() }))
const L = s => codeLines.findIndex(c => c.text.includes(s)) + 1
const pythonLines = `def count_assignments(n, pos, k):
    left, right = pos, n - 1 - pos
    C = [[1] + [0] * 30 for _ in range(31)]
    for i in range(1, 31):
        for j in range(1, i + 1):
            C[i][j] = C[i - 1][j - 1] + C[i - 1][j]
    total = 0
    for a in range(min(left, k) + 1):
        b = k - a
        if 0 <= b <= right:
            total += C[left][a] * C[right][b]
    return 2 * total % 1000000007`.split('\n')
const P = s => pythonLines.findIndex(t => t.includes(s)) + 1

function binomial(n, r) {
  if (r < 0 || r > n) return 0n
  let value = 1n
  for (let i = 0; i < r; i++) value = value * BigInt(n - i) / BigInt(i + 1)
  return value
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object') throw new Error('Use an object with n, pos and k.')
  const { n, pos, k } = input
  if (!Number.isInteger(n) || n < 1 || n > 30) throw new Error('n is an integer from 1 to 30 in this visual.')
  if (!Number.isInteger(pos) || pos < 0 || pos >= n) throw new Error('pos is between 0 and n minus 1.')
  if (!Number.isInteger(k) || k < 0 || k > n) throw new Error('k is between 0 and n.')
  return { n, pos, k }
}

export function buildTrace({ n, pos, k }) {
  const left = pos
  const right = n - 1 - pos
  const frames = [{ phase: 'sides', activeLine: L('left = pos'), pythonLine: P('left, right ='), a: -1, b: -1, term: 0n, total: 0n, left, right,
    message: `${left} people on the left and ${right} on the right; person ${pos} is free, which gives a factor of 2.` }]
  let total = 0n
  for (let a = 0; a <= Math.min(left, k); a++) {
    const b = k - a
    const valid = b >= 0 && b <= right
    const term = valid ? binomial(left, a) * binomial(right, b) : 0n
    total += term
    frames.push({ phase: 'sum', activeLine: L('for a from 0'), pythonLine: P('for a in range'), a, b, term, total, left, right,
      message: valid ? `${a} visible on the left and ${b} on the right: ${term} ways.` : `${a} on the left would need ${b} on the right, which is not possible.` })
  }
  const answer = (2n * total) % MOD
  frames.push({ phase: 'done', activeLine: L('return 2 times'), pythonLine: P('return 2 * total'), a: -1, b: -1, term: 0n, total, left, right,
    message: `Answer is 2 times ${total}, modulo 1000000007.` })
  return { input: { n, pos, k }, result: Number(answer), frames }
}

export const code = codeLines
export const python = pythonLines.join('\n')
