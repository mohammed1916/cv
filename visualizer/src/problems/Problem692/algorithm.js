export function parseInput(text) {
  const data = JSON.parse(text)
  const { words, k } = data ?? {}
  if (!Array.isArray(words) || words.length < 1 || words.length > 500 || words.some(w => typeof w !== 'string' || !/^[a-z]{1,10}$/.test(w))) throw new Error('words must be 1–500 lowercase words of 1–10 letters.')
  if (!Number.isInteger(k) || k < 1 || k > new Set(words).size) throw new Error('k must be from 1 to the number of distinct words.')
  return { words, k }
}

// Count each word, then order by count (highest first), breaking ties alphabetically.
export function buildTrace({ words, k }) {
  const counts = new Map()
  for (const w of words) counts.set(w, (counts.get(w) ?? 0) + 1)
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
  const frames = [{ phase: 'count', ranked: [], activeLine: 3, message: `Count ${words.length} words.` }]
  ranked.forEach(([w, c], i) => {
    if (i < k) frames.push({ phase: 'rank', ranked: ranked.slice(0, i + 1).map(([x, n]) => `${x} ×${n}`), activeLine: 6, message: `${w} (${c}) joins the top ${k}.` })
  })
  const result = ranked.slice(0, k).map(([w]) => w)
  frames.push({ phase: 'done', ranked: result.map(w => `${w} ×${counts.get(w)}`), result, activeLine: 8, message: `Top ${k}: ${result.join(', ')}.` })
  return { input: { words, k }, result, frames }
}

export const code = `def topKFrequent(words, k):
    count = Counter(words)
    return sorted(count, key=lambda w: (-count[w], w))[:k]`.split('\n').map((text, index) => ({ line: index + 1, text }))
