export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.words)) throw new Error('Use an object with words and k.')
  const { words, k } = input
  if (words.length < 1 || words.length > 12) throw new Error('words has 1 to 12 strings.')
  if (!words.every(w => typeof w === 'string' && /^[a-z]{1,6}$/.test(w))) throw new Error('Each word has 1 to 6 lowercase letters.')
  if (!Number.isInteger(k) || k < 1 || k > 6) throw new Error('k is an integer from 1 to 6.')
  return { words, k }
}

export function buildTrace({ words, k }) {
  const buckets = new Map()
  const frames = []
  words.forEach((word, i) => {
    if (word.length < k) {
      frames.push({ pythonLine: P('if len(word) < k'), phase: 'word', activeLine: C('shorter than k'), at: i, key: null, buckets: snapshot(buckets),
        message: `"${word}" is shorter than ${k}, so it joins no group.` })
      return
    }
    const key = word.slice(0, k)
    buckets.set(key, (buckets.get(key) || 0) + 1)
    frames.push({ pythonLine: P('buckets[key]'), phase: 'word', activeLine: C('count the word under its prefix'), at: i, key, buckets: snapshot(buckets),
      message: `"${word}" goes under prefix "${key}".` })
  })
  const result = [...buckets.values()].filter(c => c >= 2).length
  frames.push({ pythonLine: P('return sum'), phase: 'done', activeLine: C('return the number of prefixes'), at: -1, key: null, buckets: snapshot(buckets),
    message: `${result} group${result === 1 ? '' : 's'} with at least two words.` })
  return { input: { words, k }, result, frames }
}

function snapshot(buckets) {
  return [...buckets.entries()].map(([key, count]) => [key, count])
}

export function solve(input) {
  return buildTrace(input).result
}

export const code = `count groups of words that share their first k letters and have at least two words
  set up an empty map from prefix to word count
  for each word
    if the word is shorter than k then skip it
    count the word under its prefix of length k
  return the number of prefixes whose count is at least two`.split('\n').map((text, index) => ({ line: index + 1, text: text.trim() }))

export const python = `def prefix_groups(words, k):
    buckets = {}
    for word in words:
        if len(word) < k:
            continue
        key = word[:k]
        buckets[key] = buckets.get(key, 0) + 1
    return sum(1 for count in buckets.values() if count >= 2)
`

const PY = python.split('\n')
const CODE = code.map(c => c.text)
function P(text) { return PY.findIndex(line => line.includes(text)) + 1 }
function C(text) { return CODE.findIndex(line => line.includes(text)) + 1 }
