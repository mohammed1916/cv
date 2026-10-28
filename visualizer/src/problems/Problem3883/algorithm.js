const MOD = 1000000007
const LIMIT = 5000

export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.digit_sum)) throw new Error('Use a JSON object with a "digit_sum" array.')
  const { digit_sum: sums } = obj
  if (sums.length < 1 || sums.length > 6) throw new Error('digit_sum must have 1 to 6 entries for this visualization.')
  if (sums.some(s => !Number.isInteger(s) || s < 0 || s > 50)) throw new Error('Each digit sum must be an integer from 0 to 50.')
  return { digit_sum: sums }
}

const digitSum = v => String(v).split('').reduce((a, c) => a + Number(c), 0)

export function buildTrace({ digit_sum: sums }) {
  let ways = new Array(LIMIT + 1).fill(0)
  for (let v = 0; v <= LIMIT; v++) if (digitSum(v) === sums[0]) ways[v] = 1
  const frames = [{ phase: 'start', activeLine: L('set limit to'), position: 0, total: null, result: null, message: `Position 0 may hold any value from 0 to ${LIMIT} with digit sum ${sums[0]}.` }]
  for (let p = 1; p < sums.length; p++) {
    let running = 0
    const next = new Array(LIMIT + 1).fill(0)
    for (let v = 0; v <= LIMIT; v++) {
      running = (running + ways[v]) % MOD
      if (digitSum(v) === sums[p]) next[v] = running
    }
    ways = next
    const total = ways.reduce((a, b) => (a + b) % MOD, 0)
    frames.push({ phase: 'position', activeLine: L('if the digit sum of v equals digit_sum[p]'), position: p, total, result: null, message: `Position ${p} with digit sum ${sums[p]}: ${total} ways so far.` })
  }
  const result = ways.reduce((a, b) => (a + b) % MOD, 0)
  frames.push({ phase: 'done', activeLine: L('return the sum of ways'), position: sums.length - 1, total: result, result, message: `Total count modulo 1000000007: ${result}.` })
  return { input: { digit_sum: sums }, result, frames }
}

export const code = `count non decreasing arrays with given digit sums (digit_sum):
  set limit to 5000
  set ways to a table over values 0 to limit, all zero
  for each value v from 0 to limit
    if the digit sum of v equals digit_sum[0] then
      set ways[v] to 1
  for each later position p in digit_sum
    set running to 0
    set next to a table over values 0 to limit, all zero
    for each value v from 0 to limit
      add ways[v] to running
      if the digit sum of v equals digit_sum[p] then
        set next[v] to running
    set ways to next
  return the sum of ways, modulo 1000000007

a value can follow every smaller value that was counted at the previous position`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_non_decreasing(digit_sum):
    MOD = 10**9 + 7
    LIMIT = 5000

    def ds(v):
        return sum(int(c) for c in str(v))

    ways = [1 if ds(v) == digit_sum[0] else 0 for v in range(LIMIT + 1)]
    for s in digit_sum[1:]:
        running = 0
        nxt = [0] * (LIMIT + 1)
        for v in range(LIMIT + 1):
            running = (running + ways[v]) % MOD
            if ds(v) == s:
                nxt[v] = running
        ways = nxt
    return sum(ways) % MOD
`
