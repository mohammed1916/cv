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

export const code = `count how many times each word appears
rank all distinct words
  order by higher count first, then by word alphabetically
  take the first k ranked words
return the selected words`.split('\n').map((text, index) => ({ line: index + 1, text }))

// Family line 4 both counts words (the 'Count' frames) and takes the first k ranked words.
export function familyLine(frame) {
  if (frame.activeLine === 4) return /^Count /.test(frame.message) ? 1 : 4
  return ({ 1: 1, 3: 3, 5: 5 })[frame.activeLine] ?? frame.activeLine
}

export const python = `def top_k_frequent(words, k):
    counts = {}
    for word in words:
        counts[word] = counts.get(word, 0) + 1
    ranked = sorted(counts, key=lambda word: (-counts[word], word))
    return ranked[:k]`
