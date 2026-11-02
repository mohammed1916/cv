export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with strength and x.')
  const { strength, x } = input
  if (!Array.isArray(strength) || strength.length < 1 || strength.length > 8) throw new Error('strength has 1 to 8 locks.')
  if (!strength.every(v => Number.isInteger(v) && v >= 1 && v <= 50)) throw new Error('Each strength is an integer from 1 to 50.')
  if (!Number.isInteger(x) || x < 1 || x > 10) throw new Error('x is an integer from 1 to 10.')
  return { strength, x }
}

// Breaking a lock with strength s while the factor is k takes ceil(s / k) minutes, and the factor
// depends only on how many locks are already broken, so a subset DP over broken locks is exact.
export function buildTrace({ strength, x }) {
  const n = strength.length
  const full = (1 << n) - 1
  const INF = Infinity
  const dp = Array(1 << n).fill(INF)
  const frames = []
  dp[0] = 0
  frames.push({ pythonLine: PY('dp[0] = 0'), phase: 'start', activeLine: L('no locks broken'), mask: 0, lock: -1, dp: [...dp], message: 'Nothing is broken, so the time is 0.' })
  for (let mask = 0; mask <= full; mask++) {
    if (dp[mask] === INF) continue
    const count = popcount(mask)
    const k = 1 + x * count
    frames.push({ pythonLine: PY('k = 1 + x'), phase: 'state', activeLine: L('the factor for this state'), mask, lock: -1, k, dp: [...dp],
      message: `${count} lock(s) broken, factor ${k}, best time ${dp[mask]}.` })
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) continue
      const minutes = Math.ceil(strength[i] / k)
      const next = mask | (1 << i)
      const improves = dp[mask] + minutes < dp[next]
      if (improves) dp[next] = dp[mask] + minutes
      frames.push({ pythonLine: PY('if dp[mask] + minutes'), phase: improves ? 'relax' : 'skip', activeLine: L('try breaking lock'), mask, lock: i, k, dp: [...dp],
        message: `Break lock ${i} (strength ${strength[i]}) in ${minutes} minute(s) to reach time ${dp[mask] + minutes}${improves ? ' (improves)' : ''}.` })
    }
  }
  const result = dp[full]
  frames.push({ pythonLine: PY('return dp['), phase: 'done', activeLine: L('return the time for all locks'), mask: full, lock: -1, dp: [...dp], result, message: `Minimum time to break all locks: ${result}.` })
  return { input: { strength, x }, result, frames }
}

function popcount(v) {
  let c = 0
  for (let m = v; m; m &= m - 1) c += 1
  return c
}

export const code = `minimum minutes to break all locks
  dp[mask] is the minimum time to have broken exactly the locks in mask
  dp[0] is 0 and all other states start at infinity
  for each mask in increasing order with a finite dp value
    k is 1 plus x times the number of broken locks
    for each lock i not in mask
      minutes is strength[i] divided by k, rounded up
      if dp[mask] plus minutes improves dp[mask with i]
        update it
  return dp for the full mask`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimum_time_to_break_locks(strength, x):
    n = len(strength)
    full = (1 << n) - 1
    INF = float("inf")
    dp = [INF] * (1 << n)
    dp[0] = 0
    for mask in range(full + 1):
        if dp[mask] == INF:
            continue
        k = 1 + x * bin(mask).count("1")
        for i in range(n):
            if mask & (1 << i):
                continue
            minutes = -(-strength[i] // k)
            nxt = mask | (1 << i)
            if dp[mask] + minutes < dp[nxt]:
                dp[nxt] = dp[mask] + minutes
    return dp[full]
`
const PY = s => python.split('\n').findIndex(line => line.includes(s)) + 1
