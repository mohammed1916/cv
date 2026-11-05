export function parseInput(text) {
  const data = JSON.parse(text)
  const { sentence1, sentence2, pairs } = data ?? {}
  const word = w => typeof w === 'string' && /^[a-z]{1,20}$/.test(w)
  if (!Array.isArray(sentence1) || !Array.isArray(sentence2) || sentence1.length > 100 || sentence2.length > 100) throw new Error('sentence1 and sentence2 must be arrays of up to 100 lowercase words.')
  if (!sentence1.every(word) || !sentence2.every(word)) throw new Error('Words are lowercase letters, 1–20 characters long.')
  if (!Array.isArray(pairs) || pairs.length > 2000 || pairs.some(p => !Array.isArray(p) || p.length !== 2 || !word(p[0]) || !word(p[1]))) throw new Error('pairs is a list of two-word arrays.')
  return { sentence1, sentence2, pairs }
}

const JS_LINES = [
  'function areSentencesSimilar(sentence1, sentence2, pairs) {',
  '  if (sentence1.length !== sentence2.length) return false',
  '  const parent = new Map() // parent[w] points toward the representative of w\'s group',
  '  const find = w => { if (!parent.has(w)) parent.set(w, w); while (parent.get(w) !== w) w = parent.get(w); return w }',
  '  for (const [a, b] of pairs) parent.set(find(a), find(b)) // union the two groups',
  '  for (let i = 0; i < sentence1.length; i++) {',
  '    const a = sentence1[i], b = sentence2[i]',
  '    if (a !== b && find(a) !== find(b)) return false // this position has no chain of pairs',
  '  }',
  '  return true',
  '}',
]
const PY_LINES = [
  'def are_sentences_similar(sentence1, sentence2, pairs):',
  '    if len(sentence1) != len(sentence2):',
  '        return False',
  '    parent = {}',
  '    def find(w):',
  '        parent.setdefault(w, w)',
  '        while parent[w] != w:',
  '            w = parent[w]',
  '        return w',
  '    for a, b in pairs:',
  '        parent[find(a)] = find(b)',
  '    for a, b in zip(sentence1, sentence2):',
  '        if a != b and find(a) != find(b):',
  '            return False',
  '    return True',
]
const L = s => JS_LINES.findIndex(t => t.includes(s)) + 1
const P = s => PY_LINES.findIndex(t => t.includes(s)) + 1

export const code = JS_LINES.map((text, index) => ({ line: index + 1, text }))
export const python = PY_LINES.join('\n')

// Union-find over the words in the pairs. Two words are similar if they share a group; equal words are always similar.
export function buildTrace({ sentence1, sentence2, pairs }) {
  const labels = [...new Set([...sentence1, ...sentence2, ...pairs.flat()])]
  const index = new Map(labels.map((w, i) => [w, i]))
  const parent = labels.map((_, i) => i)
  const size = labels.map(() => 1)
  const root = i => { while (parent[i] !== i) i = parent[i]; return i }
  const snapshot = () => ({ parent: [...parent], size: [...size] })
  const frames = []
  if (sentence1.length !== sentence2.length) {
    frames.push({ phase: 'length', i: -1, ...snapshot(), activeLine: L('if (sentence1.length'), pythonLine: P('if len(sentence1)'), message: `Lengths differ (${sentence1.length} and ${sentence2.length}), so the sentences cannot be similar.` })
    return { input: { sentence1, sentence2, pairs }, result: false, labels, frames }
  }
  frames.push({ phase: 'start', i: -1, ...snapshot(), activeLine: L('const parent = new Map'), pythonLine: P('parent = {}'), message: 'Every word starts in its own group.' })
  for (const [a, b] of pairs) {
    const ra = root(index.get(a)), rb = root(index.get(b))
    if (ra !== rb) {
      if (size[ra] < size[rb]) { parent[ra] = rb; size[rb] += size[ra] } else { parent[rb] = ra; size[ra] += size[rb] }
    }
    frames.push({ phase: 'union', i: -1, ...snapshot(), pair: [a, b], activeLine: L('for (const [a, b] of pairs)'), pythonLine: P('for a, b in pairs'), message: `"${a}" and "${b}" are similar, so their groups merge.` })
  }
  let result = true
  for (let i = 0; i < sentence1.length; i++) {
    const a = sentence1[i], b = sentence2[i]
    const same = a === b || (index.has(a) && index.has(b) && root(index.get(a)) === root(index.get(b)))
    frames.push({ phase: same ? 'match' : 'mismatch', i, ...snapshot(), pair: [a, b], activeLine: L(same ? 'for (let i = 0' : 'return false'), pythonLine: P(same ? 'for a, b in zip' : 'return False'),
      message: a === b ? `Position ${i}: "${a}" equals "${b}".` : same ? `Position ${i}: "${a}" and "${b}" share a group.` : `Position ${i}: "${a}" and "${b}" are in different groups, so the sentences are not similar.` })
    if (!same) { result = false; break }
  }
  frames.push({ phase: 'done', i: sentence1.length - 1, ...snapshot(), result, activeLine: L('return true'), pythonLine: P('return True'), message: result ? 'Every position matches, so the sentences are similar.' : 'Some position has no chain of pairs.' })
  return { input: { sentence1, sentence2, pairs }, result, labels, frames }
}
