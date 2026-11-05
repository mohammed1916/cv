export const phases = [
  { id: 'start', label: 'Start', description: 'No character has been read; no good subsequence exists yet.' },
  { id: 'one', label: 'Read a 1', description: 'New good strings end in 1: the lone "1" plus every good string extended by 1.' },
  { id: 'zero', label: 'Read a 0', description: 'A 0 can only end a string that starts with 1, or stand alone as "0".' },
  { id: 'done', label: 'Result', description: 'Add the lone "0" if one was seen, then add all good strings.' },
]

export const code = `function countUniqueGoodSubsequences(binary) {
  const MOD = 1000000007
  let endsOne = 0
  let endsZero = 0
  let hasZero = false
  for (const ch of binary) {
    if (ch === '1') {
      endsOne = (1 + endsOne + endsZero) % MOD
    } else {
      hasZero = true
      endsZero = (endsOne + endsZero) % MOD
    }
  }
  return (endsOne + endsZero + (hasZero ? 1 : 0)) % MOD
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def count_unique_good_subsequences(binary):
    MOD = 1000000007
    ends_one = 0
    ends_zero = 0
    has_zero = False
    for ch in binary:
        if ch == '1':
            ends_one = (1 + ends_one + ends_zero) % MOD
        else:
            has_zero = True
            ends_zero = (ends_one + ends_zero) % MOD
    return (ends_one + ends_zero + (1 if has_zero else 0)) % MOD
`

const C = fragment => code.findIndex(c => c.text.includes(fragment)) + 1
const P = fragment => python.split('\n').findIndex(line => line.includes(fragment)) + 1

export function parseInput(text) {
  let obj
  try { obj = JSON.parse(text) } catch { throw new Error('Use a JSON object such as {"binary":"001"}.') }
  const binary = obj?.binary
  if (typeof binary !== 'string' || binary.length < 1 || binary.length > 60) throw new Error('binary must be a string of 1 to 60 characters.')
  if (!/^[01]+$/.test(binary)) throw new Error('binary may contain only 0 and 1.')
  return binary
}

export function buildTrace(binary) {
  const MOD = 1000000007
  const frames = []
  let endsOne = 0, endsZero = 0, hasZero = false
  const add = (phase, c, p, message, index) => frames.push({
    phase, activeLine: C(c), pythonLine: P(p), message,
    snapshot: { binary, index, endsOne, endsZero, hasZero, total: (endsOne + endsZero + (hasZero ? 1 : 0)) % MOD },
  })
  add('start', 'let endsOne', 'ends_one = 0', 'Nothing read yet: no good subsequence.', -1)
  for (let i = 0; i < binary.length; i++) {
    const ch = binary[i]
    if (ch === '1') {
      endsOne = (1 + endsOne + endsZero) % MOD
      add('one', 'endsOne = (1', 'ends_one = (1', `Read 1 at index ${i}: good strings ending in 1 are now ${endsOne}.`, i)
    } else {
      hasZero = true
      endsZero = (endsOne + endsZero) % MOD
      add('zero', 'endsZero = (endsOne', 'ends_zero = (ends_one', `Read 0 at index ${i}: good strings ending in 0 are now ${endsZero}.`, i)
    }
  }
  const result = (endsOne + endsZero + (hasZero ? 1 : 0)) % MOD
  add('done', 'return (endsOne', 'return (ends_one', `There are ${result} unique good subsequences.`, binary.length)
  return { input: binary, result, frames }
}
