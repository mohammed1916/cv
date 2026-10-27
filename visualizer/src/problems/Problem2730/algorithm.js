export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input.s !== 'string' || input.s.length < 1 || input.s.length > 20) throw new Error('Give s as a string of 1 to 20 digits.')
  if (!/^[0-9]+$/.test(input.s)) throw new Error('s may contain only the digits 0 to 9.')
  return { s: input.s }
}

export function buildTrace({ s }) {
  const frames = [{ phase: 'start', activeLine: L('set best to one'), start: 0, end: 0, pair: null, best: 1, message: 'A window is semi-repetitive when it holds at most one equal adjacent pair.' }]
  let best = 1, start = 0, pair = null
  for (let i = 1; i < s.length; i++) {
    const equal = s[i] === s[i - 1]
    frames.push({ phase: 'compare', activeLine: L('if s at i equals'), start, end: i, pair, best, message: equal ? `s[${i}] repeats s[${i - 1}].` : `s[${i}] differs from s[${i - 1}].` })
    if (equal) {
      if (pair !== null) {
        start = pair + 1
        frames.push({ phase: 'move', activeLine: L('move start just past'), start, end: i, pair, best, message: `Two repeats do not fit, so start moves to ${start}.` })
      }
      pair = i - 1
    }
    best = Math.max(best, i - start + 1)
    frames.push({ phase: 'record', activeLine: L('set best to the larger'), start, end: i, pair, best, message: `Window ${start} to ${i} has length ${i - start + 1}. Best ${best}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return best'), start, end: s.length - 1, pair, best, message: `The longest semi-repetitive substring has length ${best}.` })
  return { input: { s }, result: best, frames }
}

export const code = `longest semi repetitive substring (s)
  set best to one
  set start to zero and the last pair to nothing
  for each position i from one to the end
    if s at i equals s at i minus one then
      if an earlier pair exists then
        move start just past that earlier pair
      remember i minus one as the latest pair
    set best to the larger of best and i minus start plus one
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def longest_semi_repetitive(s):
    best = 1
    start = 0
    pair = None
    for i in range(1, len(s)):
        if s[i] == s[i - 1]:
            if pair is not None:
                start = pair + 1
            pair = i - 1
        best = max(best, i - start + 1)
    return best
`
