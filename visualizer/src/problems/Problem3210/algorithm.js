export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || Array.isArray(input) || typeof input !== 'object') throw new Error('Use an object with s and k.')
  const { s, k } = input
  if (typeof s !== 'string' || s.length < 1 || s.length > 12 || !/^[a-z]+$/.test(s)) throw new Error('s is 1 to 12 lowercase letters.')
  if (!Number.isInteger(k) || k < 1 || k > 20) throw new Error('k is an integer from 1 to 20.')
  return { s, k }
}

export function buildTrace(input) {
  const { s, k } = input
  const n = s.length
  let result = ''
  const frames = [{ phase: 'start', activeLine: L('set result to an empty string'), index: -1, source: -1, result, message: `Each position takes the character ${k} places ahead, wrapping around.` }]
  for (let i = 0; i < n; i++) {
    const source = (i + k) % n
    result += s[source]
    frames.push({ phase: 'read', activeLine: L('set source to'), index: i, source, result, message: `Position ${i} takes s[${source}] = ${s[source]}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return result'), index: -1, source: -1, result, message: `Encrypted string: ${result}.` })
  return { input, result, frames }
}

export const code = `find the encrypted string of s with shift k:
  set n to the length of s
  set result to an empty string
  for each position i from 0 to n minus 1
    set source to (i plus k) modulo n
    append the character at source to result
  return result`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def get_encrypted_string(s, k):
    n = len(s)
    result = []
    for i in range(n):
        source = (i + k) % n
        result.append(s[source])
    return ''.join(result)
`
