// Decode XORed permutation: the XOR of 1..n is known, and the odd-indexed encoded values give the XOR of perm[1..n-1].
const JS_LINES = [
  { text: 'const n = encoded.length + 1', py: 'n = len(encoded) + 1' },
  { text: 'let total = 0', py: 'total = 0' },
  { text: 'for (let v = 1; v <= n; v++) total ^= v', py: 'for v in range(1, n + 1)' },
  { text: 'let oddXor = 0', py: 'odd_xor = 0' },
  { text: 'for (let i = 1; i < encoded.length; i += 2) oddXor ^= encoded[i]', py: 'for i in range(1, len(encoded), 2)' },
  { text: 'const perm = [total ^ oddXor]', py: 'perm = [total ^ odd_xor]' },
  { text: 'for (let i = 0; i < encoded.length; i++) perm.push(perm[i] ^ encoded[i])', py: 'for e in encoded' },
  { text: 'return perm', py: 'return perm' },
]

export const code = JS_LINES.map(({ text }, i) => ({ line: i + 1, text }))

export const python = `def decode(encoded):
    n = len(encoded) + 1
    total = 0
    for v in range(1, n + 1):
        total ^= v
    odd_xor = 0
    for i in range(1, len(encoded), 2):
        odd_xor ^= encoded[i]
    perm = [total ^ odd_xor]
    for e in encoded:
        perm.append(perm[-1] ^ e)
    return perm
`

const PY = python.split('\n')
const pyAt = needle => {
  const index = PY.findIndex(line => line.includes(needle))
  if (index < 0) throw new Error(`python line missing: ${needle}`)
  return index + 1
}
export const pythonLineMap = Object.fromEntries(JS_LINES.map((line, i) => [i + 1, pyAt(line.py ?? 'return perm')]))

export const phases = [
  { id: 'total', label: 'Total XOR', description: 'XOR of 1 to n is the same for every permutation.' },
  { id: 'odd', label: 'Odd positions', description: 'The encoded values at odd positions XOR to perm[1] ^ ... ^ perm[n-1].' },
  { id: 'first', label: 'First value', description: 'perm[0] is the total XOR with that odd-position XOR.' },
  { id: 'chain', label: 'Chain', description: 'Each next value is the previous value XOR its encoded value.' },
  { id: 'done', label: 'Result', description: 'The permutation of 1 to n.' },
]

export const examples = [
  { label: 'Five numbers', input: '[2,3,6,1]' },
  { label: 'Three numbers', input: '[6,5]' },
]

export const complexity = 'O(n) time and O(1) extra space for n numbers (n is odd).'

export function parseInput(text) {
  const encoded = JSON.parse(text)
  if (!Array.isArray(encoded) || encoded.length < 2 || encoded.length > 19 || encoded.length % 2 !== 0) throw new Error('encoded has an even length from 2 to 18, so n = length + 1 is odd (visual cap).')
  if (!encoded.every(v => Number.isInteger(v) && v >= 1 && v <= 31)) throw new Error('Encoded values are integers from 1 to 31.')
  return encoded
}

export function buildTrace(encoded) {
  const n = encoded.length + 1
  const frames = []
  let total = 0
  for (let v = 1; v <= n; v++) total ^= v
  frames.push({ phase: 'total', activeLine: 3, index: -1, message: `XOR of 1 to ${n} is ${total}.`, snapshot: { perm: [] } })
  let oddXor = 0
  for (let i = 1; i < encoded.length; i += 2) {
    oddXor ^= encoded[i]
    frames.push({ phase: 'odd', activeLine: 5, index: i, message: `Adding encoded[${i}] = ${encoded[i]}: running XOR ${oddXor}.`, snapshot: { perm: [] } })
  }
  const perm = [total ^ oddXor]
  frames.push({ phase: 'first', activeLine: 6, index: 0, message: `perm[0] = ${total} XOR ${oddXor} = ${perm[0]}.`, snapshot: { perm: [...perm] } })
  for (let i = 0; i < encoded.length; i++) {
    perm.push(perm[i] ^ encoded[i])
    frames.push({ phase: 'chain', activeLine: 7, index: i + 1, message: `perm[${i + 1}] = ${perm[i]} XOR ${encoded[i]} = ${perm[i + 1]}.`, snapshot: { perm: [...perm] } })
  }
  frames.push({ phase: 'done', activeLine: 8, index: -1, result: perm, message: `Permutation: [${perm.join(', ')}].`, snapshot: { perm: [...perm], result: perm } })
  return { input: encoded, result: perm, frames }
}
