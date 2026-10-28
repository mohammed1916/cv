export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || Array.isArray(obj) || typeof obj.word !== 'string') throw new Error('Use an object with a string key word.')
  const { word } = obj
  if (word.length < 1 || word.length > 40 || !/^[a-z]+$/.test(word)) throw new Error('word is 1 to 40 lowercase letters.')
  return { word }
}

export function buildTrace(input) {
  const { word } = input
  const freq = new Map()
  for (const ch of word) freq.set(ch, (freq.get(ch) || 0) + 1)
  const ranked = [...freq.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))
  const frames = [{ phase: 'count', activeLine: L('count how often'), index: -1, ranked: [], pushes: 0, message: `${freq.size} distinct letter(s) in the word.` }]
  let pushes = 0
  ranked.forEach(([ch, count], rank) => {
    const presses = Math.floor(rank / 8) + 1
    pushes += count * presses
    frames.push({ phase: 'rank', activeLine: L('add count times presses'), index: rank, ranked: ranked.slice(0, rank + 1).map(([c, k]) => `${c}:${k}`), pushes, message: `${ch} appears ${count} time(s) and takes ${presses} press(es) each. Total so far: ${pushes}.` })
  })
  frames.push({ phase: 'done', activeLine: L('return pushes'), index: -1, ranked: ranked.map(([c, k]) => `${c}:${k}`), pushes, message: `Minimum pushes: ${pushes}.` })
  return { input, ranked: ranked.map(([c, k]) => `${c}:${k}`), result: pushes, frames }
}

export const code = `minimum pushes to type the word
  count how often each letter appears
  sort the letters by count, most frequent first
  set pushes to 0
  for each letter at rank r in that order
    set presses to one plus r divided by 8, rounded down
    add count times presses to pushes
  return pushes`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimum_pushes(word):
    counts = {}
    for ch in word:
        counts[ch] = counts.get(ch, 0) + 1
    ranked = sorted(counts.values(), reverse=True)
    pushes = 0
    for r, count in enumerate(ranked):
        pushes += count * (r // 8 + 1)
    return pushes
`
