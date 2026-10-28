const MOD = 1000000007

export function parseInput(text) {
  const n = JSON.parse(text)
  if (!Number.isInteger(n) || n < 1 || n > 40) throw new Error('Use an integer length from 1 to 40.')
  return n
}

export function buildTrace(n) {
  // State: how many l (capped at 1), e (capped at 2), and t (capped at 1) letters are placed so far.
  const idx = (l, e, t) => (l * 3 + e) * 2 + t
  let dp = Array(12).fill(0)
  dp[idx(0, 0, 0)] = 1
  const frames = [{ phase: 'start', activeLine: L('set ways'), step: 0, ways: dp[idx(1, 2, 1)], message: 'Nothing placed yet. Track how many of l, e, and t are used, each capped at what leet needs.' }]
  for (let step = 1; step <= n; step++) {
    const next = Array(12).fill(0)
    for (let l = 0; l < 2; l++) for (let e = 0; e < 3; e++) for (let t = 0; t < 2; t++) {
      const ways = dp[idx(l, e, t)]
      if (ways === 0) continue
      next[idx(Math.min(1, l + 1), e, t)] += ways
      next[idx(l, Math.min(2, e + 1), t)] += ways
      next[idx(l, e, Math.min(1, t + 1))] += ways
      next[idx(l, e, t)] += ways * 23
    }
    dp = next.map(v => v % MOD)
    frames.push({ phase: 'position', activeLine: L('for each position'), step, ways: dp[idx(1, 2, 1)], message: `After ${step} letter${step === 1 ? '' : 's'}, ${dp[idx(1, 2, 1)]} strings already contain l, e, e, and t.` })
  }
  const result = dp[idx(1, 2, 1)]
  frames.push({ phase: 'done', activeLine: L('return the ways'), step: n, ways: result, message: `Strings of length ${n} that can be rearranged to contain leet: ${result}.` })
  return { input: n, result, frames, dp }
}

export const code = `count strings of length n that can be rearranged to contain leet:
  track how many l, e, and t letters are used, each capped at what leet needs
  set ways for the empty state to 1
  for each position in the string:
    a letter l, e, or t moves its count one step toward the requirement
    each of the other 23 letters keeps the counts unchanged
  return the ways that reach one l, two e, and one t, modulo 1000000007`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_rearrangeable(n):
    mod = 1000000007
    dp = [0] * 12
    dp[(0 * 3 + 0) * 2 + 0] = 1
    for _ in range(n):
        nxt = [0] * 12
        for l in range(2):
            for e in range(3):
                for t in range(2):
                    ways = dp[(l * 3 + e) * 2 + t]
                    if ways == 0:
                        continue
                    nxt[(min(1, l + 1) * 3 + e) * 2 + t] += ways
                    nxt[(l * 3 + min(2, e + 1)) * 2 + t] += ways
                    nxt[(l * 3 + e) * 2 + min(1, t + 1)] += ways
                    nxt[(l * 3 + e) * 2 + t] += ways * 23
        dp = [v % mod for v in nxt]
    return dp[(1 * 3 + 2) * 2 + 1]
`
