const MAX_WORDS = 8
const MAX_LENGTH = 6

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.words)) throw new Error('Use an object like {"words":["a","aba"]}.')
  if (data.words.length < 1 || data.words.length > MAX_WORDS) throw new Error(`Use 1 to ${MAX_WORDS} words.`)
  if (data.words.some(w => typeof w !== 'string' || !/^[a-z]{1,6}$/.test(w))) throw new Error(`Each word is 1 to ${MAX_LENGTH} lowercase letters.`)
  return { words: data.words }
}

export function buildTrace({ words }) {
  // A word s is both a prefix and a suffix of w exactly when the pairs (s[k], s[last - k]) match
  // the first len(s) pairs of w. So each word is stored as a path of letter pairs.
  const root = { next: new Map(), end: 0 }
  let total = 0
  const frames = [{ pythonLine: 2, phase: 'start', activeLine: L('const root = { next'), word: null, gained: 0, total, message: 'Start with an empty trie.' }]
  for (const w of words) {
    const m = w.length
    let node = root
    let gained = 0
    for (let k = 0; k < m; k++) {
      const key = w[k] + w[m - 1 - k]
      if (!node.next.has(key)) break
      node = node.next.get(key)
      gained += node.end
    }
    total += gained
    frames.push({ pythonLine: gained ? 12 : 10, phase: 'check', activeLine: L('total += node.end'), word: w, gained, total, message: `${w} pairs with ${gained} earlier word(s).` })
    node = root
    for (let k = 0; k < m; k++) {
      const key = w[k] + w[m - 1 - k]
      if (!node.next.has(key)) node.next.set(key, { next: new Map(), end: 0 })
      node = node.next.get(key)
    }
    node.end += 1
    frames.push({ pythonLine: 17, phase: 'insert', activeLine: L('node.end += 1'), word: w, gained, total, message: `Stored ${w} as a path of letter pairs.` })
  }
  frames.push({ pythonLine: 18, phase: 'done', activeLine: L('return total'), word: null, gained: 0, total, message: `Pairs: ${total}.` })
  return { input: { words }, result: total, frames }
}

export const code = `function countPrefixSuffixPairs(words) {
  const root = { next: new Map(), end: 0 }
  let total = 0
  for (const w of words) {
    const m = w.length
    let node = root
    for (let k = 0; k < m; k++) {
      const key = w[k] + w[m - 1 - k]
      if (!node.next.has(key)) break
      node = node.next.get(key)
      total += node.end
    }
    node = root
    for (let k = 0; k < m; k++) {
      const key = w[k] + w[m - 1 - k]
      if (!node.next.has(key)) node.next.set(key, { next: new Map(), end: 0 })
      node = node.next.get(key)
    }
    node.end += 1
  }
  return total
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_prefix_suffix_pairs(words):
    trie = {'end': 0}
    total = 0
    for w in words:
        m = len(w)
        node = trie
        for k in range(m):
            pair = (w[k], w[m - 1 - k])
            if pair not in node:
                break
            node = node[pair]
            total += node['end']
        node = trie
        for k in range(m):
            pair = (w[k], w[m - 1 - k])
            node = node.setdefault(pair, {'end': 0})
        node['end'] += 1
    return total
`
