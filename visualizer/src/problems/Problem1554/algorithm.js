export function parseInput(text) {
  const input = JSON.parse(text)
  if (!Array.isArray(input)) throw new Error('Use a JSON array of strings.')
  if (input.length < 2 || input.length > 12) throw new Error('The visualization accepts 2 to 12 words.')
  if (!input.every(w => typeof w === 'string' && /^[a-z]{1,8}$/.test(w))) throw new Error('Each word is 1 to 8 lowercase letters.')
  const length = input[0].length
  if (!input.every(w => w.length === length)) throw new Error('All words must have the same length.')
  if (new Set(input).size !== input.length) throw new Error('Words must be distinct.')
  return input
}

export const code = `can two words in the list differ in exactly one position
  seen = empty set of wildcard keys
  for each word in the list
    for each position j in the word
      key = the word with position j replaced by a star
      if key is already in seen then return true
      add key to seen
  return false`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def differ_by_one(words):
    seen = set()
    for word in words:
        for j in range(len(word)):
            key = word[:j] + "*" + word[j + 1:]
            if key in seen:
                return True
            seen.add(key)
    return False

if __name__ == "__main__":
    print(differ_by_one(["ab", "cd", "ad", "xy"]))
`
const P = s => {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}

export function buildTrace(words) {
  const seen = new Map()
  const frames = []
  let found = null
  const push = (frame) => frames.push({ seen: [...seen.entries()].map(([key, word]) => ({ key, word })), found, ...frame })

  push({ pythonLine: P('seen = set()'), phase: 'start', activeLine: L('seen = empty set'), word: null, position: null, key: null, message: `Start with an empty set and ${words.length} words of length ${words[0].length}.` })
  outer: for (let w = 0; w < words.length; w++) {
    const word = words[w]
    push({ pythonLine: P('for word in words'), phase: 'word', activeLine: L('for each word in the list'), word: w, position: null, key: null, message: `Take word ${w}: ${word}.` })
    for (let j = 0; j < word.length; j++) {
      const key = `${word.slice(0, j)}*${word.slice(j + 1)}`
      push({ pythonLine: P('key = word[:j]'), phase: 'mask', activeLine: L('key = the word with position j'), word: w, position: j, key, message: `Mask position ${j}: key ${key}.` })
      if (seen.has(key)) {
        found = [seen.get(key), w]
        push({ pythonLine: P('return True'), phase: 'hit', activeLine: L('if key is already in seen'), word: w, position: j, key, message: `${words[seen.get(key)]} and ${word} share key ${key}, so they differ only at position ${j}.` })
        break outer
      }
      seen.set(key, w)
      push({ pythonLine: P('seen.add(key)'), phase: 'store', activeLine: L('add key to seen'), word: w, position: j, key, message: `Store ${key} for word ${w}.` })
    }
  }
  const result = found !== null
  push({ pythonLine: P('return False'), phase: 'done', activeLine: L('return false'), word: null, position: null, key: null, message: result ? 'Two words differ in exactly one position.' : 'No two words differ in exactly one position.' })
  return { input: words, result, frames }
}
