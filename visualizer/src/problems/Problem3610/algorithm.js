// Minimum Number of Primes to Sum to Target. The primes are coins; a sum is built
// one prime at a time, and best[x] is the fewest primes that reach x.

const MAX_TARGET = 60

const CODE_TEXT = [
  'FUNCTION minPrimes(target)',
  '    primes ← every prime p with p ≤ target',
  '    best[0] ← 0 and best[x] ← unset for x from 1 to target',
  '    FOR x from 1 to target',
  '        FOR each prime p ≤ x in increasing order',
  '            IF best[x − p] is set, try best[x − p] + 1 for best[x]',
  '    IF best[target] is unset RETURN -1',
  '    RETURN best[target]',
]

const PY = [
  'def min_primes_to_target(target):',
  '    primes = [p for p in range(2, target + 1) if is_prime(p)]',
  '    best = [0] + [None] * target',
  '    for x in range(1, target + 1):',
  '        for p in primes:',
  '            if p > x:',
  '                break',
  '            if best[x - p] is not None and (best[x] is None or best[x - p] + 1 < best[x]):',
  '                best[x] = best[x - p] + 1',
  '    return -1 if best[target] is None else best[target]',
  '',
  'def is_prime(n):',
  '    return n >= 2 and all(n % d for d in range(2, int(n ** 0.5) + 1))',
  '',
  'if __name__ == "__main__":',
  '    import sys, json',
  '    print(json.dumps(min_primes_to_target(json.loads(sys.stdin.read()))))',
]

const PHASES = [
  { id: 'setup', label: 'Primes', description: 'List the primes up to the target.' },
  { id: 'fill', label: 'Fill', description: 'Find the fewest primes for each sum.' },
  { id: 'try', label: 'Try prime', description: 'Extend a smaller sum by one prime.' },
  { id: 'done', label: 'Result', description: 'Report the count, or -1 when impossible.' },
]

export const code = CODE_TEXT.map((text, index) => ({ line: index + 1, text }))
export const python = PY.join('\n')
export const phases = PHASES

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = PY.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

function isPrime(n) {
  if (n < 2) return false
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false
  return true
}

export function parseInput(text) {
  const target = JSON.parse(text)
  if (!Number.isInteger(target) || target < 1 || target > MAX_TARGET) {
    throw new Error(`Use an integer target from 1 to ${MAX_TARGET}.`)
  }
  return target
}

export function buildTrace(target) {
  const primes = []
  for (let p = 2; p <= target; p++) if (isPrime(p)) primes.push(p)
  const best = [0, ...Array(target).fill(null)]
  const frames = []
  frames.push({ pythonLine: P('primes = ['), phase: 'setup', activeLine: L('every prime'), x: 0, p: null, from: null, best: [...best], message: `Coins are the primes up to ${target}: ${primes.join(', ')}.` })
  for (let x = 1; x <= target; x++) {
    frames.push({ pythonLine: P('for x in range'), phase: 'fill', activeLine: L('FOR x from 1'), x, p: null, from: null, best: [...best], message: `Find the fewest primes that sum to ${x}.` })
    for (const p of primes) {
      if (p > x) {
        frames.push({ pythonLine: P('break'), phase: 'try', activeLine: L('FOR each prime p ≤ x'), x, p, from: null, best: [...best], message: `${p} is larger than ${x}, so stop trying primes for ${x}.` })
        break
      }
      const prev = best[x - p]
      if (prev !== null && (best[x] === null || prev + 1 < best[x])) best[x] = prev + 1
      frames.push({
        pythonLine: P('best[x] = best[x - p] + 1'), phase: 'try', activeLine: L('IF best[x − p] is set'), x, p, from: x - p, best: [...best],
        message: prev === null
          ? `${x - p} is unreachable, so ${p} alone does not help ${x}.`
          : `${x - p} needs ${prev} prime${prev === 1 ? '' : 's'}; adding ${p} gives ${best[x]} for ${x}.`,
      })
    }
  }
  const result = best[target] === null ? -1 : best[target]
  frames.push({ pythonLine: P('return -1 if'), phase: 'done', activeLine: L('RETURN best[target]'), x: target, p: null, from: null, best: [...best], result, message: result === -1 ? `${target} cannot be a sum of primes.` : `${target} needs ${result} primes.` })
  return { input: target, primes, result, frames }
}

