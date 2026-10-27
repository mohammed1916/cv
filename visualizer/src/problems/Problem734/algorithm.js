const WORD = /^[a-z]{1,10}$/

export function parseInput(text) {
  const spec = JSON.parse(text)
  if (!Array.isArray(spec.s1) || !Array.isArray(spec.s2) || spec.s1.length > 20 || spec.s2.length > 20) throw new Error('Each sentence has at most 20 words.')
  if (![...spec.s1, ...spec.s2].every(w => typeof w === 'string' && WORD.test(w))) throw new Error('Words are 1 to 10 lowercase letters.')
  if (!Array.isArray(spec.pairs) || spec.pairs.length > 20 || spec.pairs.some(p => !Array.isArray(p) || p.length !== 2 || !p.every(w => typeof w === 'string' && WORD.test(w)))) {
    throw new Error('pairs is a list of at most 20 two-word lists.')
  }
  return spec
}

export function buildTrace(spec) {
  const { s1, s2, pairs } = spec
  // Similarity is symmetric but not transitive: store each pair in both orders and nothing more.
  const similar = new Set(pairs.flatMap(([a, b]) => [`${a} ${b}`, `${b} ${a}`]))
  const frames = [{ phase: 'start', activeLine: L('similar = {'), index: null, a: null, b: null, ok: null, message: 'Compare the sentences word by word. Equal words match; other words need a listed pair.' }]
  if (s1.length !== s2.length) {
    frames.push({ phase: 'fail', activeLine: L('return False'), index: null, a: null, b: null, ok: false, message: 'The sentences have different lengths, so they cannot be similar.' })
    return { input: spec, s1, s2, result: false, frames }
  }
  for (let i = 0; i < s1.length; i++) {
    const a = s1[i], b = s2[i]
    const ok = a === b || similar.has(`${a} ${b}`)
    frames.push({ phase: ok ? 'match' : 'fail', activeLine: L(ok ? 'if a != b' : 'return False'), index: i, a, b, ok, message: ok ? `${a} and ${b} are ${a === b ? 'equal' : 'a listed similar pair'}.` : `${a} and ${b} are neither equal nor a listed pair.` })
    if (!ok) return { input: spec, s1, s2, result: false, frames }
  }
  frames.push({ phase: 'done', activeLine: L('return True'), index: null, a: null, b: null, ok: true, message: 'Every position matches, so the sentences are similar.' })
  return { input: spec, s1, s2, result: true, frames }
}

export const code = `def areSentencesSimilar(sentence1, sentence2, similarPairs):
    if len(sentence1) != len(sentence2):
        return False
    similar = {(a, b) for a, b in similarPairs} | {(b, a) for a, b in similarPairs}
    for a, b in zip(sentence1, sentence2):
        if a != b and (a, b) not in similar:
            return False
    return True`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
