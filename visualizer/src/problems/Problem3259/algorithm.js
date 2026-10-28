const MAX_HOURS = 8

export function parseInput(text) {
  const data = JSON.parse(text)
  const { energy_drink_a: a, energy_drink_b: b } = data ?? {}
  const valid = arr => Array.isArray(arr) && arr.length >= 1 && arr.length <= MAX_HOURS && arr.every(v => Number.isInteger(v) && v >= 1 && v <= 10)
  if (!valid(a) || !valid(b)) throw new Error(`energy_drink_a and energy_drink_b need 1 to ${MAX_HOURS} integers from 1 to 10.`)
  if (a.length !== b.length) throw new Error('Both drinks need the same number of hours.')
  return { energy_drink_a: a, energy_drink_b: b }
}

export const code = `maximum energy when switching drinks costs one idle hour
  set a[0] to drink A at hour 0 and b[0] to drink B at hour 0
  for each hour i from 1 to n minus 1
    treat any entry before hour 0 as zero
    set a[i] to drink A at hour i plus the larger of a[i-1] and b[i-2]
    set b[i] to drink B at hour i plus the larger of b[i-1] and a[i-2]
  return the larger of a[n-1] and b[n-1]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ energy_drink_a: A, energy_drink_b: B }) {
  const n = A.length
  const a = Array(n).fill(0)
  const b = Array(n).fill(0)
  a[0] = A[0]
  b[0] = B[0]
  const frames = [{ phase: 'start', hour: 0, a: [...a], b: [...b], activeLine: L('set a[0] to drink A'), message: `Hour 0: drink A gives ${a[0]}, drink B gives ${b[0]}.` }]
  for (let i = 1; i < n; i++) {
    const a2 = i >= 2 ? a[i - 2] : 0
    const b2 = i >= 2 ? b[i - 2] : 0
    a[i] = A[i] + Math.max(a[i - 1], b2)
    b[i] = B[i] + Math.max(b[i - 1], a2)
    frames.push({ phase: 'hour', hour: i, a: [...a], b: [...b], activeLine: L('set a[i] to drink A'), message: `Hour ${i}: staying on A gives ${a[i - 1] + A[i]}, switching from B gives ${b2 + A[i]}; best on A is ${a[i]}.` })
  }
  const result = Math.max(a[n - 1], b[n - 1])
  frames.push({ phase: 'done', hour: n - 1, a: [...a], b: [...b], activeLine: L('return the larger of a[n-1]'), message: `Maximum energy: ${result}.` })
  return { input: { energy_drink_a: A, energy_drink_b: B }, result, frames }
}

export const python = `def maximum_energy_boost(energy_drink_a, energy_drink_b):
    n = len(energy_drink_a)
    a = [0] * n
    b = [0] * n
    a[0] = energy_drink_a[0]
    b[0] = energy_drink_b[0]
    for i in range(1, n):
        a2 = a[i - 2] if i >= 2 else 0
        b2 = b[i - 2] if i >= 2 else 0
        a[i] = energy_drink_a[i] + max(a[i - 1], b2)
        b[i] = energy_drink_b[i] + max(b[i - 1], a2)
    return max(a[n - 1], b[n - 1])
`
