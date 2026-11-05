export function parseInput(text) {
  const n = JSON.parse(text)
  if (!Number.isInteger(n) || n < 1 || n > 50) throw new Error('Enter an integer n from 1 to 50 (the trace shows the whole table).')
  return n
}

// dp[i] is the most A's reachable in i key presses. Either press A once more, or copy a block that ends
// at key j and paste it (i − j − 1) times after one copy-select-all, for j at most i − 3.
export function buildTrace(n) {
  const dp = Array(n + 1).fill(0)
  const frames = [{ phase: 'start', dp: [...dp], index: 0, split: null, activeLine: L('const dp = Array'), pythonLine: P('dp = [0]'), message: 'dp[i] is the best screen length after i key presses.' }]
  for (let i = 1; i <= n; i++) {
    dp[i] = dp[i - 1] + 1
    let split = null
    frames.push({ phase: 'press', dp: [...dp], index: i, split, activeLine: L('dp[i] = dp[i - 1] + 1'), pythonLine: P('dp[i] = dp[i - 1] + 1'), message: `Press A: dp[${i}] starts at ${dp[i]}.` })
    for (let j = 1; j <= i - 3; j++) {
      const candidate = dp[j] * (i - j - 1)
      if (candidate > dp[i]) {
        dp[i] = candidate
        split = j
        frames.push({ phase: 'paste', dp: [...dp], index: i, split: j, activeLine: L('dp[i] = Math.max'), pythonLine: P('dp[i] = max('), message: `Copy at key ${j} and paste ${i - j - 1} times: ${dp[j]} × ${i - j - 1} = ${candidate}, the new best for key ${i}.` })
      }
    }
  }
  const result = dp[n]
  frames.push({ phase: 'done', dp: [...dp], index: n, split: null, result, activeLine: L('return dp[n]'), pythonLine: P('return dp[n]'), message: `Most A's after ${n} presses: ${result}.` })
  return { input: n, result, frames }
}

const SOURCE = `function maxA(n) {
  const dp = Array(n + 1).fill(0)
  for (let i = 1; i <= n; i++) {
    dp[i] = dp[i - 1] + 1
    for (let j = 1; j <= i - 3; j++) {
      dp[i] = Math.max(dp[i], dp[j] * (i - j - 1))
    }
  }
  return dp[n]
}`
export const code = SOURCE.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_a(n):
    dp = [0] * (n + 1)
    for i in range(1, n + 1):
        dp[i] = dp[i - 1] + 1
        for j in range(1, i - 2):
            dp[i] = max(dp[i], dp[j] * (i - j - 1))
    return dp[n]`
const P = s => python.split('\n').findIndex(t => t.includes(s)) + 1
