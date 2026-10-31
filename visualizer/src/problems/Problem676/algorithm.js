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
  const frames = [{ phase: 'start', pythonLine: 2, query: null, ops: [], activeLine: L('store the dictionary words'), message: `Dictionary: ${dictionary.join(', ')}.` }]
  for (const query of queries) {
    let matched = false, witness = null
    for (const w of dictionary) {
      if (w.length !== query.length) continue
      let diff = 0
      for (let i = 0; i < w.length; i++) if (w[i] !== query[i]) diff++
      if (diff === 1) { matched = true; witness = w; break }
    }
    ops.push({ name: 'search', args: [query], returned: matched })
    frames.push({ phase: 'search', pythonLine: 12, query, witness, matched, ops: ops.map(o => ({ ...o })), activeLine: L('record whether the query matched'), message: matched ? `${query} matches ${witness} with one change.` : `${query} has no dictionary word one change away.` })
  }
  frames.push({ phase: 'done', pythonLine: 13, query: null, ops: ops.map(o => ({ ...o })), result: ops.map(o => o.returned), activeLine: L('return the recorded results'), message: 'All queries answered.' })
  return { input: { words, queries }, result: ops.map(o => o.returned), ops, frames }
}

export const code = `store the dictionary words
for each query word, in order
  for each dictionary word of the same length
    count the letters that differ from the query
    if exactly one letter differs, the query matches that word
  record whether the query matched
return the recorded results`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def magic_dictionary(words, queries):
    results = []
    for query in queries:
        matched = False
        for word in words:
            if len(word) != len(query):
                continue
            diff = sum(1 for a, b in zip(word, query) if a != b)
            if diff == 1:
                matched = True
                break
        results.append(matched)
    return results
`
