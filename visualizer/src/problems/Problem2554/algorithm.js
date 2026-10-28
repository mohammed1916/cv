export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use a JSON object with banned, n and maxSum.')
  const { banned, n, maxSum } = data
  if (!Array.isArray(banned) || banned.length > 15 || banned.some(v => !Number.isInteger(v) || v < 1 || v > 20)) throw new Error('banned is a list of up to 15 integers from 1 to 20.')
  if (!Number.isInteger(n) || n < 1 || n > 15) throw new Error('n is an integer from 1 to 15.')
  if (!Number.isInteger(maxSum) || maxSum < 1 || maxSum > 60) throw new Error('maxSum is an integer from 1 to 60.')
  return { banned, n, maxSum }
}

export function buildTrace(input) {
  const { n, maxSum } = input
  const blocked = new Set(input.banned)
  let sum = 0
  let count = 0
  const frames = [{ phase: 'start', activeLine: L('set sum to zero'), value: 0, sum, count, message: `Choose from 1 to ${n}, skipping banned numbers, staying at or below ${maxSum}.` }]
  for (let v = 1; v <= n; v++) {
    if (blocked.has(v)) {
      frames.push({ phase: 'skip', activeLine: L('skip it if it is banned'), value: v, sum, count, message: `${v} is banned, so skip it.` })
      continue
    }
    if (sum + v > maxSum) {
      frames.push({ phase: 'stop', activeLine: L('stop here'), value: v, sum, count, message: `Taking ${v} would make ${sum + v}, above ${maxSum}. Stop.` })
      break
    }
    sum += v
    count += 1
    frames.push({ phase: 'take', activeLine: L('take it'), value: v, sum, count, message: `Take ${v}. Sum ${sum}, count ${count}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return count'), value: null, sum, count, message: `Most integers chosen: ${count}.` })
  return { input, result: count, frames }
}

export const code = `maximum number of distinct integers chosen from 1 to n:
  build a set of the banned numbers
  set sum to zero and count to zero
  for each integer v from 1 to n in order
    skip it if it is banned
    stop here if adding v would push sum above maxSum
    take it: add v to sum and add one to count
  return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def maximum_integers(banned, n, maxSum):
    blocked = set(banned)
    total = 0
    count = 0
    for v in range(1, n + 1):
        if v in blocked:
            continue
        if total + v > maxSum:
            break
        total += v
        count += 1
    return count
`
