const MAX_LENGTH = 12

export function parseInput(text) {
  const data = JSON.parse(text)
  const { energy, k } = data ?? {}
  if (!Array.isArray(energy) || energy.length < 1 || energy.length > MAX_LENGTH || energy.some(v => !Number.isInteger(v) || v < -10 || v > 10)) throw new Error(`energy must be 1 to ${MAX_LENGTH} integers from -10 to 10.`)
  if (!Number.isInteger(k) || k < 1 || k > energy.length) throw new Error('k must be an integer from 1 to the length of energy.')
  return { energy, k }
}

export const code = `maximum energy collected by a starting wizard who jumps k ahead
  set total to an empty table with one entry per index
  for each index i from n minus 1 down to 0
    set total[i] to energy[i] plus total[i+k] when i plus k is less than n, otherwise energy[i]
  return the largest entry in total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ energy, k }) {
  const n = energy.length
  const total = Array(n).fill(0)
  const frames = [{ phase: 'start', index: -1, total: [...total], activeLine: L('set total to an empty'), message: 'Fill the table from the right end, where no jumps remain.' }]
  for (let i = n - 1; i >= 0; i--) {
    total[i] = energy[i] + (i + k < n ? total[i + k] : 0)
    frames.push({ phase: 'fill', index: i, total: [...total], activeLine: L('set total[i] to energy[i]'), message: `Start at ${i}: ${energy[i]} plus ${i + k < n ? `the value at ${i + k}` : 'nothing more'} gives ${total[i]}.` })
  }
  const result = Math.max(...total)
  frames.push({ phase: 'done', index: total.indexOf(result), total: [...total], activeLine: L('return the largest entry'), message: `Best start collects ${result}.` })
  return { input: { energy, k }, result, frames }
}

export const python = `def taking_maximum_energy(energy, k):
    n = len(energy)
    total = [0] * n
    for i in range(n - 1, -1, -1):
        total[i] = energy[i] + (total[i + k] if i + k < n else 0)
    return max(total)
`
