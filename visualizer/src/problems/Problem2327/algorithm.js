const MOD = 1000000007

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data) || Object.keys(data).sort().join() !== 'delay,forget,n') {
    throw new Error('Use an object with exactly the keys n, delay, and forget.')
  }
  const { n, delay, forget } = data
  if (!Number.isInteger(n) || n < 2 || n > 40) throw new Error('n is an integer from 2 to 40.')
  if (!Number.isInteger(delay) || !Number.isInteger(forget) || delay < 1 || delay >= forget || forget > n) {
    throw new Error('Use integers with 1 <= delay < forget <= n.')
  }
  return data
}

export function buildTrace(data) {
  const { n, delay, forget } = data
  // learned[d]: people who learn the secret on day d (days are 1-based).
  const learned = Array(n + 1).fill(0)
  learned[1] = 1
  const frames = [{ phase: 'start', activeLine: L('set learned[1]'), day: 1, learned: [...learned], message: 'Day 1: one person knows the secret.' }]
  for (let t = 2; t <= n; t++) {
    let sharers = 0
    for (let d = Math.max(1, t - forget + 1); d <= t - delay; d++) sharers = (sharers + learned[d]) % MOD
    learned[t] = sharers
    frames.push({ phase: 'day', activeLine: L('set learned[t]'), day: t, learned: [...learned], message: `Day ${t}: people who learned between day ${Math.max(1, t - forget + 1)} and day ${t - delay} can share, so ${sharers} new people learn it today.` })
  }
  let result = 0
  for (let d = Math.max(1, n - forget + 1); d <= n; d++) result = (result + learned[d]) % MOD
  frames.push({ phase: 'done', activeLine: L('return the sum'), day: n, learned: [...learned], message: `People who still remember the secret on day ${n}: ${result}.` })
  return { input: data, result, frames, learned }
}

export const code = `people who still know the secret after n days:
  set learned[1] to 1, the first person
  for each day t from 2 to n:
    sum the people who learned on days from t - forget + 1 to t - delay
    set learned[t] to that sum modulo 1000000007
  sum the people who learned on days from n - forget + 1 to n
  return the sum modulo 1000000007`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def people_aware(n, delay, forget):
    mod = 1000000007
    learned = [0] * (n + 1)
    learned[1] = 1
    for t in range(2, n + 1):
        sharers = 0
        for d in range(max(1, t - forget + 1), t - delay + 1):
            sharers = (sharers + learned[d]) % mod
        learned[t] = sharers
    result = 0
    for d in range(max(1, n - forget + 1), n + 1):
        result = (result + learned[d]) % mod
    return result
`
