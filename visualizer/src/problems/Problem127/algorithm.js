export const phases = [
  { id: 'start', label: 'Build buckets', description: 'Group the words by wildcard patterns, where one position is replaced by *.' },
  { id: 'expand', label: 'Expand a word', description: 'Dequeue the next word in breadth-first order and read its wildcard patterns.' },
  { id: 'bucket', label: 'Scan bucket', description: 'Visit unseen words in this bucket once, then clear the bucket so it is not scanned again.' },
  { id: 'reach', label: 'End reached', description: 'The end word was dequeued, so its depth is the shortest length.' },
  { id: 'done', label: 'Complete', description: 'Return the number of words on the shortest ladder, or 0 when it is impossible.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"beginWord": "cat", "endWord": "dog", "wordList": ["cot", "dot", "dog"]}.')
  const { beginWord, endWord, wordList } = input
  const shape = /^[a-z]{1,4}$/
  if (typeof beginWord !== 'string' || !shape.test(beginWord)) throw new Error('beginWord is 1 to 4 lowercase letters.')
  if (typeof endWord !== 'string' || !shape.test(endWord)) throw new Error('endWord is 1 to 4 lowercase letters.')
  if (!Array.isArray(wordList) || wordList.length < 1 || wordList.length > 10 || !wordList.every(w => typeof w === 'string' && shape.test(w))) throw new Error('wordList is a list of 1 to 10 lowercase words of 1 to 4 letters.')
  if (new Set(wordList).size !== wordList.length) throw new Error('wordList entries must be distinct.')
  const len = beginWord.length
  if (endWord.length !== len || !wordList.every(w => w.length === len)) throw new Error('beginWord, endWord and every word must have the same length.')
  if (beginWord === endWord) throw new Error('beginWord and endWord must differ.')
  return { beginWord, endWord, wordList }
}

export function buildTrace({ beginWord, endWord, wordList }) {
  const words = new Set([...wordList, beginWord])
  const buckets = new Map()
  for (const w of words) for (let i = 0; i < w.length; i++) {
    const key = w.slice(0, i) + '*' + w.slice(i + 1)
    if (!buckets.has(key)) buckets.set(key, [])
    buckets.get(key).push(w)
  }
  const visited = new Set([beginWord])
  let queue = [[beginWord, 1]]
  let result = 0
  const snap = (word, depth, pattern, bucket) => ({ word, depth, pattern, bucket, queue: queue.map(([w]) => w), visited: [...visited], result })
  const frames = [{ phase: 'start', activeLine: L('build buckets'), pythonLine: P('for w in words'), snapshot: snap(null, null, null, null), message: `${words.size} words are grouped under wildcard patterns, so words differing in one position share a bucket.` }]
  let head = 0
  let found = false
  while (head < queue.length && !found) {
    const [word, depth] = queue[head++]
    frames.push({ phase: 'expand', activeLine: L('dequeue'), pythonLine: P('word, depth = queue.popleft()'), snapshot: snap(word, depth, null, null), message: `Dequeue "${word}" at depth ${depth}.` })
    if (word === endWord) {
      result = depth
      found = true
      frames.push({ phase: 'reach', activeLine: L('if word == endWord'), pythonLine: P('if word == end_word'), snapshot: snap(word, depth, null, null), message: `"${word}" is the end word at depth ${depth}, the shortest so far.` })
      break
    }
    for (let i = 0; i < word.length && !found; i++) {
      const pattern = word.slice(0, i) + '*' + word.slice(i + 1)
      const bucket = buckets.get(pattern) ?? []
      frames.push({ phase: 'bucket', activeLine: L('for each pattern'), pythonLine: P('for i in range'), snapshot: snap(word, depth, pattern, [...bucket]), message: `Pattern "${pattern}" holds ${bucket.length} word${bucket.length === 1 ? '' : 's'}.` })
      for (const next of bucket) {
        if (visited.has(next)) continue
        visited.add(next)
        queue.push([next, depth + 1])
        frames.push({ phase: 'bucket', activeLine: L('enqueue'), pythonLine: P('queue.append'), snapshot: snap(word, depth, pattern, [...bucket]), message: `"${next}" is unseen, so it joins the queue at depth ${depth + 1}.` })
      }
      buckets.set(pattern, [])
    }
  }
  if (!found) frames.push({ phase: 'done', activeLine: L('return 0'), pythonLine: P('return 0'), snapshot: snap(null, null, null, null), message: `The queue empties without reaching "${endWord}", so no ladder exists.` })
  else frames.push({ phase: 'done', activeLine: L('return depth'), pythonLine: P('return depth'), snapshot: snap(null, null, null, null), message: `Return ${result}, the number of words on the shortest ladder.` })
  return { input: { beginWord, endWord, wordList }, result, frames }
}

export const code = `word ladder (beginWord, endWord, wordList):
  build buckets: each word under every pattern with one * in place of a letter
  queue starts with (beginWord, depth 1); visited holds beginWord
  while the queue is not empty:
    dequeue (word, depth)
    if word == endWord: return depth
    for each pattern of word:
      for each unseen next word in the bucket: mark it and enqueue (next, depth + 1)
      clear the bucket so it is never scanned again
  return 0`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export const python = `from collections import defaultdict, deque

def ladder_length(begin_word, end_word, word_list):
    if end_word not in word_list:
        return 0
    words = set(word_list) | {begin_word}
    buckets = defaultdict(list)
    for w in words:
        for i in range(len(w)):
            buckets[w[:i] + '*' + w[i + 1:]].append(w)
    visited = {begin_word}
    queue = deque([(begin_word, 1)])
    while queue:
        word, depth = queue.popleft()
        if word == end_word:
            return depth
        for i in range(len(word)):
            pattern = word[:i] + '*' + word[i + 1:]
            for nxt in buckets[pattern]:
                if nxt not in visited:
                    visited.add(nxt)
                    queue.append((nxt, depth + 1))
            buckets[pattern] = []
    return 0
`
