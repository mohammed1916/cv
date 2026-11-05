const MOD = 1000000007

export function parseInput(text) {
  const data = JSON.parse(text)
  const { n, k } = data ?? {}
  if (!Number.isInteger(n) || n < 1 || n > 12) throw new Error('n must be an integer from 1 to 12 (the table is shown in full).')
  if (!Number.isInteger(k) || k < 0 || k > 60) throw new Error('k must be an integer from 0 to 60.')
  return { n, k }
}

// dp[i][j] = permutations of 1..i with exactly j inverse pairs, using prefix sums over the last i values.
export function buildTrace({ n, k }) {
  const width = k + 1
  const dp = [Array(width).fill(0)]
  dp[0][0] = 1
  const frames = [{ phase: 'start', row: 0, column: 0, table: dp.map(r => [...r]), activeLine: 2, message: 'Zero elements: exactly one permutation with zero inversions.' }]
  for (let i = 1; i <= n; i++) {
    const prev = dp[i - 1]
    const prefix = [0]
    for (let j = 0; j < width; j++) prefix.push((prefix[j] + prev[j]) % MOD)
    const row = Array(width).fill(0)
    for (let j = 0; j < width; j++) {
      const lo = Math.max(0, j - (i - 1))
      row[j] = (prefix[j + 1] - prefix[lo] + MOD) % MOD
    }
    dp.push(row)
    frames.push({ phase: 'row', row: i, column: null, table: dp.map(r => [...r]), activeLine: 6, message: `Insert element ${i} into each permutation of ${i - 1} elements; sum the last ${i} previous counts with prefix sums.` })
  }
  const result = dp[n][k]
  frames.push({ phase: 'done', row: n, column: k, table: dp.map(r => [...r]), result, activeLine: 9, message: `${result} permutations of 1..${n} have exactly ${k} inverse pairs.` })
  return { input: { n, k }, result, table: dp, frames }
}

export const code = `const MOD = 1000000007
if (k > (n * (n - 1)) / 2) return 0
let row = Array(k + 1).fill(0)
row[0] = 1
for (let size = 1; size <= n; size++) {
  const next = Array(k + 1).fill(0)
  let window = 0
  for (let inv = 0; inv <= k; inv++) {
    window = (window + row[inv]) % MOD
    if (inv >= size) window = (window - row[inv - size] + MOD) % MOD
    next[inv] = window
  }
  row = next
}
return row[k]`.split('\n').map((text, index) => ({ line: index + 1, text }))

// The family visualizer reports code stages rather than line numbers. This maps each frame onto the lines above.
export function familyLine(frame) {
  if (frame.phase === 'start') return 1
  if (frame.phase === 'done') return frame.codeStage === 'impossible' ? 2 : 15
  return 9
}

export const python = `def k_inverse_pairs(n, k):
    if k > n * (n - 1) // 2:
        return 0
    modulus = 1000000007
    dp = [1] + [0] * k
    for size in range(1, n + 1):
        following, window = [0] * (k + 1), 0
        for inversions in range(k + 1):
            window = (window + dp[inversions]) % modulus
            if inversions >= size:
                window = (window - dp[inversions - size] + modulus) % modulus
            following[inversions] = window
        dp = following
    return dp[k]`
