const MOD = 1000000007

export function parseInput(text) {
  const n = JSON.parse(text)
  if (!Number.isInteger(n) || n < 1 || n > 200) throw new Error('Enter an integer n from 1 to 200 (the trace shows every table cell).')
  return n
}

// D(k) counts arrangements of k items with no item in its own place.
// D(0) = 1, D(1) = 0, and D(i) = (i - 1) × (D(i - 1) + D(i - 2)), reduced modulo 1e9+7.
export function buildTrace(n) {
  const d = [1, 0]
  const frames = [{ phase: 'start', n, row: [...d], index: 1, result: null, activeLine: L('let previous = 1'), pythonLine: P('previous, current = 1, 0'), message: 'Start the table with D(0) = 1 and D(1) = 0.' }]
  for (let i = 2; i <= n; i++) {
    const next = ((i - 1) * (d[i - 1] + d[i - 2])) % MOD
    d.push(next)
    frames.push({ phase: 'fill', n, row: [...d], index: i, result: null, activeLine: L('const next'), pythonLine: P('previous, current = current'), message: `D(${i}) = (${i} − 1) × (D(${i - 1}) + D(${i - 2})) = ${next}.` })
  }
  const result = d[n]
  frames.push({ phase: 'done', n, row: [...d], index: n, result, activeLine: L('return current'), pythonLine: P('return current'), message: `D(${n}) = ${result}.` })
  return { input: n, result, frames }
}

const SOURCE = `function findDerangement(n) {
  const MOD = 1000000007
  let previous = 1
  let current = 0
  for (let i = 2; i <= n; i++) {
    const next = ((i - 1) * (current + previous)) % MOD
    previous = current
    current = next
  }
  return current
}`
export const code = SOURCE.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def find_derangement(n):
    MOD = 1000000007
    previous, current = 1, 0
    for i in range(2, n + 1):
        previous, current = current, (i - 1) * (current + previous) % MOD
    return current`
const P = s => python.split('\n').findIndex(t => t.includes(s)) + 1
