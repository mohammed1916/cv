const LOWER = /^[a-z]+$/

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with queries and dictionary.')
  const { queries, dictionary } = input
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 8) throw new Error('queries has 1 to 8 words.')
  if (!Array.isArray(dictionary) || dictionary.length < 1 || dictionary.length > 8) throw new Error('dictionary has 1 to 8 words.')
  const all = [...queries, ...dictionary]
  if (!all.every(w => typeof w === 'string' && w.length >= 1 && w.length <= 8 && LOWER.test(w))) throw new Error('Each word has 1 to 8 lowercase letters.')
  if (new Set(all.map(w => w.length)).size !== 1) throw new Error('All words must have the same length.')
  return { queries, dictionary }
}

export function buildTrace({ queries, dictionary }) {
  const frames = []
  const result = []
  frames.push({ pythonLine: PL('result = []'), phase: 'setup', activeLine: CL('const result = []'), q: -1, w: -1, at: -1, diff: 0, message: 'Start with an empty result list.' })
  queries.forEach((query, q) => {
    frames.push({ pythonLine: PL('for query in queries'), phase: 'query', activeLine: CL('for (const query of queries)'), q, w: -1, at: -1, diff: 0, message: `Take query ${query}.` })
    let kept = false
    for (let w = 0; w < dictionary.length && !kept; w++) {
      const word = dictionary[w]
      frames.push({ pythonLine: PL('for word in dictionary'), phase: 'word', activeLine: CL('for (const word of dictionary)'), q, w, at: -1, diff: 0, message: `Compare with dictionary word ${word}.` })
      let diff = 0
      frames.push({ pythonLine: PL('diff = 0'), phase: 'reset', activeLine: CL('let diff = 0'), q, w, at: -1, diff, message: 'Start the mismatch count at zero.' })
      for (let j = 0; j < query.length; j++) {
        if (query[j] === word[j]) continue
        diff += 1
        frames.push({ pythonLine: PL('diff += 1'), phase: 'count', activeLine: CL('diff += 1'), q, w, at: j, diff, message: `Position ${j}: ${query[j]} differs from ${word[j]}.` })
      }
      kept = diff <= 2
      frames.push({ pythonLine: PL('if diff <= 2'), phase: 'check', activeLine: CL('if (diff <= 2)'), q, w, at: -1, diff, message: `${diff} letter${diff === 1 ? '' : 's'} differ: ${kept ? 'within two edits.' : 'too many.'}` })
      if (kept) {
        result.push(query)
        frames.push({ pythonLine: PL('result.append(query)'), phase: 'record', activeLine: CL('result.push(query)'), q, w, at: -1, diff, message: `Keep ${query} and stop checking its other words.` })
      }
    }
  })
  frames.push({ pythonLine: PL('return result'), phase: 'done', activeLine: CL('return result'), q: -1, w: -1, at: -1, diff: 0, message: `Return ${result.length} kept quer${result.length === 1 ? 'y' : 'ies'}.` })
  return { input: { queries, dictionary }, result, frames }
}

export const code = `function twoEditWords(queries, dictionary) {
  const result = [];
  for (const query of queries) {
    for (const word of dictionary) {
      let diff = 0;
      for (let j = 0; j < query.length; j++) {
        if (query[j] !== word[j]) diff += 1;
      }
      if (diff <= 2) {
        result.push(query);
        break;
      }
    }
  }
  return result;
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CL = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export const python = `def two_edit_words(queries, dictionary):
    result = []
    for query in queries:
        for word in dictionary:
            diff = 0
            for a, b in zip(query, word):
                if a != b:
                    diff += 1
            if diff <= 2:
                result.append(query)
                break
    return result
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }
