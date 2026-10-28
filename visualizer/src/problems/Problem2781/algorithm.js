export function parseInput(text) {
  const value = JSON.parse(text)
  if (!value || Array.isArray(value) || Object.keys(value).sort().join() !== 'forbidden,word') throw new Error('Use an object with exactly the keys "word" and "forbidden".')
  const { word, forbidden } = value
  if (typeof word !== 'string' || !/^[a-z]{1,20}$/.test(word)) throw new Error('word is 1 to 20 lowercase letters.')
  if (!Array.isArray(forbidden) || forbidden.length < 1 || forbidden.length > 6) throw new Error('Use 1 to 6 forbidden strings.')
  if (forbidden.some(f => typeof f !== 'string' || !/^[a-z]{1,4}$/.test(f))) throw new Error('Each forbidden string is 1 to 4 lowercase letters.')
  return { word, forbidden }
}

export function buildTrace({ word, forbidden }) {
  const chars = [...word]
  const frames = [{ phase: 'start', activeLine: L('set left to 0'), active: -1, roles: {}, state: { left: 0, best: 0 }, message: 'Move right one letter at a time. The window must not contain a forbidden string.' }]
  let left = 0
  let best = 0
  for (let right = 0; right < chars.length; right++) {
    const hits = []
    for (const f of forbidden) {
      const start = right - f.length + 1
      if (start >= 0 && word.slice(start, right + 1) === f) hits.push({ f, start })
    }
    if (hits.length > 0) {
      left = Math.max(left, ...hits.map(h => h.start + 1))
    }
    best = Math.max(best, right - left + 1)
    const roles = {}
    for (let k = left; k <= right; k++) roles[k] = 'window'
    frames.push({ phase: 'extend', activeLine: L('set best to the larger of best'), active: right, roles, state: { right, left, best, forbiddenEndsHere: hits.map(h => h.f).join(', ') || 'none' }, message: hits.length > 0 ? `Forbidden "${hits.map(h => h.f).join('", "')}" ends at ${right}, so the window starts after it at ${left}. Best ${best}.` : `No forbidden string ends at ${right}. Window ${left} to ${right}, best ${best}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return best'), active: -1, roles: {}, state: { best }, message: `Return ${best}, the longest valid substring.` })
  return { input: { word, forbidden }, result: best, items: chars, frames }
}

export const code = `longest substring without a forbidden string
  set left to 0
  set best to 0
  for each right index in word
    for each forbidden string
      if a forbidden string ends at right then
        move left to just after where that forbidden string starts
    set best to the larger of best and right minus left plus 1
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def longest_valid_substring(word, forbidden):
    left = 0
    best = 0
    for right in range(len(word)):
        for f in forbidden:
            start = right - len(f) + 1
            if start >= 0 and word[start:right + 1] == f:
                left = max(left, start + 1)
        best = max(best, right - left + 1)
    return best
`
