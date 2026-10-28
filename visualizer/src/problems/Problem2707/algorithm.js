export function parseInput(text) {
  const data = JSON.parse(text)
  const s = data?.s
  const dictionary = data?.dictionary
  if (typeof s !== 'string' || !/^[a-z]{1,16}$/.test(s)) throw new Error('s must be 1 to 16 lowercase letters.')
  if (!Array.isArray(dictionary) || dictionary.length < 1 || dictionary.length > 4) throw new Error('dictionary must be 1 to 4 words.')
  if (dictionary.some(w => typeof w !== 'string' || !/^[a-z]{1,8}$/.test(w))) throw new Error('Each dictionary word is 1 to 8 lowercase letters.')
  return { s, dictionary }
}

export const code = `minimum extra characters(s, dictionary)
  words = set of dictionary words
  best = array of len(s) + 1 values, with best[0] = 0
  for end from 1 to len(s)
    best[end] = best[end - 1] + 1, leaving character s[end - 1] as an extra
    for start from 0 to end - 1
      if the piece from start to end is in words then best[end] = min(best[end], best[start])
  return best[len(s)]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

// best[end] is the fewest extra characters in the first end characters, so each end tries every piece that stops there.
export function buildTrace({ s, dictionary }) {
  const words = new Set(dictionary)
  const best = Array(s.length + 1).fill(0)
  const frames = [{ phase: 'start', end: 0, best: [...best], activeLine: L('best = array of'), message: 'An empty prefix has no extra characters.' }]
  for (let end = 1; end <= s.length; end++) {
    best[end] = best[end - 1] + 1
    for (let start = 0; start < end; start++) {
      if (!words.has(s.slice(start, end))) continue
      best[end] = Math.min(best[end], best[start])
    }
    frames.push({ phase: 'end', end, best: [...best], activeLine: L('for start from 0'), message: `The first ${end} characters need ${best[end]} extra characters.` })
  }
  const result = best[s.length]
  frames.push({ phase: 'done', end: s.length, best: [...best], activeLine: L('return best[len(s)]'), message: `Fewest extra characters: ${result}.` })
  return { input: { s, dictionary }, result, frames }
}

export const python = `def min_extra_chars(s, dictionary):
    words = set(dictionary)
    best = [0] * (len(s) + 1)
    for end in range(1, len(s) + 1):
        best[end] = best[end - 1] + 1
        for start in range(end):
            if s[start:end] in words:
                best[end] = min(best[end], best[start])
    return best[len(s)]
`
