const TAIL = 10000000000n
const MAX_RIGHT = 1000

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use a JSON object with left and right.')
  const { left, right } = input
  if (!Number.isInteger(left) || !Number.isInteger(right) || left < 1 || right > MAX_RIGHT || left > right) {
    throw new Error(`left and right must be integers with 1 <= left <= right <= ${MAX_RIGHT}.`)
  }
  return { left, right }
}

export function buildTrace({ left, right }) {
  const frames = [{ phase: 'start', activeLine: L('set twos and fives'), index: -1, zeros: 0, message: `Multiply every integer from ${left} to ${right}.` }]
  let twos = 0
  let fives = 0
  let logSum = 0
  let stripped = 1n
  for (let i = left; i <= right; i++) {
    let x = i
    while (x % 2 === 0) { x /= 2; twos += 1 }
    while (x % 5 === 0) { x /= 5; fives += 1 }
    stripped = (stripped * BigInt(x)) % TAIL
    logSum += Math.log10(i)
    frames.push({ phase: 'multiply', activeLine: L('multiply the stripped'), index: i - left, zeros: Math.min(twos, fives), message: `Multiply in ${i}. Factors of 2 and 5 are counted, not multiplied.` })
  }
  const zeros = Math.min(twos, fives)
  let tail = stripped
  for (let k = 0; k < twos - zeros; k++) tail = (tail * 2n) % TAIL
  for (let k = 0; k < fives - zeros; k++) tail = (tail * 5n) % TAIL
  const trimmedLog = logSum - zeros
  let text
  if (trimmedLog < 10 - 1e-11) {
    text = `${tail}e${zeros}`
  } else {
    const frac = trimmedLog - Math.floor(trimmedLog)
    const head = Math.floor(10 ** (frac + 4))
    text = `${head}...${String(tail % 100000n).padStart(5, '0')}e${zeros}`
  }
  frames.push({ phase: 'done', activeLine: L('return the abbreviation'), index: right - left + 1, zeros, message: `The product abbreviates to ${text}.` })
  return { input: { left, right }, result: text, frames }
}

export const code = `abbreviate the product of the integers from left to right
set twos and fives to 0, and the stripped product to 1
for each integer i from left to right do
  remove every factor of 2 and count it in twos
  remove every factor of 5 and count it in fives
  multiply the stripped product by what is left, keeping the last 10 digits
  add log10 of i to the running logarithm
let zeros be the smaller of twos and fives
multiply the tail by the leftover 2s or 5s, keeping the last 10 digits
if the trimmed product has at most 10 digits then the answer is the whole number
otherwise the answer is its first 5 digits, three dots, and its last 5 digits
return the abbreviation with e and zeros appended`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `import math

def abbreviate_product(left, right):
    MOD = 10 ** 10
    twos = 0
    fives = 0
    log_sum = 0.0
    stripped = 1
    for i in range(left, right + 1):
        x = i
        while x % 2 == 0:
            x //= 2
            twos += 1
        while x % 5 == 0:
            x //= 5
            fives += 1
        stripped = stripped * x % MOD
        log_sum += math.log10(i)
    zeros = min(twos, fives)
    tail = stripped * pow(2, twos - zeros, MOD) * pow(5, fives - zeros, MOD) % MOD
    trimmed_log = log_sum - zeros
    if trimmed_log < 10 - 1e-11:
        return f"{tail}e{zeros}"
    frac = trimmed_log - math.floor(trimmed_log)
    head = int(10 ** (frac + 4))
    return f"{head}...{tail % 100000:05d}e{zeros}"
`
