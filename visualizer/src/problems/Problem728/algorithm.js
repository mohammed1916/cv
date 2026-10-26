export function parseInput(text) {
  const data = JSON.parse(text)
  const { left, right } = data ?? {}
  if (!Number.isInteger(left) || !Number.isInteger(right) || left < 1 || right > 10000 || left > right) throw new Error('left and right must be integers with 1 ≤ left ≤ right ≤ 10,000.')
  return { left, right }
}

// A number is self-dividing when it has no zero digit and each digit divides it.
export function buildTrace({ left, right }) {
  const found = []
  const frames = [{ phase: 'start', n: left, found: [], activeLine: 2, message: `Check every number from ${left} to ${right}.` }]
  for (let n = left; n <= right; n++) {
    const digits = String(n).split('').map(Number)
    const ok = digits.every(d => d !== 0 && n % d === 0)
    if (ok) found.push(n)
    frames.push({ phase: ok ? 'keep' : 'skip', n, ok, found: [...found], activeLine: ok ? 6 : 5, message: `${n}: ${digits.map(d => (d === 0 ? '0 (rejected)' : n % d === 0 ? `${d} divides` : `${d} does not divide`)).join(', ')}.` })
  }
  frames.push({ phase: 'done', n: right, found: [...found], result: found, activeLine: 8, message: `${found.length} self-dividing number${found.length === 1 ? '' : 's'} found.` })
  return { input: { left, right }, result: found, frames }
}

export const code = `def selfDividingNumbers(left, right):
    def ok(n):
        return all(d != '0' and n % int(d) == 0 for d in str(n))
    return [n for n in range(left, right + 1) if ok(n)]`.split('\n').map((text, index) => ({ line: index + 1, text }))
