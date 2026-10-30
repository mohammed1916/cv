const CODE = [
  "FUNCTION minimumChanges(s, k)",
  "    n ← length of s",
  "    dp[p][end] ← infinity for all, dp[0][0] ← 0",
  "    FOR each number of parts p from 1 to k",
  "        FOR each end position from p to n",
  "            FOR each start from p - 1 to end - 1",
  "                IF dp[p - 1][start] is finite",
  "                    dp[p][end] ← min(dp[p][end], dp[p - 1][start] + cost(start, end))",
  "    RETURN dp[k][n]",
  "FUNCTION cost(i, j): fewest changes over divisors d < length of s[i..j) (length 1 is never a semi-palindrome)",
]
export const code = CODE.map((text, index) => ({ line: index + 1, text }))
export const python = `def minimumChanges(s, k):
    n = len(s)
    INF = float('inf')
    def cost(i, j):
        sub = s[i:j]
        m = len(sub)
        best = INF
        for d in range(1, m):
            if m % d != 0:
                continue
            changes = 0
            for r in range(d):
                seq = sub[r::d]
                for a in range(len(seq) // 2):
                    if seq[a] != seq[-1 - a]:
                        changes += 1
            best = min(best, changes)
        return best
    dp = [[INF] * (n + 1) for _ in range(k + 1)]
    dp[0][0] = 0
    for p in range(1, k + 1):
        for end in range(p, n + 1):
            for start in range(p - 1, end):
                if dp[p - 1][start] < INF:
                    cand = dp[p - 1][start] + cost(start, end)
                    dp[p][end] = min(dp[p][end], cand)
    return dp[k][n]
`

export function parseInput(text) {
  let data
  try { data = JSON.parse(text) } catch { throw new Error('Input must be a JSON object such as {"s": "abcac", "k": 2}') }
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Input must be a JSON object with keys s and k')
  const { s, k } = data
  if (typeof s !== 'string' || s.length < 2 || s.length > 12) throw new Error('s must be a string of 2 to 12 lowercase letters for the visualization')
  if (!/^[a-z]+$/.test(s)) throw new Error('s must contain only lowercase English letters')
  if (!Number.isInteger(k) || k < 1 || k > Math.floor(s.length / 2)) throw new Error(`k must be an integer from 1 to ${Math.floor(s.length / 2)}`)
  return { s, k }
}

// Fewest letter changes so that s[i..j) becomes a semi-palindrome, plus the divisor that achieves it.
function semiCost(sub) {
  const m = sub.length
  let best = Infinity
  let bestD = 0
  for (let d = 1; d < m; d++) {
    if (m % d !== 0) continue
    let changes = 0
    for (let r = 0; r < d; r++) {
      const seq = []
      for (let p = r; p < m; p += d) seq.push(sub[p])
      for (let a = 0; a < Math.floor(seq.length / 2); a++) if (seq[a] !== seq[seq.length - 1 - a]) changes++
    }
    if (changes < best) { best = changes; bestD = d }
  }
  return { best, bestD }
}

export function buildTrace({ s, k }) {
  const n = s.length
  const INF = Infinity
  const dp = Array.from({ length: k + 1 }, () => Array(n + 1).fill(INF))
  dp[0][0] = 0
  const frames = []
  const snapshot = () => dp.map(row => row.map(v => (v === INF ? null : v)))
  const emit = (phase, activeLine, pythonLine, message, row = -1, column = -1, extra = {}) => frames.push({
    phase, activeLine, pythonLine, message, row, column, table: snapshot(), ...extra,
  })
  emit('setup', 3, 20, 'dp[0][0] = 0; every other entry is infinity', 0, 0)
  for (let p = 1; p <= k; p++) {
    for (let end = p; end <= n; end++) {
      emit('row', 5, 22, `parts ${p}, end ${end}`, p, end)
      for (let start = p - 1; start < end; start++) {
        if (dp[p - 1][start] === INF) {
          emit('skip', 7, 24, `dp[${p - 1}][${start}] is infinity, skip`, p, end)
          continue
        }
        const { best, bestD } = semiCost(s.slice(start, end))
        emit('cost', 10, 18, `cost("${s.slice(start, end)}") = ${best === INF ? 'infinity' : best}${bestD ? ` with d = ${bestD}` : ''}`, p, end)
        const cand = dp[p - 1][start] + best
        if (cand < dp[p][end]) dp[p][end] = cand
        emit('update', 8, 26, `candidate from start ${start} is ${cand === INF ? 'infinity' : cand}`, p, end)
      }
    }
  }
  const result = dp[k][n] === INF ? null : dp[k][n]
  emit('result', 9, 27, `return dp[${k}][${n}] = ${result}`, k, n)
  const rowLabels = Array.from({ length: k + 1 }, (_, p) => `${p} parts`)
  const columnLabels = Array.from({ length: n + 1 }, (_, e) => String(e))
  return { input: { s, k }, result, frames, rowLabels, columnLabels }
}
