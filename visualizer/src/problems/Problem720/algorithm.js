export function parseInput(text) {
  const words = JSON.parse(text)
  if (!Array.isArray(words) || words.length < 1 || words.length > 1000 || words.some(w => typeof w !== 'string' || !/^[a-z]{1,30}$/.test(w))) throw new Error('Enter a JSON array of 1–1,000 lowercase words of 1–30 letters.')
  return words
}

// A word qualifies when every prefix is itself a word. Sort so shorter prefixes are added first.
export function buildTrace(words) {
  const sorted = [...words].sort((a, b) => a.length - b.length || (a < b ? -1 : a > b ? 1 : 0))
  const built = new Set([''])
  let best = ''
  const frames = [{ phase: 'start', word: null, built: [], best: '', activeLine: 2, message: 'Shorter words first; a word counts only if its prefix is already built.' }]
  for (const w of sorted) {
    const ok = built.has(w.slice(0, -1))
    if (ok) {
      built.add(w)
      if (w.length > best.length || (w.length === best.length && w < best)) best = w
    }
    frames.push({ phase: ok ? 'build' : 'skip', word: w, built: [...built].filter(x => x), best, ok, activeLine: ok ? 6 : 5, message: ok ? `${w}: its prefix ${w.slice(0, -1) || '(empty)'} is built, so ${w} is built.` : `${w}: prefix ${w.slice(0, -1)} is not built.` })
  }
  const result = best
  frames.push({ phase: 'done', word: null, built: [...built].filter(x => x), best, result, activeLine: 9, message: result ? `Longest buildable word: ${result}.` : 'No word can be built.' })
  return { input: words, result, frames }
}

export const code = `def longestWord(words):
    built, best = {''}, ''
    for w in sorted(words, key=lambda x: (len(x), x)):
        if w[:-1] in built:
            built.add(w)
            if len(w) > len(best) or (len(w) == len(best) and w < best): best = w
    return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
