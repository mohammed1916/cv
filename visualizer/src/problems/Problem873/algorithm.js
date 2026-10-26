export const code = `def lenLongestFibSubseq(arr):
    idx = {v: i for i, v in enumerate(arr)}
    n = len(arr)
    dp = [[2] * n for _ in range(n)]
    best = 0
    for k in range(n):
        for j in range(k):
            i = idx.get(arr[k] - arr[j], -1)
            if 0 <= i < j:
                dp[j][k] = dp[i][j] + 1
                best = max(best, dp[j][k])
    return best`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = (s) => code.findIndex((c) => c.text.includes(s)) + 1

export function parseInput(text) {
  let a
  try { a = JSON.parse(text) } catch { throw new Error('Input must be a JSON array of strictly increasing positive integers.') }
  if (!Array.isArray(a) || a.length < 3 || a.length > 16) throw new Error('arr must have 3 to 16 elements (visualization cap).')
  if (!a.every((x) => Number.isInteger(x) && x >= 1 && x <= 1000000000)) throw new Error('arr values must be integers in [1, 1e9].')
  for (let i = 1; i < a.length; i++) if (a[i] <= a[i - 1]) throw new Error('arr must be strictly increasing.')
  return [...a]
}

export function buildTrace(arr) {
  const n = arr.length
  const idx = new Map(arr.map((v, i) => [v, i]))
  const dp = Array.from({ length: n }, () => Array(n).fill(2))
  let best = 0
  const frames = []
  const push = (phase, activeLine, message, extra = {}) => frames.push({ phase, activeLine, message, dp: dp.map((r) => [...r]), best, j: -1, k: -1, i: -1, ...extra })
  push('start', L('idx = '), 'Every pair is a Fibonacci-like sequence of length 2, so dp starts at 2. dp[j][k] is the longest chain ending with arr[j], arr[k].')
  for (let k = 0; k < n; k++) {
    for (let j = 0; j < k; j++) {
      const need = arr[k] - arr[j]
      const i = idx.has(need) ? idx.get(need) : -1
      push('lookup', L('i = idx.get'), `Chain ends (${arr[j]}, ${arr[k]}): the previous element must be ${arr[k]} - ${arr[j]} = ${need}${i >= 0 ? ` (found at index ${i})` : ' (not in arr)'}.`, { j, k, i })
      if (i >= 0 && i < j) {
        dp[j][k] = dp[i][j] + 1
        best = Math.max(best, dp[j][k])
        push('extend', L('dp[j][k] ='), `${need} sits at index ${i} before ${j}, so extend the chain ending (${arr[i]}, ${arr[j]}): dp[${j}][${k}] = ${dp[j][k]}. best = ${best}.`, { j, k, i })
      } else if (i >= 0) {
        push('skip', L('if 0 <= i'), `Index ${i} is not before j=${j}, so ${need} cannot precede ${arr[j]} in an increasing chain; the pair stays at 2.`, { j, k, i })
      } else {
        push('skip', L('if 0 <= i'), `No valid predecessor, so the pair stays at length 2.`, { j, k, i })
      }
    }
  }
  push('done', L('return best'), best >= 3 ? `Done: the longest Fibonacci-like subsequence has length ${best}.` : 'Done: no chain of length 3 exists, so the answer is 0.')
  return { input: arr, result: best, frames }
}
