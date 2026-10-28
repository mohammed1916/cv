const isPrime = x => {
  if (x < 2) return false
  for (let d = 2; d * d <= x; d++) if (x % d === 0) return false
  return true
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input) || !Number.isInteger(input.num)) throw new Error('Use a JSON object with an integer num.')
  if (input.num < 1 || input.num > 1000000000) throw new Error('num must be an integer from 1 to 1000000000.')
  return input
}

export function buildTrace(input) {
  const s = String(input.num)
  const frames = [{ phase: 'start', activeLine: L('read the decimal digits'), span: null, message: `Check every prefix and suffix of ${s}.` }]
  let result = true
  for (let k = 1; k <= s.length && result; k++) {
    const prefix = Number(s.slice(0, k))
    const prefixPrime = isPrime(prefix)
    frames.push({ phase: 'check', activeLine: L('read the first k digits'), span: [0, k], message: `Prefix ${prefix} is ${prefixPrime ? 'prime' : 'not prime'}.` })
    if (!prefixPrime) { result = false; break }
    const suffix = Number(s.slice(s.length - k))
    const suffixPrime = isPrime(suffix)
    frames.push({ phase: 'check', activeLine: L('read the last k digits'), span: [s.length - k, s.length], message: `Suffix ${suffix} is ${suffixPrime ? 'prime' : 'not prime'}.` })
    if (!suffixPrime) { result = false; break }
  }
  frames.push({ phase: 'done', activeLine: result ? L('return true') : L('return false'), span: null, message: result ? `Every prefix and suffix of ${s} is prime, so it is complete.` : `${s} is not a Complete Prime Number.` })
  return { input, result, frames }
}

export const code = `complete prime number (num):
  read the decimal digits of num
  for each length k from 1 to the number of digits
    read the first k digits as a number, the prefix
    if the prefix is not prime then return false
    read the last k digits as a number, the suffix
    if the suffix is not prime then return false
  return true`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def is_prime(x):
    if x < 2:
        return False
    d = 2
    while d * d <= x:
        if x % d == 0:
            return False
        d += 1
    return True

def complete_prime_number(num):
    s = str(num)
    for k in range(1, len(s) + 1):
        if not is_prime(int(s[:k])):
            return False
        if not is_prime(int(s[-k:])):
            return False
    return True
`
