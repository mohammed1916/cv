// Teaching model written for this visualizer. The sample values and wording are original.
export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use a JSON object with num.')
  const { num } = input
  if (!Number.isInteger(num) || num < 1 || num > 1000000000) throw new Error('num must be an integer from 1 to 1000000000.')
  return { num }
}

const CODE = [
  'function closestDivisors(num) {',
  '  let best = null',
  '  for (const target of [num + 1, num + 2]) {',
  '    let a = Math.floor(Math.sqrt(target))',
  '    while (target % a !== 0) a -= 1',
  '    const pair = [a, target / a]',
  '    if (best === null || pair[1] - pair[0] < best[1] - best[0]) best = pair',
  '  }',
  '  return best',
  '}',
]
export const code = CODE.map((text, index) => ({ line: index + 1, text }))

export const python = `from math import isqrt

def closest_divisors(num):
    best = None
    for target in (num + 1, num + 2):
        a = isqrt(target)
        while target % a != 0:
            a -= 1
        pair = [a, target // a]
        if best is None or pair[1] - pair[0] < best[1] - best[0]:
            best = pair
    return best
`
const PY = python.split('\n')
const at = (lines, text) => {
  const index = lines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing solver line: ${text}`)
  return index + 1
}
const L = text => at(CODE, text)
const P = text => at(PY, text)

// Each target is scanned downward from its square root until a divisor is found.
export function buildTrace({ num }) {
  const targets = [num + 1, num + 2]
  const frames = []
  const pairs = []
  let best = null
  frames.push({ phase: 'start', pythonLine: P('for target in'), activeLine: L('let best = null'), target: null, candidate: null, scanned: [], pairs: [], message: `Look for the closest factor pair of ${targets[0]} and of ${targets[1]}.` })
  for (const target of targets) {
    let a = Math.floor(Math.sqrt(target))
    frames.push({ phase: 'search', pythonLine: P('a = isqrt'), activeLine: L('let a = Math.floor'), target, candidate: a, scanned: [], pairs: pairs.slice(), message: `For ${target}, start at the square root: candidate ${a}.` })
    const scanned = []
    while (target % a !== 0) {
      scanned.push(a)
      frames.push({ phase: 'search', pythonLine: P('while target'), activeLine: L('while (target % a'), target, candidate: a, scanned: [...scanned], pairs: pairs.slice(), message: `${target} is not divisible by ${a}, so try ${a - 1}.` })
      a -= 1
    }
    const pair = [a, target / a]
    pairs.push(pair)
    frames.push({ phase: 'search', pythonLine: P('pair = ['), activeLine: L('const pair = [a'), target, candidate: a, scanned: [...scanned], pairs: pairs.slice(), message: `${target} = ${pair[0]} x ${pair[1]}, with a gap of ${pair[1] - pair[0]}.` })
    if (best === null || pair[1] - pair[0] < best[1] - best[0]) best = pair
    frames.push({ phase: 'search', pythonLine: P('if best is None'), activeLine: L('if (best === null'), target: null, candidate: null, scanned: [], pairs: pairs.slice(), message: `Best pair so far is ${best[0]} and ${best[1]}.` })
  }
  frames.push({ phase: 'done', pythonLine: P('return best'), activeLine: L('return best'), target: null, candidate: null, scanned: [], pairs, message: `The closest pair is ${best[0]} and ${best[1]}.` })
  return { input: { num }, result: best, targets, pairs, frames }
}
