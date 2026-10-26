export function parseInput(text) {
  const target = JSON.parse(text)
  if (!Number.isInteger(target) || target < 1 || target > 2000) throw new Error('Enter a single integer target between 1 and 2000 (visualization cap; LeetCode allows 10,000).')
  return target
}
export function buildTrace(target) {
  const dp = new Array(target + 1).fill(0)
  const frames = [{ phase: 'start', t: 0, k: 0, best: 0, filled: 1, activeLine: 2, message: `dp[t] will hold the fewest instructions to reach position t exactly. dp[0] = 0.` }]
  for (let t = 1; t <= target; t++) {
    const k = t.toString(2).length
    if (t === 2 ** k - 1) {
      dp[t] = k
      frames.push({ phase: 'exact', t, k, best: k, filled: t + 1, activeLine: 6, message: `${t} = 2^${k} - 1, so ${k} accelerations in a row land exactly on it: dp[${t}] = ${k}.` })
      continue
    }
    dp[t] = k + 1 + dp[2 ** k - 1 - t]
    frames.push({ phase: 'overshoot', t, k, best: dp[t], filled: t, activeLine: 8,
      message: `Overshoot: ${k} accelerations reach ${2 ** k - 1}, then reverse (R) and drive back ${2 ** k - 1 - t}. Cost ${k} + 1 + dp[${2 ** k - 1 - t}] = ${dp[t]}.` })
    for (let j = 0; j < k - 1; j++) {
      const back = 2 ** (k - 1) - 2 ** j
      const cand = k + j + 1 + dp[t - back]
      dp[t] = Math.min(dp[t], cand)
      frames.push({ phase: 'backoff', t, k, j, back, cand, best: dp[t], filled: j === k - 2 ? t + 1 : t, activeLine: 11,
        message: `Stop after ${k - 1} accelerations (at ${2 ** (k - 1) - 1}), reverse, go ${j} steps back (${2 ** j - 1}), reverse again. That leaves ${t - back} to cover: cost ${k} + ${j} + 1 + dp[${t - back}] = ${cand}. Best so far ${dp[t]}.` })
    }
  }
  frames.push({ phase: 'done', t: target, k: target.toString(2).length, best: dp[target], filled: target + 1, activeLine: 12, message: `The shortest instruction sequence for target ${target} has length ${dp[target]}.` })
  return { input: target, dp, result: dp[target], frames }
}
export const code = `def racecar(target):
    dp = [0] * (target + 1)
    for t in range(1, target + 1):
        k = t.bit_length()
        if t == (1 << k) - 1:
            dp[t] = k
            continue
        dp[t] = k + 1 + dp[(1 << k) - 1 - t]
        for j in range(k - 1):
            back = (1 << (k - 1)) - (1 << j)
            dp[t] = min(dp[t], k + j + 1 + dp[t - back])
    return dp[target]`.split('\n').map((text, index) => ({ line: index + 1, text }))
