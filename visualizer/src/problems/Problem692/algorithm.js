export function parseInput(text) {
  const data = JSON.parse(text)
  const { words, k } = data ?? {}
  if (!Array.isArray(words) || words.length < 1 || words.length > 500 || words.some(w => typeof w !== 'string' || !/^[a-z]{1,10}$/.test(w))) throw new Error('words must be 1–500 lowercase words of up to 10 letters.')
  const unique = new Set(words).size
  if (!Number.isInteger(k) || k < 1 || k > unique) throw new Error(`k must be an integer from 1 to ${unique} (the number of distinct words).`)
  return { words, k }
}

// Count each word. Sort by count (highest first), breaking ties alphabetically, then keep the first k.
export function buildTrace({ words, k }) {
  const count = new Map()
  const frames = [{ phase: 'start', entries: [], chosen: [], activeLine: L('const count = new Map()'), pythonLine: P('count = Counter'), message: 'Count every word.' }]
  for (const w of words) {
    count.set(w, (count.get(w) ?? 0) + 1)
    frames.push({ phase: 'count', entries: [...count].map(([word, c]) => ({ word, count: c })), chosen: [], activeLine: L('count.set(w'), pythonLine: P('count = Counter'),message: `${w}: now ${count.get(w)}.` })
  }
  const sorted = [...count.keys()].sort((a, b) => count.get(b) - count.get(a) || (a < b ? -1 : a > b ? 1 : 0))
  const entries = sorted.map(word => ({ word, count: count.get(word) }))
  frames.push({ phase: 'sort', entries, chosen: [], activeLine: L('.sort('), pythonLine: P('sorted('), message: 'Sort by count, then alphabetically.' })
  const result = sorted.slice(0, k)
  frames.push({ phase: 'done', entries, chosen: result, result, activeLine: L('return'), pythonLine: P('return'), message: `Top ${k}: ${result.join(', ')}.` })
  return { input: { words, k }, result, frames }
}

const SOURCE = `function topKFrequent(words, k) {
  const count = new Map()
  for (const w of words) count.set(w, (count.get(w) ?? 0) + 1)
  const sorted = [...count.keys()].sort((a, b) => count.get(b) - count.get(a) || (a < b ? -1 : a > b ? 1 : 0))
  return sorted.slice(0, k)
}`
export const code = SOURCE.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from collections import Counter


def top_k_frequent(words, k):
    count = Counter(words)
    ordered = sorted(count, key=lambda w: (-count[w], w))
    return ordered[:k]`
const P = s => python.split('\n').findIndex(t => t.includes(s)) + 1
