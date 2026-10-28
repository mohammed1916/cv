export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with integer fields steps and arr_len.')
  const { steps, arr_len: arrLen } = input
  if (!Number.isInteger(steps) || steps < 1 || steps > 12) throw new Error('steps must be an integer from 1 to 12.')
  if (!Number.isInteger(arrLen) || arrLen < 1 || arrLen > 12) throw new Error('arr_len must be an integer from 1 to 12.')
  return { steps, arr_len: arrLen }
}

const MOD = 1000000007
const copyTable = table => table.map(row => [...row])

export function buildTrace(input) {
  const { steps, arr_len: arrLen } = input
  const history = [Array(arrLen).fill(0)]
  history[0][0] = 1
  const frames = [{ phase: 'start', activeLine: L('set ways[0] to 1'), step: 0, position: -1, table: copyTable(history), total: null, message: 'Start at index 0: one way.' }]
  for (let t = 1; t <= steps; t++) {
    const row = Array(arrLen).fill(0)
    for (let p = 0; p < arrLen; p++) {
      let total = history[t - 1][p]
      if (p > 0) total += history[t - 1][p - 1]
      if (p < arrLen - 1) total += history[t - 1][p + 1]
      row[p] = total % MOD
      frames.push({ phase: 'cell', activeLine: L('set ways[t][p] to total'), step: t, position: p, table: copyTable([...history, row]), total: null, message: `After ${t} step(s) at index ${p}: ${row[p]} ways.` })
    }
    history.push(row)
  }
  const result = history[steps][0]
  frames.push({ phase: 'done', activeLine: L('return ways[steps][0]'), step: steps, position: 0, table: copyTable(history), total: result, message: `${result} ways to be at index 0 after ${steps} steps.` })
  return { input, result, frames }
}

export const code = `number of ways to stay at index 0 (steps, arr_len):
  set ways[0] to 1 at index 0 and 0 elsewhere
  for each step t from 1 to steps:
    for each index p from 0 to arr_len - 1:
      set total to the ways at p in step t - 1
      if p is above 0 then add the ways at p - 1 in step t - 1
      if p is below arr_len - 1 then add the ways at p + 1 in step t - 1
      set ways[t][p] to total modulo 1000000007
  return ways[steps][0]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def num_ways(steps, arr_len):
    MOD = 1000000007
    dp = [0] * arr_len
    dp[0] = 1
    for _ in range(steps):
        nxt = [0] * arr_len
        for p in range(arr_len):
            total = dp[p]
            if p > 0:
                total += dp[p - 1]
            if p < arr_len - 1:
                total += dp[p + 1]
            nxt[p] = total % MOD
        dp = nxt
    return dp[0]
`
