export function parseInput(text) {
  const data = JSON.parse(text)
  const { words, queries } = data ?? {}
  const lower = s => typeof s === 'string' && /^[a-z]{1,100}$/.test(s)
  if (!Array.isArray(words) || words.length < 1 || words.length > 100 || !words.every(lower)) throw new Error('words must be 1–100 lowercase words of up to 100 letters.')
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 100 || !queries.every(lower)) throw new Error('queries must be 1–100 lowercase words of up to 100 letters.')
  return { words, queries }
}

// Index every word under each wildcard pattern that replaces one letter with '*'. A query matches when one of
// its own patterns holds a stored word that differs from the query, which means exactly one letter changed.
export function buildTrace({ words, queries }) {
  const buckets = new Map()
  for (const word of words) {
    for (let i = 0; i < word.length; i++) {
      const key = word.slice(0, i) + '*' + word.slice(i + 1)
      if (!buckets.has(key)) buckets.set(key, new Set())
      buckets.get(key).add(word)
    }
  }
  const frames = [{ phase: 'build', query: null, pattern: null, bucket: [], matched: null, results: [], activeLine: L('const buckets = new Map()'), pythonLine: P('buckets = {}'), message: `Indexed ${buckets.size} wildcard pattern(s) from ${words.length} word(s).` }]
  const results = []
  for (const query of queries) {
    let matched = false
    for (let i = 0; i < query.length && !matched; i++) {
      const pattern = query.slice(0, i) + '*' + query.slice(i + 1)
      const bucket = [...(buckets.get(pattern) ?? [])]
      const hit = bucket.some(w => w !== query)
      frames.push({ phase: 'probe', query, pattern, bucket, matched: hit, results: [...results], activeLine: L('const pattern = '), pythonLine: P('pattern = '), message: `${query} with position ${i} wildcarded: ${bucket.length ? bucket.join(', ') : 'no stored word'}${hit ? ' has a different word, so match.' : ''}` })
      matched = hit
    }
    results.push(matched)
    frames.push({ phase: 'answer', query, pattern: null, bucket: [], matched, results: [...results], activeLine: L('results.push('), pythonLine: P('results.append('), message: `${query}: ${matched ? 'true' : 'false'}.` })
  }
  frames.push({ phase: 'done', query: null, pattern: null, bucket: [], matched: null, results: [...results], result: results, activeLine: L('return results'), pythonLine: P('return results'), message: 'Every query has an answer.' })
  return { input: { words, queries }, result: results, frames }
}

const SOURCE = `function magicDictionary(words, queries) {
  const buckets = new Map()
  for (const word of words) {
    for (let i = 0; i < word.length; i++) {
      const key = word.slice(0, i) + '*' + word.slice(i + 1)
      if (!buckets.has(key)) buckets.set(key, new Set())
      buckets.get(key).add(word)
    }
  }
  const results = []
  for (const query of queries) {
    let matched = false
    for (let i = 0; i < query.length && !matched; i++) {
      const pattern = query.slice(0, i) + '*' + query.slice(i + 1)
      const bucket = buckets.get(pattern) ?? new Set()
      matched = [...bucket].some(w => w !== query)
    }
    results.push(matched)
  }
  return results
}`
export const code = SOURCE.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def magic_dictionary(words, queries):
    buckets = {}
    for word in words:
        for i in range(len(word)):
            pattern = word[:i] + '*' + word[i + 1:]
            buckets.setdefault(pattern, set()).add(word)
    results = []
    for query in queries:
        matched = False
        for i in range(len(query)):
            pattern = query[:i] + '*' + query[i + 1:]
            if any(w != query for w in buckets.get(pattern, ())):
                matched = True
                break
        results.append(matched)
    return results`
const P = s => python.split('\n').findIndex(t => t.includes(s)) + 1
