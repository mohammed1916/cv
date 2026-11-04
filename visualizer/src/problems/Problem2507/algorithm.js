const CODE = [
  'function primeFactorSum(x) {',
  '  let total = 0',
  '  let v = x',
  '  for (let d = 2; d * d <= v; d++) {',
  '    while (v % d === 0) { total += d; v /= d }',
  '  }',
  '  if (v > 1) total += v',
  '  return total',
  '}',
  '',
  'function smallestFixedValue(n) {',
  '  let current = n',
  '  for (;;) {',
  '    const s = primeFactorSum(current)',
  '    if (s === current) return current',
  '    current = s',
  '  }',
  '}',
]

const PY = [
  'def prime_factor_sum(x):',
  '    total = 0',
  '    d = 2',
  '    while d * d <= x:',
  '        while x % d == 0:',
  '            total += d',
  '            x //= d',
  '        d += 1',
  '    if x > 1:',
  '        total += x',
  '    return total',
  '',
  'def smallest_fixed_value(n):',
  '    current = n',
  '    while True:',
  '        s = prime_factor_sum(current)',
  '        if s == current:',
  '            return current',
  '        current = s',
]

const at = (lines, text) => {
  const index = lines.findIndex(line => line.trim() === text.trim())
  if (index < 0) throw new Error(`Missing trace line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with n.' },
  { id: 'replace', label: 'Replace', description: 'Replace the value with the sum of its prime factors.' },
  { id: 'fixed', label: 'Fixed', description: 'The value no longer changes.' },
  { id: 'done', label: 'Complete', description: 'Report the settled value.' },
]

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with n.')
  const { n } = data
  if (!Number.isInteger(n) || n < 2 || n > 1000) throw new Error('n must be an integer from 2 to 1000.')
  return { n }
}

const factorSum = x => {
  let total = 0
  let v = x
  for (let d = 2; d * d <= v; d++) {
    while (v % d === 0) { total += d; v /= d }
  }
  if (v > 1) total += v
  return total
}

// The prime factors of x with repeats, smallest first. Used only to show the sum on the page.
const primeFactors = x => {
  const out = []
  let v = x
  for (let d = 2; d * d <= v; d++) while (v % d === 0) { out.push(d); v /= d }
  if (v > 1) out.push(v)
  return out
}

export function buildTrace({ n }) {
  const chain = [n]
  let current = n
  const frames = [{ pythonLine: at(PY, 'current = n'), activeLine: at(CODE, 'let current = n'), phase: 'start', index: 0, chain: [...chain], factors: primeFactors(current), message: `Start with ${n}.` }]
  for (;;) {
    const s = factorSum(current)
    if (s === current) {
      frames.push({ pythonLine: at(PY, 'if s == current:'), activeLine: at(CODE, 'if (s === current) return current'), phase: 'fixed', index: chain.length - 1, chain: [...chain], factors: primeFactors(current), message: `${current} is the sum of its own prime factors, so it no longer changes.` })
      break
    }
    frames.push({ pythonLine: at(PY, 's = prime_factor_sum(current)'), activeLine: at(CODE, 'const s = primeFactorSum(current)'), phase: 'replace', index: chain.length - 1, chain: [...chain], factors: primeFactors(current), message: `Replace ${current} with ${s}.` })
    current = s
    chain.push(current)
    frames.push({ pythonLine: at(PY, 'current = s'), activeLine: at(CODE, 'current = s'), phase: 'replace', index: chain.length - 1, chain: [...chain], factors: primeFactors(current), message: `Now the value is ${current}.` })
  }
  frames.push({ pythonLine: at(PY, 'return current'), activeLine: at(CODE, 'if (s === current) return current'), phase: 'done', index: chain.length - 1, chain: [...chain], factors: primeFactors(current), message: `Smallest value: ${current}.` })
  return { input: { n }, chain, result: current, frames }
}

export const code = CODE.map((text, index) => ({ line: index + 1, text }))
export const python = PY.join('\n') + '\n'
