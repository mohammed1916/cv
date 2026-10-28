export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.words)) throw new Error('Use a JSON object with a words array.')
  const { words } = input
  if (words.length < 4 || words.length > 8) throw new Error('words needs 4 to 8 entries (visualization cap).')
  if (words.some(w => typeof w !== 'string' || !/^[a-z]{4}$/.test(w))) throw new Error('Each word must be exactly 4 lowercase letters.')
  if (new Set(words).size !== words.length) throw new Error('Words must be distinct.')
  return input
}

const sameOrder = (a, b) => {
  for (let i = 0; i < 4; i++) if (a[i] !== b[i]) return a[i] < b[i] ? -1 : 1
  return 0
}

export function buildTrace(input) {
  const { words } = input
  const n = words.length
  const results = []
  const frames = [{ phase: 'start', activeLine: L('results = empty list'), tuple: null, found: false, count: 0, message: `Test every choice of four distinct words from ${n}.` }]
  for (let t = 0; t < n; t++) {
    for (let l = 0; l < n; l++) {
      for (let r = 0; r < n; r++) {
        for (let b = 0; b < n; b++) {
          if (new Set([t, l, r, b]).size < 4) continue
          const top = words[t]
          const left = words[l]
          const right = words[r]
          const bottom = words[b]
          const ok = top[0] === left[0] && top[3] === right[0] && bottom[0] === left[3] && bottom[3] === right[3]
          if (ok) results.push([top, left, right, bottom])
          frames.push({ phase: 'check', activeLine: L('if the corners match'), tuple: [t, l, r, b], found: ok, count: results.length, message: ok ? `${top}, ${left}, ${right}, ${bottom} form a word square.` : `${top}, ${left}, ${right}, ${bottom} do not match at the corners.` })
        }
      }
    }
  }
  results.sort(sameOrder)
  frames.push({ phase: 'done', activeLine: L('return results'), tuple: null, found: false, count: results.length, message: `Found ${results.length} word square(s).` })
  return { input, result: results, frames }
}

export const code = `find word squares (words):
  results = empty list
  for each choice of four distinct words top, left, right, bottom
    if the corners match then
      add [top, left, right, bottom] to results
  sort results
  return results`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def word_squares_ii(words):
    n = len(words)
    result = []
    for t in range(n):
        for l in range(n):
            for r in range(n):
                for b in range(n):
                    if len({t, l, r, b}) < 4:
                        continue
                    top, left, right, bottom = words[t], words[l], words[r], words[b]
                    if top[0] == left[0] and top[-1] == right[0] and bottom[0] == left[-1] and bottom[-1] == right[-1]:
                        result.append([top, left, right, bottom])
    return sorted(result)
`
