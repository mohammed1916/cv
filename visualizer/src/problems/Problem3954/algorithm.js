export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || !Number.isInteger(data.n) || !Number.isInteger(data.k)) throw new Error('Use {"n": n, "k": k} with integers.')
  if (data.n < 1 || data.n > 100) throw new Error('n is an integer from 1 to 100.')
  if (data.k < 1 || data.k > 100) throw new Error('k is an integer from 1 to 100.')
  return { n: data.n, k: data.k }
}

export function buildTrace(input) {
  const { n, k } = input
  let total = 0
  const low = Math.max(1, n - k)
  const high = n + k
  const frames = [{ phase: 'start', activeLine: L('let total be 0'), x: null, total, compatible: null, range: null, message: `Only x from ${low} to ${high} can satisfy |n - x| <= ${k}.` }]
  for (let x = low; x <= high; x++) {
    const ok = (n & x) === 0
    if (ok) total += x
    frames.push({ phase: ok ? 'add' : 'skip', activeLine: L('if n and x have no common set bit'), x, total, compatible: ok, range: [low, high], message: ok ? `${x} shares no set bit with ${n}, so add it. Total ${total}.` : `${x} shares a set bit with ${n}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return total'), x: null, total, compatible: null, range: [low, high], message: `Sum of compatible numbers: ${total}.` })
  return { input, result: total, frames }
}

export const code = `sum of compatible numbers in range
  let total be 0
  let low be the larger of 1 and n minus k
  let high be n plus k
  for each x from low to high
    if n and x have no common set bit then add x to total
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def sum_of_compatible_numbers_in_range(n, k):
    total = 0
    low = max(1, n - k)
    high = n + k
    for x in range(low, high + 1):
        if n & x == 0:
            total += x
    return total
`
