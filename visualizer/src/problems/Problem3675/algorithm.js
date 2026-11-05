export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with s.')
  const { s } = input
  if (typeof s !== 'string' || s.length < 1 || s.length > 20 || !/^[a-z]+$/.test(s)) throw new Error('s has 1 to 20 lowercase letters (the visualization caps the length at 20).')
  return { s }
}

export function buildTrace({ s }) {
  const frames = []
  let best = 0
  frames.push({ pythonLine: P('best = 0'), phase: 'start', activeLine: L('let best'), index: -1, letter: null, steps: null, best, message: 'Start with zero steps.' })
  for (let i = 0; i < s.length; i++) {
    const steps = (26 - (s.charCodeAt(i) - 97)) % 26
    best = Math.max(best, steps)
    frames.push({ pythonLine: P('steps = '), phase: 'letter', activeLine: L('const steps'), index: i, letter: s[i], steps, best, message: `${s[i]} needs ${steps} step${steps === 1 ? '' : 's'} to reach a; the best so far is ${best}.` })
  }
  frames.push({ pythonLine: P('return best'), phase: 'done', activeLine: L('return best'), index: -1, letter: null, steps: null, best, message: `The answer is ${best}.` })
  return { input: { s }, result: best, frames }
}

export const code = `function minOperations(s) {
  let best = 0
  for (let i = 0; i < s.length; i++) {
    const steps = (26 - (s.charCodeAt(i) - 97)) % 26
    best = Math.max(best, steps)
  }
  return best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_operations(s):
    best = 0
    for ch in s:
        steps = (26 - (ord(ch) - ord('a'))) % 26
        best = max(best, steps)
    return best
`
const P = s => python.split('\n').findIndex(line => line.includes(s)) + 1
