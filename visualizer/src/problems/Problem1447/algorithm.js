export const phases = [
  { id: 'start', label: 'Start list', description: 'Begin with an empty list of reduced fractions.' },
  { id: 'denominator', label: 'Choose denominator', description: 'Each denominator from 2 to n offers numerators 1 up to one less than itself.' },
  { id: 'numerator', label: 'Try numerator', description: 'Take the next numerator for the current denominator.' },
  { id: 'check', label: 'Check gcd', description: 'The fraction is in lowest terms exactly when numerator and denominator share no factor above 1.' },
  { id: 'keep', label: 'Keep fraction', description: 'A gcd of 1 means the fraction is reduced, so it joins the result.' },
  { id: 'skip', label: 'Skip reducible', description: 'A larger gcd means a smaller fraction already has this value.' },
  { id: 'done', label: 'Result', description: 'Return every reduced fraction in denominator order.' },
]

export const code = `function simplifiedFractions(n):
    result = []
    for den from 2 to n:
        for num from 1 to den - 1:
            if gcd(num, den) equals 1:
                result.append(num + "/" + den)
    return result

function gcd(a, b):
    while b is not 0:
        a, b = b, a mod b
    return a`

export const python = `def simplified_fractions(n):
    result = []
    for den in range(2, n + 1):
        for num in range(1, den):
            if gcd(num, den) == 1:
                result.append(f"{num}/{den}")
    return result

def gcd(a, b):
    while b:
        a, b = b, a % b
    return a`

const lineOf = (source, fragment) => source.split('\n').findIndex(line => line.includes(fragment)) + 1
const C = fragment => lineOf(code, fragment)
const P = fragment => lineOf(python, fragment)

function gcd(a, b) {
  while (b) [a, b] = [b, a % b]
  return a
}

export function parseInput(text) {
  const n = Number(String(text).trim())
  if (!Number.isInteger(n) || n < 1 || n > 100) throw new Error('Enter a whole number from 1 to 100.')
  return n
}

export function buildTrace(n) {
  const frames = []
  const result = []
  let den = null, num = null, g = null
  const add = (phase, c, p, message) => frames.push({
    phase, activeLine: C(c), pythonLine: P(p), message,
    snapshot: { n, den, num, g, kept: result.length, recent: result.slice(-10) },
  })
  add('start', 'result = []', 'result = []', `Start with n = ${n}. No fractions are kept yet.`)
  for (den = 2; den <= n; den++) {
    g = null
    add('denominator', 'for den', 'for den', `Denominator ${den}: numerators 1 to ${den - 1} are candidates.`)
    for (num = 1; num < den; num++) {
      add('numerator', 'for num', 'for num', `Try ${num}/${den}.`)
      g = gcd(num, den)
      add('check', 'if gcd', 'if gcd', `gcd(${num}, ${den}) = ${g}.`)
      if (g === 1) {
        result.push(`${num}/${den}`)
        add('keep', 'result.append', 'result.append', `${num}/${den} is in lowest terms, so it is kept.`)
      } else {
        add('skip', 'if gcd', 'if gcd', `${num}/${den} shares the factor ${g}, so it equals a smaller fraction and is skipped.`)
      }
    }
  }
  add('done', 'return result', 'return result', `Found ${result.length} reduced fractions.`)
  return { input: n, result, frames }
}
