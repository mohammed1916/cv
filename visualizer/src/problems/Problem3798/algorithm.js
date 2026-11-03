export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || typeof input.s !== 'string') throw new Error('Use an object with a string s.')
  if (!/^[12]{1,20}$/.test(input.s)) throw new Error('s has 1 to 20 characters, each 1 or 2.')
  return { s: input.s }
}

export function buildTrace({ s }) {
  const frames = []
  let keep = -1
  for (let i = s.length - 1; i >= 0; i--) {
    if (s[i] === '2') {
      keep = i
      frames.push({ pythonLine: P('if s[i]'), phase: 'found', activeLine: C('if s at i is 2'), at: i, keep, message: `Index ${i} holds the last 2; keep indices 0 to ${i}.` })
      break
    }
    frames.push({ pythonLine: P('if s[i]'), phase: 'scan', activeLine: C('scan i from'), at: i, keep, message: `Index ${i} is a 1, so it cannot end the number.` })
  }
  const result = keep >= 0 ? s.slice(0, keep + 1) : ''
  frames.push({ pythonLine: P('return ""'), phase: 'done', activeLine: C('return empty'), at: -1, keep, message: keep >= 0 ? `Largest even number: "${result}".` : 'No 2 exists, so no even number can be formed.' })
  return { input: { s }, result, frames }
}

export function solve(s) {
  return buildTrace({ s }).result
}

export const code = `largest even number from a string of 1s and 2s
  scan i from the last index down to 0
    if s at i is 2 then return s from 0 through i
  return empty string`.split('\n').map((text, index) => ({ line: index + 1, text: text.trim() }))

export const python = `def largest_even(s):
    for i in range(len(s) - 1, -1, -1):
        if s[i] == '2':
            return s[:i + 1]
    return ""
`

const PY = python.split('\n')
const CODE = code.map(c => c.text)
function P(text) { return PY.findIndex(line => line.includes(text)) + 1 }
function C(text) { return CODE.findIndex(line => line.includes(text)) + 1 }
