const WORD = /^[a-z]{1,10}$/

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || Array.isArray(data) || !Array.isArray(data.words)) throw new Error('Use {"words": [...]} with 1 to 12 lowercase words.')
  const { words } = data
  if (words.length < 1 || words.length > 12) throw new Error('Use 1 to 12 words.')
  if (words.some(w => typeof w !== 'string' || !WORD.test(w))) throw new Error('Each word is 1 to 10 lowercase letters.')
  return { words }
}

const keyOf = word => [...new Set(word)].sort().join('')

export function buildTrace(input) {
  const { words } = input
  const seen = new Map()
  let pairs = 0
  const maps = () => [{ name: 'signatures', keyLabel: 'letter set', valueLabel: 'words so far', isSet: false, entries: [...seen] }]
  const frames = [{ phase: 'start', activeLine: L('seen = empty map'), index: -1, maps: maps(), ops: [], result: 0, message: 'Two words are similar when they use the same set of letters, however often each letter repeats.' }]
  words.forEach((w, i) => {
    const key = keyOf(w)
    const before = seen.get(key) ?? 0
    pairs += before
    seen.set(key, before + 1)
    frames.push({ phase: 'word', activeLine: L('add one to seen'), index: i, maps: maps(),
      ops: [{ map: 'signatures', type: before === 0 ? 'insert' : 'update', key, value: before + 1, before: before === 0 ? undefined : before }],
      result: pairs, message: `${w} has letters {${key}}. ${before} earlier word(s) match, so pairs go up by ${before}.` })
  })
  frames.push({ phase: 'done', activeLine: L('return pairs'), index: -1, maps: maps(), ops: [], result: pairs, message: `Similar pairs: ${pairs}.` })
  return { input, result: pairs, frames }
}

export const code = `count pairs of similar words
seen = empty map from letter set to the number of words with that set
pairs = 0
for each word w
  key = the set of distinct letters of w, sorted
  add seen of key to pairs
  add one to seen at key
return pairs`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def similar_pairs(words):
    seen = {}
    pairs = 0
    for w in words:
        key = ''.join(sorted(set(w)))
        pairs += seen.get(key, 0)
        seen[key] = seen.get(key, 0) + 1
    return pairs
`
