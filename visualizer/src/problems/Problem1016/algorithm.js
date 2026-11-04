export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).sort().join() !== 'n,s') throw new Error('Use a JSON object with exactly the keys s and n.')
  const { s, n } = input
  if (typeof s !== 'string' || s.length < 1 || s.length > 40) throw new Error('s must be a string of 1 to 40 characters.')
  if (!/^[01]+$/.test(s)) throw new Error('s may contain only the characters 0 and 1.')
  if (!Number.isInteger(n) || n < 1 || n > 40) throw new Error('n must be an integer from 1 to 40.')
  return { s, n }
}

export function buildTrace({ s, n }) {
  const frames = [{ phase: 'start', pythonLine: 2, activeLine: L('for each number x'), x: 0, b: '', match: null, message: `Check every number from 1 to ${n}.` }]
  for (let x = 1; x <= n; x++) {
    const b = x.toString(2)
    const at = s.indexOf(b)
    if (at < 0) {
      frames.push({ phase: 'missing', pythonLine: 3, activeLine: L('if b is not a substring'), x, b, match: null, message: `${x} is ${b} in binary, which is not a substring of s. The answer is false.` })
      frames.push({ phase: 'done', pythonLine: 4, activeLine: L('return false'), x, b, match: null, message: `Answer: false.` })
      return { input: { s, n }, result: false, frames }
    }
    frames.push({ phase: 'check', pythonLine: 3, activeLine: L('if b is not a substring'), x, b, match: [at, at + b.length - 1], message: `${x} is ${b} in binary, and it appears in s at positions ${at} to ${at + b.length - 1}.` })
  }
  frames.push({ phase: 'done', pythonLine: 5, activeLine: L('return true'), x: n, b: '', match: null, message: `Every number from 1 to ${n} appears in s. Answer: true.` })
  return { input: { s, n }, result: true, frames }
}

export const code = `every number up to n appears in s:
  for each number x from 1 to n
    let b be the binary text of x
    if b is not a substring of s then
      return false
  return true`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def query_string(s, n):
    for x in range(1, n + 1):
        if bin(x)[2:] not in s:
            return False
    return True
`
