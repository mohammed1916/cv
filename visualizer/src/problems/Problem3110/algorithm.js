export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).join() !== 's') throw new Error('Use a JSON object with exactly one key, s.')
  const { s } = input
  if (typeof s !== 'string' || s.length < 2 || s.length > 30) throw new Error('s must be a string of 2 to 30 letters.')
  if (!/^[a-z]+$/.test(s)) throw new Error('s may contain only lowercase letters a to z.')
  return { s }
}

export function buildTrace({ s }) {
  let score = 0
  const frames = [{ phase: 'start', activeLine: L('set score to 0'), index: -1, gap: 0, score, message: 'Start with a score of zero.' }]
  for (let i = 0; i + 1 < s.length; i++) {
    const gap = Math.abs(s.charCodeAt(i) - s.charCodeAt(i + 1))
    score += gap
    frames.push({ phase: 'pair', activeLine: L('add the absolute'), index: i, gap, score, message: `${s[i]} and ${s[i + 1]} differ by ${gap}. Score is now ${score}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return score'), index: -1, gap: 0, score, message: `Score: ${score}.` })
  return { input: { s }, result: score, frames }
}

export const code = `score of a string:
  set score to 0
  for each neighboring pair of letters at i and i plus 1
    add the absolute difference of their alphabet codes to score
  return score`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def score_of_string(s):
    score = 0
    for i in range(len(s) - 1):
        score += abs(ord(s[i]) - ord(s[i + 1]))
    return score
`
