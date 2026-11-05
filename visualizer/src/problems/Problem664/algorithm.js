export function parseInput(text) {
  const s = JSON.parse(text)
  if (typeof s !== 'string' || s.length < 1 || s.length > 30 || !/^[a-z]+$/.test(s)) throw new Error('Enter a JSON string of 1–30 lowercase letters.')
  return s
}

// dp[i][j] is the fewest turns to print s[i..j]. Start by printing s[i] alone; if s[k] matches s[i],
// that character can be printed in the same turn, which merges s[i] with the turn that prints s[k..j].
export function buildTrace(s) {
  const n = s.length
  const dp = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0))
  const frames = [{ phase: 'start', i: null, j: null, k: null, dp: snapshot(dp, n), activeLine: L('const dp = Array'), pythonLine: P('dp = [['), message: 'dp[i][j] is the fewest turns for the substring from i to j.' }]
  for (let i = n - 1; i >= 0; i--) {
    dp[i][i] = 1
    for (let j = i + 1; j < n; j++) {
      let best = dp[i + 1][j] + 1
      let chosen = null
      frames.push({ phase: 'cell', i, j, k: null, dp: snapshot(dp, n), activeLine: L('let best = dp[i + 1][j] + 1'), pythonLine: P('best = dp[i + 1][j] + 1'), message: `Substring ${s.slice(i, j + 1)}: printing ${s[i]} alone costs ${best}.` })
      for (let k = i + 1; k <= j; k++) {
        if (s[k] === s[i]) {
          const candidate = dp[i + 1][k - 1] + dp[k][j]
          if (candidate < best) { best = candidate; chosen = k }
          frames.push({ phase: 'merge', i, j, k, dp: snapshot(dp, n), activeLine: L('if (s[k] === s[i])'), pythonLine: P('if s[k] == s[i]'), message: `${s[k]} at ${k} matches ${s[i]} at ${i}: merge to cost ${candidate} (best ${best}).` })
        }
      }
      dp[i][j] = best
      frames.push({ phase: 'store', i, j, k: chosen, dp: snapshot(dp, n), activeLine: L('dp[i][j] = best'), pythonLine: P('dp[i][j] = best'), message: `dp[${i}][${j}] = ${best}.` })
    }
  }
  const result = n === 0 ? 0 : dp[0][n - 1]
  frames.push({ phase: 'done', i: 0, j: n - 1, k: null, dp: snapshot(dp, n), result, activeLine: L('dp[0][n - 1]'), pythonLine: P('return dp[0][n - 1]'), message: `Fewest turns for ${s}: ${result}.` })
  return { input: s, result, frames }
}

function snapshot(dp, n) {
  return dp.slice(0, n).map((row, i) => row.slice(0, n).map((value, j) => (j < i ? '' : value)))
}

const SOURCE = `function strangePrinter(s) {
  const n = s.length
  const dp = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0))
  for (let i = n - 1; i >= 0; i--) {
    dp[i][i] = 1
    for (let j = i + 1; j < n; j++) {
      let best = dp[i + 1][j] + 1
      for (let k = i + 1; k <= j; k++) {
        if (s[k] === s[i]) best = Math.min(best, dp[i + 1][k - 1] + dp[k][j])
      }
      dp[i][j] = best
    }
  }
  return n === 0 ? 0 : dp[0][n - 1]
}`
export const code = SOURCE.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def strange_printer(s):
    n = len(s)
    dp = [[0] * (n + 1) for _ in range(n + 1)]
    for i in range(n - 1, -1, -1):
        dp[i][i] = 1
        for j in range(i + 1, n):
            best = dp[i + 1][j] + 1
            for k in range(i + 1, j + 1):
                if s[k] == s[i]:
                    best = min(best, dp[i + 1][k - 1] + dp[k][j])
            dp[i][j] = best
    return dp[0][n - 1] if n else 0`
const P = s => python.split('\n').findIndex(t => t.includes(s)) + 1
