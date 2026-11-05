// LeetCode 2156: Find Substring With Given Hash Value.
// hash(sub) = sum of val(sub[j]) * power^j, modulo m, with val('a') = 1 .. val('z') = 26.
// Hashes of all length-k windows are computed right to left with a rolling update:
// H[i] = val(s[i]) + power * (H[i + 1] - val(s[i + k]) * power^(k - 1)), all modulo m.
// Scanning right to left and overwriting the answer keeps the leftmost match.

export function parseInput(text) {
  let data
  try { data = JSON.parse(text) } catch { throw new Error('Use a JSON object with s, power, modulo, k and hashValue.') }
  const { s, power, modulo, k, hashValue } = data ?? {}
  if (typeof s !== 'string' || !/^[a-z]{1,40}$/.test(s)) throw new Error('s is 1 to 40 lowercase letters.')
  if (!Number.isInteger(power) || power < 1 || power > 100) throw new Error('power is an integer from 1 to 100.')
  if (!Number.isInteger(modulo) || modulo < 2 || modulo > 100000) throw new Error('modulo is an integer from 2 to 100000.')
  if (!Number.isInteger(k) || k < 1 || k > s.length) throw new Error('k is between 1 and the length of s.')
  if (!Number.isInteger(hashValue) || hashValue < 0 || hashValue >= modulo) throw new Error('hashValue is an integer from 0 to modulo - 1.')
  return { s, power, modulo, k, hashValue }
}

export const code = `function subStrHash(s, power, modulo, k, hashValue) {
  const val = ch => ch.charCodeAt(0) - 96
  const n = s.length
  const mod = BigInt(modulo)
  const p = BigInt(power)
  let pk1 = 1n
  for (let j = 0; j < k - 1; j++) pk1 = (pk1 * p) % mod
  let h = 0n
  for (let j = k - 1; j >= 0; j--) h = (h * p + BigInt(val(s[n - k + j]))) % mod
  let answer = n - k
  if (Number(h) === hashValue) answer = n - k
  for (let i = n - k - 1; i >= 0; i--) {
    const drop = (BigInt(val(s[i + k])) * pk1) % mod
    h = ((BigInt(val(s[i])) + p * (((h - drop) % mod) + mod)) % mod)
    if (Number(h) === hashValue) answer = i
  }
  return s.slice(answer, answer + k)
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `# entry: sub_str_hash
def sub_str_hash(s, power, modulo, k, hashValue):
    def val(ch):
        return ord(ch) - 96
    n = len(s)
    pk1 = pow(power, k - 1, modulo)
    h = 0
    for j in range(k - 1, -1, -1):
        h = (h * power + val(s[n - k + j])) % modulo
    answer = n - k
    if h == hashValue:
        answer = n - k
    for i in range(n - k - 1, -1, -1):
        drop = (val(s[i + k]) * pk1) % modulo
        h = (val(s[i]) + power * ((h - drop) % modulo)) % modulo
        if h == hashValue:
            answer = i
    return s[answer:answer + k]
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Last window', description: 'Hash the last window of length k directly.' },
  { id: 'roll', label: 'Roll left', description: 'Remove the letter leaving on the right, add the one entering on the left.' },
  { id: 'match', label: 'Match', description: 'This window has the target hash; keep the leftmost match.' },
  { id: 'done', label: 'Result', description: 'The first matching substring.' },
]

export function buildTrace({ s, power, modulo, k, hashValue }) {
  const frames = []
  const n = s.length
  const val = ch => ch.charCodeAt(0) - 96
  const mod = BigInt(modulo)
  const p = BigInt(power)
  let pk1 = 1n
  for (let j = 0; j < k - 1; j++) pk1 = (pk1 * p) % mod
  let h = 0n
  for (let j = k - 1; j >= 0; j--) h = (h * p + BigInt(val(s[n - k + j]))) % mod
  let answer = n - k
  frames.push({ phase: 'start', activeLine: L('let h = 0n'), pythonLine: P('h = 0'), message: `Hash of the last window at ${n - k}: ${h}.`, l: n - k, r: n - 1, h: Number(h), target: hashValue, answer: Number(h) === hashValue ? n - k : null })
  if (Number(h) === hashValue) answer = n - k
  for (let i = n - k - 1; i >= 0; i--) {
    const drop = (BigInt(val(s[i + k])) * pk1) % mod
    h = ((BigInt(val(s[i])) + p * (((h - drop) % mod) + mod)) % mod)
    const matched = Number(h) === hashValue
    if (matched) answer = i
    frames.push({ phase: matched ? 'match' : 'roll', activeLine: L('const drop'), pythonLine: P('drop = '), message: `Window at ${i}: hash ${h}${matched ? ', matches the target' : ''}.`, l: i, r: i + k - 1, h: Number(h), target: hashValue, answer: matched ? i : null })
  }
  const result = s.slice(answer, answer + k)
  frames.push({ phase: 'done', activeLine: L('return s.slice'), pythonLine: P('return s[answer'), message: `First matching substring: "${result}" at ${answer}.`, l: answer, r: answer + k - 1, h: hashValue, target: hashValue, answer })
  return { input: { s, power, modulo, k, hashValue }, result, frames }
}
