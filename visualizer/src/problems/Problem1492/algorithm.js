export const phases = [
  { id: 'start', label: 'Start', description: 'Begin counting factors from 1 upward with no factors found yet.' },
  { id: 'scan', label: 'Test divisor', description: 'Check whether the current candidate divides n.' },
  { id: 'count', label: 'Count factor', description: 'The candidate divides n, so it is the next factor in ascending order.' },
  { id: 'done', label: 'Complete', description: 'Return the kth factor, or -1 when n has fewer than k factors.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"n": 12, "k": 3}.')
  const { n, k } = input
  if (!Number.isInteger(n) || n < 1 || n > 1000) throw new Error('n is an integer from 1 to 1000.')
  if (!Number.isInteger(k) || k < 1 || k > 1000) throw new Error('k is an integer from 1 to 1000.')
  return { n, k }
}

export function buildTrace({ n, k }) {
  const at = line => ({ activeLine: line, pythonLine: line })
  const snap = (candidate, count, factors) => ({ candidate, count, factors: [...factors], k })
  const factors = []
  const frames = [{ phase: 'start', ...at(2), snapshot: snap(null, 0, factors), message: `Find factor number ${k} of ${n}, counting from 1 upward.` }]
  let count = 0
  let result = -1
  for (let d = 1; d <= n; d++) {
    if (n % d !== 0) {
      frames.push({ phase: 'scan', ...at(4), snapshot: snap(d, count, factors), message: `${d} does not divide ${n}.` })
      continue
    }
    count++
    factors.push(d)
    frames.push({ phase: 'count', ...at(5), snapshot: snap(d, count, factors), message: `${d} divides ${n}. It is factor number ${count}.` })
    if (count === k) {
      result = d
      break
    }
  }
  frames.push({ phase: 'done', ...at(result === -1 ? 8 : 7), snapshot: snap(null, count, factors),
    message: result === -1 ? `${n} has only ${count} factor(s), so return -1.` : `Factor number ${k} is ${result}. Return it.` })
  return { input: { n, k }, result, frames }
}

const pseudo = [
  'kth factor(n, k):',
  '  count = 0',
  '  for d from 1 to n:',
  '    if n is divisible by d:',
  '      count += 1',
  '      if count == k:',
  '        return d',
  '  return -1',
]

const pythonLines = [
  'def kth_factor(n, k):',
  '    count = 0',
  '    for d in range(1, n + 1):',
  '        if n % d == 0:',
  '            count += 1',
  '            if count == k:',
  '                return d',
  '    return -1',
]

export const code = pseudo.map((text, index) => ({ line: index + 1, text }))
export const python = pythonLines.join('\n')
