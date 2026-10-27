const LIMIT = 3

export function parseInput(text) {
  const spec = JSON.parse(text)
  if (!Array.isArray(spec.sentences) || !Array.isArray(spec.times) || spec.sentences.length !== spec.times.length) throw new Error('Give sentences and times of the same length.')
  if (spec.sentences.length < 1 || spec.sentences.length > 10) throw new Error('Use 1 to 10 sentences.')
  if (spec.sentences.some(s => typeof s !== 'string' || !/^[a-z ]+$/.test(s))) throw new Error('Sentences use lowercase letters and spaces only.')
  if (spec.times.some(t => !Number.isInteger(t) || t < 1 || t > 100)) throw new Error('Times are integers from 1 to 100.')
  if (typeof spec.typed !== 'string' || spec.typed.length > 40 || !/^[a-z #]*$/.test(spec.typed)) throw new Error('Typed text uses lowercase letters, spaces and # (at most 40 characters).')
  return spec
}

// Hottest first; equal counts fall back to plain ASCII order.
const hotter = ([a, countA], [b, countB]) => countB - countA || (a < b ? -1 : a > b ? 1 : 0)

export function buildTrace(spec) {
  const counts = new Map(spec.sentences.map((s, i) => [s, spec.times[i]]))
  const suggest = prefix => [...counts].filter(([s]) => s.startsWith(prefix)).sort(hotter).slice(0, LIMIT)
  const frames = [{ phase: 'start', activeLine: L('counts = map each sentence'), typed: '', char: null, top: [], message: `Store ${counts.size} sentences with their hotness. Nothing is typed yet.` }]
  const result = []
  let typed = ''
  for (const char of spec.typed) {
    if (char === '#') {
      counts.set(typed, (counts.get(typed) ?? 0) + 1)
      result.push([])
      frames.push({ phase: 'save', activeLine: L('counts[prefix] += 1'), typed, char, top: [], message: `"${typed}" is saved and its hotness rises by one. The next sentence starts empty.` })
      typed = ''
      continue
    }
    typed += char
    const top = suggest(typed)
    result.push(top.map(([s]) => s))
    frames.push({ phase: 'input', activeLine: L('sort matches by hotness'), typed, char, top, message: top.length ? `Prefix "${typed}": showing ${top.length} suggestion(s), hottest first.` : `No sentence starts with "${typed}".` })
  }
  return { input: spec, result, frames }
}

export const code = `counts = map each sentence to its times
prefix = empty text
result = empty list
for each character ch in typed:
  if ch is "#":
    counts[prefix] += 1 (save the sentence; its hotness rises by one)
    result append an empty list
    prefix = empty text
  else:
    prefix = prefix + ch
    matches = stored sentences that start with prefix
    sort matches by hotness (high first), then alphabetically
    result append the first 3 matches
return result`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def autocomplete_system(sentences, times, typed):
    counts = dict(zip(sentences, times))
    prefix = ''
    result = []
    for ch in typed:
        if ch == '#':
            counts[prefix] = counts.get(prefix, 0) + 1
            result.append([])
            prefix = ''
        else:
            prefix += ch
            matches = [s for s in counts if s.startswith(prefix)]
            matches.sort(key=lambda s: (-counts[s], s))
            result.append(matches[:3])
    return result`
const L = s => code.findIndex(c => c.text.includes(s)) + 1
