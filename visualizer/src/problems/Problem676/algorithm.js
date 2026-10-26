export function parseInput(text) {
  const data = JSON.parse(text)
  const { words, queries } = data ?? {}
  const word = s => typeof s === 'string' && /^[a-z]{1,100}$/.test(s)
  if (!Array.isArray(words) || words.length < 1 || words.length > 100 || !words.every(word)) throw new Error('words must be 1–100 lowercase strings of 1–100 letters.')
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 100 || !queries.every(word)) throw new Error('queries must be 1–100 lowercase strings of 1–100 letters.')
  return { words, queries }
}

// A query matches when some dictionary word has the same length and differs in exactly one position.
export function buildTrace({ words, queries }) {
  const dictionary = [...words]
  const ops = []
  const frames = [{ phase: 'start', query: null, ops: [], activeLine: 2, message: `Dictionary: ${dictionary.join(', ')}.` }]
  for (const query of queries) {
    let matched = false, witness = null
    for (const w of dictionary) {
      if (w.length !== query.length) continue
      let diff = 0
      for (let i = 0; i < w.length; i++) if (w[i] !== query[i]) diff++
      if (diff === 1) { matched = true; witness = w; break }
    }
    ops.push({ name: 'search', args: [query], returned: matched })
    frames.push({ phase: 'search', query, witness, matched, ops: ops.map(o => ({ ...o })), activeLine: 6, message: matched ? `${query} matches ${witness} with one change.` : `${query} has no dictionary word one change away.` })
  }
  frames.push({ phase: 'done', query: null, ops: ops.map(o => ({ ...o })), result: ops.map(o => o.returned), activeLine: 9, message: 'All queries answered.' })
  return { input: { words, queries }, result: ops.map(o => o.returned), ops, frames }
}

export const code = `class MagicDictionary:
    def buildDict(self, dictionary):
        self.words = set(dictionary)
    def search(self, searchWord):
        for i in range(len(searchWord)):
            for c in 'abcdefghijklmnopqrstuvwxyz':
                if c != searchWord[i] and searchWord[:i] + c + searchWord[i+1:] in self.words:
                    return True
        return False`.split('\n').map((text, index) => ({ line: index + 1, text }))
