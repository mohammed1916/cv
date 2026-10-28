export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Number.isInteger(input.k)) throw new Error('Use a JSON object with an integer k.')
  if (input.k < 2 || input.k > 60) throw new Error('k must be an integer from 2 to 60 (visualization cap).')
  return input
}

export function buildTrace(input) {
  const { k } = input
  let remainder = 0
  const remainders = []
  const frames = [{ phase: 'start', activeLine: L('remainder = 0'), length: 0, remainder, remainders: [], message: `Track the all-ones numbers 1, 11, 111, ... modulo ${k}.` }]
  for (let length = 1; length <= k; length++) {
    remainder = (remainder * 10 + 1) % k
    remainders.push(remainder)
    if (remainder === 0) {
      frames.push({ phase: 'found', activeLine: L('if remainder is 0 then return the length'), length, remainder, remainders: [...remainders], message: `The ${length}-digit number of ones is divisible by ${k}.` })
      return { input, result: length, frames, remainders }
    }
    frames.push({ phase: 'step', activeLine: L('remainder = (remainder times 10'), length, remainder, remainders: [...remainders], message: `${length} digit(s): remainder ${remainder}.` })
  }
  frames.push({ phase: 'none', activeLine: L('return -1'), length: k, remainder, remainders: [...remainders], message: `No all-ones number is divisible by ${k}.` })
  return { input, result: -1, frames, remainders }
}

export const code = `smallest all ones multiple (k):
  remainder = 0
  for each length from 1 to k
    remainder = (remainder times 10 plus 1) mod k
    if remainder is 0 then return the length
  return -1`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def smallest_all_ones_multiple(k):
    remainder = 0
    for length in range(1, k + 1):
        remainder = (remainder * 10 + 1) % k
        if remainder == 0:
            return length
    return -1
`
