export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with integer fields n and k.')
  const { n, k } = input
  if (!Number.isInteger(n) || n < 1 || n > 30) throw new Error('n must be an integer from 1 to 30.')
  if (!Number.isInteger(k) || k < 1 || k > 30) throw new Error('k must be an integer from 1 to 30.')
  return { n, k }
}

const MOD = 1000000007

export function buildTrace(input) {
  const { n, k } = input
  const a = Array(n).fill(1)
  const frames = [{ phase: 'start', activeLine: L('make a list'), a: [...a], second: 0, index: -1, message: `Every position starts at 1. Apply ${k} seconds.` }]
  for (let second = 1; second <= k; second++) {
    for (let i = 1; i < n; i++) {
      a[i] = (a[i] + a[i - 1]) % MOD
      frames.push({ phase: 'update', activeLine: L('add the value before'), a: [...a], second, index: i, message: `Second ${second}: index ${i} becomes ${a[i]}, the running total so far.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return the last value'), a: [...a], second: k, index: n - 1, message: `After ${k} seconds the last value is ${a[n - 1]}.` })
  return { input, result: a[n - 1], frames }
}

export const code = `nth value after k seconds (n, k):
  make a list a of n ones
  repeat k times:
    for each index i from 1 to n - 1:
      add the value before index i into a[i]
      take the result modulo 1000000007
  return the last value of a`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def nth_value_after_k_seconds(n, k):
    MOD = 1000000007
    a = [1] * n
    for _ in range(k):
        for i in range(1, n):
            a[i] = (a[i] + a[i - 1]) % MOD
    return a[n - 1]
`
