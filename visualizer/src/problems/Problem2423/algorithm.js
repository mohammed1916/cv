export function parseInput(text) {
  const word = JSON.parse(text)
  if (typeof word !== 'string' || word.length < 2 || word.length > 12) throw new Error('Use a JSON string of 2 to 12 characters.')
  if (!/^[a-z]+$/.test(word)) throw new Error('Use lowercase letters a to z only.')
  return word
}

// True when every letter still present has the same count.
function allEqual(counts) {
  const values = [...counts.values()].filter(v => v > 0)
  return values.every(v => v === values[0])
}

export function buildTrace(word) {
  const counts = new Map()
  for (const ch of word) counts.set(ch, (counts.get(ch) ?? 0) + 1)
  const snapshot = () => Object.fromEntries([...counts].filter(([, v]) => v > 0))
  const frames = [{ phase: 'count', activeLine: L('count how often'), letter: null, counts: snapshot(), message: `Count the letters of "${word}".` }]
  let result = false
  for (const letter of [...counts.keys()]) {
    const before = counts.get(letter)
    counts.set(letter, before - 1)
    const ok = allEqual(counts)
    frames.push({ phase: 'try', activeLine: L('remove one copy'), letter, counts: snapshot(), message: `Remove one ${letter}: ${ok ? 'the remaining counts are all equal.' : 'the remaining counts still differ.'}` })
    if (ok) {
      result = true
      break
    }
    counts.set(letter, before)
  }
  frames.push({ phase: 'done', activeLine: L(result ? 'return true' : 'return false'), letter: null, counts: snapshot(), message: result ? 'Removing that letter equalizes the frequencies.' : 'No single removal equalizes the frequencies.' })
  return { input: word, result, frames }
}

export const code = `can one removal equalize letter counts
  count how often each letter appears in the word
  for each letter that appears in the word
    remove one copy of this letter
    if the counts of the letters still present are all equal then
      return true
    put the removed copy back
  return false`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from collections import Counter

def can_equalize_by_removing_one(word):
    counts = Counter(word)
    for letter in list(counts):
        counts[letter] -= 1
        remaining = {v for v in counts.values() if v > 0}
        if len(remaining) <= 1:
            return True
        counts[letter] += 1
    return False
`
