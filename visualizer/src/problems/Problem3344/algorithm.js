export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with s.')
  const { s } = input
  if (!Number.isInteger(s) || s < 0 || s > 5000) throw new Error('s is an integer from 0 to 5000.')
  return { s }
}

// Element A[i][j][k] = i * (j OR k). Summing over i gives n(n-1)/2, so the total is n(n-1)/2 * T(n),
// where T(n) is the sum of (j OR k) over all j, k in 0..n-1. T grows by one row and column at a time.
export const code = `largest n whose total element sum is at most s
  n = 1
  pairs = 0
  repeat
    grow = 0
    for k from 0 to n do grow = grow + (n OR k)
    for j from 0 to n minus 1 do grow = grow + (j OR n)
    candidate = pairs + grow
    total = (n + 1) * n / 2 * candidate
    if total is greater than s then return n
    pairs = candidate
    n = n + 1`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def maximum_sized_array(s):
    n = 1
    pairs = 0
    while True:
        grow = 0
        for k in range(n + 1):
            grow += n | k
        for j in range(n):
            grow += j | n
        candidate = pairs + grow
        total = (n + 1) * n // 2 * candidate
        if total > s:
            return n
        pairs = candidate
        n += 1
`

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}
const P = s => {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}

export function buildTrace({ s }) {
  const frames = []
  let n = 1
  let pairs = 0
  const push = (phase, codeText, pyText, message, extra = {}) => {
    frames.push({
      phase, activeLine: L(codeText), pythonLine: P(pyText), message,
      s, n, pairs, candidate: null, total: null, grow: null, ...extra,
    })
  }

  push('start', 'n = 1', 'n = 1', `Start with n = 1; the total for n = 1 is 0, which is at most ${s}.`)
  for (;;) {
    let grow = 0
    for (let k = 0; k <= n; k += 1) grow += n | k
    for (let j = 0; j < n; j += 1) grow += j | n
    const candidate = pairs + grow
    const total = (n + 1) * n / 2 * candidate
    push('grow', 'for k from 0 to n do grow = grow + (n OR k)', 'for k in range(n + 1)', `Adding the new row and column for size ${n + 1} contributes ${grow}.`, { grow, candidate, total, next: n + 1 })
    if (total > s) {
      push('stop', 'if total is greater than s then return n', 'if total > s', `Size ${n + 1} has total ${total}, above s = ${s}; the answer is ${n}.`, { grow, candidate, total, next: n + 1 })
      break
    }
    pairs = candidate
    push('advance', 'pairs = candidate', 'pairs = candidate', `Size ${n + 1} has total ${total}, within s = ${s}; move on.`, { grow, candidate, total, next: n + 1 })
    n += 1
  }
  push('done', 'return n', 'return n', `The largest n is ${n}.`, { result: n })
  return { input: { s }, result: n, frames }
}
