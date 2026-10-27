export function parseInput(text) {
  const data = JSON.parse(text)
  const { left, right } = data ?? {}
  if (!Number.isInteger(left) || !Number.isInteger(right) || left < 1 || right > 10000 || left > right) throw new Error('left and right must be integers with 1 ≤ left ≤ right ≤ 10,000.')
  return { left, right }
}

// A number is self-dividing when it has no zero digit and each digit divides it.
export function buildTrace({ left, right }) {
  const found = []
  const frames = [{ phase: 'start', n: left, found: [], activeLine: 1, message: `Check every number from ${left} to ${right}.` }]
  for (let n = left; n <= right; n++) {
    const digits = String(n).split('').map(Number)
    const ok = digits.every(d => d !== 0 && n % d === 0)
    if (ok) found.push(n)
    frames.push({ phase: ok ? 'keep' : 'skip', n, ok, found: [...found], activeLine: ok ? 5 : 4, message: `${n}: ${digits.map(d => (d === 0 ? '0 (rejected)' : n % d === 0 ? `${d} divides` : `${d} does not divide`)).join(', ')}.` })
  }
  frames.push({ phase: 'done', n: right, found: [...found], result: found, activeLine: 6, message: `${found.length} self-dividing number${found.length === 1 ? '' : 's'} found.` })
  return { input: { left, right }, result: found, frames }
}

export const code = `set found to an empty list
for each candidate n from left to right
  split n into its decimal digits
  if a digit is zero or n is not divisible by some digit, skip n
  otherwise append n to found
return found`.split('\n').map((text, index) => ({ line: index + 1, text }))

// The scan-family visualizer reports its own step numbers (1 setup, 3 digits, 4 decision, 5 return).
// This maps them onto the pseudocode lines above.
export const LINE_MAP = { 1: 1, 3: 3, 4: 4, 5: 6 }

export const python = `def self_dividing_numbers(left, right):
    found = []
    for n in range(left, right + 1):
        digits = [int(d) for d in str(n)]
        if all(d != 0 and n % d == 0 for d in digits):
            found.append(n)
    return found`
