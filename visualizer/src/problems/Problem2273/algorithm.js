export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).join() !== 'words') throw new Error('Use a JSON object with exactly one key, words.')
  const { words } = input
  if (!Array.isArray(words) || words.length < 1 || words.length > 20) throw new Error('words must be an array of 1 to 20 strings.')
  if (words.some(w => typeof w !== 'string' || !/^[a-z]{1,10}$/.test(w))) throw new Error('Each word must be 1 to 10 lowercase letters.')
  return { words }
}

const key = w => [...w].sort().join('')

export function buildTrace({ words }) {
  const kept = [words[0]]
  const frames = [{ phase: 'start', activeLine: L('set kept to'), index: 0, word: words[0], kept: [...kept], message: `Keep ${words[0]}, the first word.` }]
  for (let i = 1; i < words.length; i++) {
    const w = words[i]
    if (key(w) === key(kept[kept.length - 1])) {
      frames.push({ phase: 'skip', activeLine: L('skip w'), index: i, word: w, kept: [...kept], message: `${w} is an anagram of ${kept[kept.length - 1]}, so it is removed.` })
    } else {
      kept.push(w)
      frames.push({ phase: 'keep', activeLine: L('add w to kept'), index: i, word: w, kept: [...kept], message: `${w} is not an anagram of the last kept word, so it stays.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return kept'), index: -1, word: '', kept: [...kept], message: `Resulting array has ${kept.length} words.` })
  return { input: { words }, result: kept, frames }
}

export const code = `words left after removing adjacent anagrams:
  set kept to a list holding the first word
  for each later word w in order
    if w is an anagram of the last kept word then
      skip w
    otherwise
      add w to kept
  return kept`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def remove_anagrams(words):
    kept = [words[0]]
    for w in words[1:]:
        if sorted(w) != sorted(kept[-1]):
            kept.append(w)
    return kept
`
