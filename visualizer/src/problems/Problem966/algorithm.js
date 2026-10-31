const WORD = /^[a-zA-Z]+$/

export function parseInput(text) {
  const spec = JSON.parse(text)
  const { wordlist, queries } = spec
  if (!Array.isArray(wordlist) || wordlist.length < 1 || wordlist.length > 10 || wordlist.some(w => typeof w !== 'string' || !WORD.test(w))) {
    throw new Error('Use 1 to 10 words made of letters.')
  }
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 10 || queries.some(q => typeof q !== 'string' || !WORD.test(q))) {
    throw new Error('Use 1 to 10 query words made of letters.')
  }
  return spec
}

const devowel = word => word.toLowerCase().replace(/[aeiou]/g, '*')

export function buildTrace(spec) {
  const { wordlist, queries } = spec
  // First occurrence wins for the case-insensitive and vowel-insensitive lookups.
  const exact = new Set(wordlist)
  const lower = new Map()
  const vowel = new Map()
  for (const w of wordlist) {
    if (!lower.has(w.toLowerCase())) lower.set(w.toLowerCase(), w)
    if (!vowel.has(devowel(w))) vowel.set(devowel(w), w)
  }
  const frames = [{ phase: 'start', activeLine: L('set exact to'), pythonLine: 5, query: null, stage: null, match: null, result: null, message: 'Build three lookups from the word list. The first word in the list wins ties.' }]
  const result = []
  for (const q of queries) {
    let out, stage, activeLine
    if (exact.has(q)) { out = q; stage = 1; activeLine = L('if q is in exact') }
    else if (lower.has(q.toLowerCase())) { out = lower.get(q.toLowerCase()); stage = 2; activeLine = L('if q lowercased is in lower') }
    else if (vowel.has(devowel(q))) { out = vowel.get(devowel(q)); stage = 3; activeLine = L('if devowel(q) is in vowel') }
    else { out = ''; stage = 4; activeLine = L('append the empty string') }
    result.push(out)
    frames.push({ phase: 'query', activeLine, query: q, pythonLine: stage === 1 ? 13 : stage === 2 ? 15 : stage === 3 ? 17 : 19, stage, match: out, result: out, message: stage === 4 ? `${q} matches nothing: answer "".` : `${q} matches ${out} at rule ${stage}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return result'), pythonLine: 20, query: null, stage: null, match: null, result: null, message: `Corrected ${queries.length} queries.` })
  return { input: spec, result, frames }
}

export const code = `spellchecker(wordlist, queries) returns the corrected word for each query
  set exact to the set of words in wordlist
  set lower and vowel to empty maps
  for each word w in wordlist, in order
    if lower has no key for w lowercased, then set lower[w lowercased] to w
    if vowel has no key for devowel(w), then set vowel[devowel(w)] to w
  set result to an empty list
  for each query q in queries
    if q is in exact, then append q
    otherwise, if q lowercased is in lower, then append lower[q lowercased]
    otherwise, if devowel(q) is in vowel, then append vowel[devowel(q)]
    otherwise append the empty string
  return result`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def devowel(word):
    return ''.join('*' if c in 'aeiou' else c for c in word.lower())

def spellchecker(wordlist, queries):
    exact = set(wordlist)
    lower, vowel = {}, {}
    for w in wordlist:
        lower.setdefault(w.lower(), w)
        vowel.setdefault(devowel(w), w)
    result = []
    for q in queries:
        if q in exact:
            result.append(q)
        elif q.lower() in lower:
            result.append(lower[q.lower()])
        elif devowel(q) in vowel:
            result.append(vowel[devowel(q)])
        else:
            result.append('')
    return result`
