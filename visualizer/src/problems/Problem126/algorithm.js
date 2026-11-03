export const phases = [
  { id: 'start', label: 'Start', description: 'Put the words in a set and check that the end word can be reached at all.' },
  { id: 'expand', label: 'Expand a layer', description: 'Breadth-first search: each word in the current layer tries every one-letter change. Unseen dictionary words join the next layer, and every edge into the shortest distance is recorded as a parent.' },
  { id: 'trace', label: 'Trace back', description: 'Walk parent links from the end word back to the begin word. Every complete walk is one shortest transformation sequence.' },
  { id: 'done', label: 'Complete', description: 'Return every shortest sequence, sorted.' },
]

const WORD = /^[a-z]{1,5}$/

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"beginWord": "pen", "endWord": "pan", "wordList": ["pan", "pin"]}.')
  const { beginWord, endWord, wordList } = input
  if (typeof beginWord !== 'string' || !WORD.test(beginWord)) throw new Error('beginWord is 1 to 5 lowercase letters.')
  if (typeof endWord !== 'string' || !WORD.test(endWord)) throw new Error('endWord is 1 to 5 lowercase letters.')
  if (beginWord === endWord) throw new Error('beginWord and endWord must differ.')
  if (!Array.isArray(wordList) || wordList.length < 1 || wordList.length > 10) throw new Error('wordList holds 1 to 10 words in this view.')
  if (!wordList.every(w => typeof w === 'string' && WORD.test(w) && w.length === beginWord.length)) {
    throw new Error('Every word must be lowercase and the same length as beginWord.')
  }
  if (new Set(wordList).size !== wordList.length) throw new Error('wordList must not repeat a word.')
  if (endWord.length !== beginWord.length) throw new Error('endWord must have the same length as beginWord.')
  return { beginWord, endWord, wordList }
}

const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'
function oneLetterChanges(word) {
  const out = []
  for (let i = 0; i < word.length; i++) {
    for (const ch of ALPHABET) if (ch !== word[i]) out.push(word.slice(0, i) + ch + word.slice(i + 1))
  }
  return out
}

export function buildTrace({ beginWord, endWord, wordList }) {
  const dict = new Set(wordList)
  const snap = (extra = {}) => ({ beginWord, endWord, dict: [...dict], ...extra })
  const frames = [{
    phase: 'start', activeLine: L('dict = set(words)'), pythonLine: P('dict_ = set(words)'), snapshot: snap({ layer: [beginWord] }),
    message: `Begin at ${beginWord} and aim for ${endWord}. Only words from the list can be used as intermediate steps.`,
  }]

  if (!dict.has(endWord)) {
    frames.push({
      phase: 'done', activeLine: L('return sorted(paths)'), pythonLine: P('if end not in dict_'), snapshot: snap({ paths: [] }),
      message: `${endWord} is not in the word list, so no sequence can end there. Return an empty list.`,
    })
    return { input: { beginWord, endWord, wordList }, result: [], frames }
  }

  let layer = [beginWord]
  const dist = new Map([[beginWord, 0]])
  const parents = new Map()
  let depth = 0
  while (layer.length && !dist.has(endWord)) {
    const next = []
    for (const word of layer) {
      const neighbours = oneLetterChanges(word).filter(w => dict.has(w))
      const discovered = []
      for (const nb of neighbours) {
        if (!dist.has(nb)) {
          dist.set(nb, dist.get(word) + 1)
          parents.set(nb, [])
          next.push(nb)
          discovered.push(nb)
        }
        if (dist.get(nb) === dist.get(word) + 1) parents.get(nb).push(word)
      }
      frames.push({
        phase: 'expand', activeLine: L('for word in layer'), pythonLine: P('for word in layer'),
        snapshot: snap({ layer: [...layer], focus: word, neighbours, discovered, depth }),
        message: `${word} is at distance ${depth}. Dictionary neighbours: ${neighbours.length ? neighbours.join(', ') : 'none'}. ${discovered.length ? `New at distance ${depth + 1}: ${discovered.join(', ')}.` : 'Nothing new.'}`,
      })
    }
    layer = next
    depth++
    frames.push({
      phase: 'expand', activeLine: L('layer = nxt'), pythonLine: P('layer = nxt'),
      snapshot: snap({ layer: [...layer], depth }),
      message: dist.has(endWord)
        ? `Layer ${depth} contains ${endWord}. Every parent link into this layer is recorded, so stop expanding.`
        : `Layer ${depth} is complete with ${layer.length} new word${layer.length === 1 ? '' : 's'}. Continue from it.`,
    })
  }

  const paths = []
  if (dist.has(endWord)) {
    const walk = (word, suffix) => {
      const path = [word, ...suffix]
      if (word === beginWord) {
        paths.push(path)
        frames.push({
          phase: 'trace', activeLine: L('walk(end, [])'), pythonLine: P('paths.append(path)'),
          snapshot: snap({ path, paths: paths.map(p => [...p]) }),
          message: `Reached ${beginWord}. Sequence found: ${path.join(' → ')}.`,
        })
        return
      }
      for (const prev of parents.get(word)) {
        frames.push({
          phase: 'trace', activeLine: L('walk(end, [])'), pythonLine: P('walk(prev, path)'),
          snapshot: snap({ path, paths: paths.map(p => [...p]), from: word, to: prev }),
          message: `Step back from ${word} to its parent ${prev}, which is one step closer to ${beginWord}.`,
        })
        walk(prev, path)
      }
    }
    walk(endWord, [])
  }

  const result = paths.sort((a, b) => {
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] < b[i] ? -1 : 1
    return 0
  })
  frames.push({
    phase: 'done', activeLine: L('return sorted(paths)'), pythonLine: P('return sorted(paths)'),
    snapshot: snap({ paths: result.map(p => [...p]) }),
    message: result.length
      ? `${result.length} shortest sequence${result.length === 1 ? '' : 's'} found, each of length ${result[0].length}.`
      : `${endWord} cannot be reached from ${beginWord}, so the answer is empty.`,
  })
  return { input: { beginWord, endWord, wordList }, result, frames }
}

export const code = [
  'find_ladders(begin, end, words):',
  '  dict = set(words)',
  '  if end not in dict: return []',
  '  layer = [begin]; dist = {begin: 0}; parents = {}',
  '  while layer and end not in dist:',
  '    nxt = []',
  '    for word in layer:',
  '      for nb in one-letter changes of word in dict:',
  '        if nb is new: dist[nb] = dist[word] + 1; add to nxt',
  '        if dist[nb] == dist[word] + 1: parents[nb].add(word)',
  '    layer = nxt',
  '  if end not in dist: return []',
  '  walk(end, []) back through parents',
  '  return sorted(paths)',
].map((text, index) => ({ line: index + 1, text }))

export const python = `def one_letter_changes(word):
    for i in range(len(word)):
        for ch in "abcdefghijklmnopqrstuvwxyz":
            if ch != word[i]:
                yield word[:i] + ch + word[i + 1:]

def find_ladders(begin, end, words):
    dict_ = set(words)
    if end not in dict_:
        return []
    layer = [begin]
    dist = {begin: 0}
    parents = {}
    while layer and end not in dist:
        nxt = []
        for word in layer:
            for nb in one_letter_changes(word):
                if nb not in dict_:
                    continue
                if nb not in dist:
                    dist[nb] = dist[word] + 1
                    parents[nb] = []
                    nxt.append(nb)
                if dist[nb] == dist[word] + 1:
                    parents[nb].append(word)
        layer = nxt
    if end not in dist:
        return []
    paths = []
    def walk(word, suffix):
        path = [word] + suffix
        if word == begin:
            paths.append(path)
            return
        for prev in parents[word]:
            walk(prev, path)
    walk(end, [])
    return sorted(paths)
`
