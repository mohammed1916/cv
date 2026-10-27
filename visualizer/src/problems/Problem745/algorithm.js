export const code = `constructor: set table to an empty map
for each word at index idx, in order
  for each suffix start i and each prefix length j of the word
    store table[suffix + "#" + prefix] = idx, overwriting any earlier index
f(pref, suff): return the table value for suff + "#" + pref, or -1 if absent`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def word_filter(words, queries):
    table = {}
    for idx, word in enumerate(words):
        for i in range(len(word) + 1):
            for j in range(len(word) + 1):
                table[word[i:] + '#' + word[:j]] = idx
    return [table.get(suff + '#' + pref, -1) for pref, suff in queries]`
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function parseInput(text) {
  const v = JSON.parse(text)
  if (!v || !Array.isArray(v.words) || !Array.isArray(v.queries)) throw new Error('Enter JSON like {"words": ["apple"], "queries": [["a", "e"]]} where each query is [prefix, suffix].')
  if (v.words.length < 1 || v.words.length > 12 || !v.words.every(w => typeof w === 'string' && /^[a-z]{1,7}$/.test(w))) throw new Error('words must be 1-12 lowercase words of 1-7 letters (visualization cap).')
  if (v.queries.length < 1 || v.queries.length > 20 || !v.queries.every(q => Array.isArray(q) && q.length === 2 && q.every(s => typeof s === 'string' && /^[a-z]{0,7}$/.test(s)))) throw new Error('queries must be 1-20 pairs [prefix, suffix] of lowercase strings of at most 7 letters.')
  return { words: v.words, queries: v.queries }
}

export function buildTrace({ words, queries }) {
  const table = new Map()
  const frames = [{ phase: 'start', activeLine: L('set table to an empty map'), wordIndex: -1, keys: [], tableSize: 0, queryIndex: -1, key: '', answers: [], message: 'Constructor: for every word store all (suffix, prefix) combinations as keys; later words overwrite earlier ones, so the value is the largest index.' }]
  words.forEach((word, idx) => {
    const keys = []
    for (let i = 0; i <= word.length; i++) for (let j = 0; j <= word.length; j++) {
      const key = word.slice(i) + '#' + word.slice(0, j)
      keys.push(key); table.set(key, idx)
    }
    frames.push({ phase: 'insert', activeLine: L('store table[suffix'), wordIndex: idx, keys, tableSize: table.size, queryIndex: -1, key: '', answers: [], message: `Word ${idx} "${word}" contributes ${keys.length} keys (${word.length + 1} suffixes x ${word.length + 1} prefixes), all mapped to index ${idx}. The table now has ${table.size} distinct keys.` })
  })
  const answers = []
  queries.forEach(([pref, suff], q) => {
    const key = suff + '#' + pref
    const ans = table.has(key) ? table.get(key) : -1
    answers.push(ans)
    frames.push({ phase: 'query', activeLine: L('return the table value for'), wordIndex: ans, keys: [], tableSize: table.size, queryIndex: q, key, answers: [...answers],
      message: ans >= 0 ? `f("${pref}", "${suff}") looks up key "${key}": found, largest matching index ${ans} ("${words[ans]}").` : `f("${pref}", "${suff}") looks up key "${key}": absent, so -1.` })
  })
  frames.push({ phase: 'done', activeLine: L('return the table value for'), wordIndex: -1, keys: [], tableSize: table.size, queryIndex: queries.length - 1, key: '', answers: [...answers], message: `Answers: [${answers.join(', ')}].` })
  return { input: { words, queries }, result: answers, frames }
}
