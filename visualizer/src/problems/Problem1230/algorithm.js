export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with prob and target.')
  const { prob, target } = input
  if (!Array.isArray(prob) || prob.length < 1 || prob.length > 8) throw new Error('prob lists 1 to 8 coins.')
  if (!prob.every(p => typeof p === 'number' && p >= 0 && p <= 1)) throw new Error('Each probability is a number from 0 to 1.')
  if (!Number.isInteger(target) || target < 0 || target > prob.length) throw new Error('target is a whole number from 0 to the number of coins.')
  return { prob, target }
}

export function buildTrace({ prob, target }) {
  const n = prob.length
  const dp = [1, ...Array(n).fill(0)]
  const frames = []
  const snap = () => dp.slice()
  frames.push({ pythonLine: 2, phase: 'start', activeLine: L('set dp[0]'), coin: -1, p: null, j: -1, dp: snap(), target, message: 'Before any coin, zero heads has probability 1.' })
  for (let i = 0; i < n; i++) {
    const p = prob[i]
    frames.push({ pythonLine: 3, phase: 'coin', activeLine: L('for each coin'), coin: i, p, j: -1, dp: snap(), target, message: `Toss coin ${i + 1}, whose heads chance is ${p}.` })
    for (let j = i + 1; j >= 0; j--) {
      const stay = dp[j] * (1 - p)
      const fromBelow = j > 0 ? dp[j - 1] * p : 0
      dp[j] = stay + fromBelow
      const tail = `${j} heads keeps ${stay.toFixed(4)} from tails`
      const head = j > 0 ? ` and gains ${fromBelow.toFixed(4)} from ${j - 1} heads` : ''
      frames.push({ pythonLine: 5, phase: 'update', activeLine: L('dp[j] = dp[j]'), coin: i, p, j, dp: snap(), target, message: `${tail}${head}.` })
    }
  }
  const answer = dp[target]
  frames.push({ pythonLine: 6, phase: 'done', activeLine: L('return dp[target]'), coin: n, p: null, j: target, dp: snap(), target, message: `Exactly ${target} heads has probability ${answer.toFixed(5)}.` })
  return { input: { prob, target }, result: answer, frames }
}

export const code = `toss strange coins for prob and target
  set dp[0] to 1 and every other dp entry to 0
  for each coin index i with heads probability p
    for j from i + 1 down to 0
      dp[j] = dp[j] * (1 - p) + dp[j - 1] * p, where dp[-1] counts as 0
  return dp[target]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def toss_strange_coins(prob, target):
    dp = [1.0] + [0.0] * len(prob)
    for i, p in enumerate(prob):
        for j in range(i + 1, -1, -1):
            dp[j] = dp[j] * (1 - p) + (dp[j - 1] * p if j > 0 else 0.0)
    return dp[target]
`
