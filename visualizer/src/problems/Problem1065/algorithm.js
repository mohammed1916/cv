export const code = `function indexPairs(text, words) {
  const pairs = []
  for (let start = 0; start < text.length; start++) {
    for (const word of words) {
      if (text.startsWith(word, start)) {
        const pair = [start, start + word.length - 1]
        if (!pairs.some(p => p[0] === pair[0] && p[1] === pair[1])) pairs.push(pair)
      }
    }
  }
  return pairs.sort((a, b) => a[0] - b[0] || a[1] - b[1])
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def index_pairs(text, words):
    pairs = []
    for start in range(len(text)):
        for word in words:
            if text.startswith(word, start):
                pair = [start, start + len(word) - 1]
                if pair not in pairs:
                    pairs.append(pair)
    pairs.sort()
    return pairs


if __name__ == "__main__":
    print(index_pairs("thestoryofleetcodeandme", ["story", "fleet", "leetcode"]))
`

const PY_LINES = python.split('\n')
const L = text => {
  const index = code.findIndex(item => item.text.includes(text))
  if (index < 0) throw new Error(`Missing code line: ${text}`)
  return index + 1
}
const P = text => {
  const index = PY_LINES.findIndex(item => item.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

const MAX_TEXT = 30
const MAX_WORDS = 8
const MAX_WORD = 10

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with text and words.')
  const { text: body, words } = input
  if (typeof body !== 'string' || body.length > MAX_TEXT) throw new Error(`text is a string of at most ${MAX_TEXT} characters.`)
  if (!Array.isArray(words) || words.length < 1 || words.length > MAX_WORDS) throw new Error(`Use 1 to ${MAX_WORDS} words.`)
  if (!words.every(w => typeof w === 'string' && w.length >= 1 && w.length <= MAX_WORD)) throw new Error(`Each word has 1 to ${MAX_WORD} characters.`)
  return { text: body, words }
}

export function buildTrace({ text, words }) {
  const frames = []
  const pairs = []
  const sameAs = (a, b) => a[0] === b[0] && a[1] === b[1]
  const state = (extra = {}) => ({ text, words, pairs: pairs.map(p => p.slice()), start: -1, word: null, candidate: null, sorted: false, result: null, ...extra })
  const add = (phase, line, py, message, extra) => frames.push({ phase, activeLine: L(line), pythonLine: P(py), message, ...state(extra) })
  add('start', 'const pairs = []', 'pairs = []', `Find every occurrence of ${words.length} word${words.length === 1 ? '' : 's'} in "${text}", overlaps included.`, {})
  for (let start = 0; start < text.length; start++) {
    add('position', 'for (let start = 0', 'for start in range(len(text))', `Start position ${start} ("${text[start]}").`, { start })
    for (const word of words) {
      const hit = text.startsWith(word, start)
      if (!hit) {
        add('miss', 'if (text.startsWith(word, start))', 'if text.startswith(word, start)', `"${word}" does not begin at ${start}.`, { start, word, candidate: [start, start + word.length - 1] })
        continue
      }
      const pair = [start, start + word.length - 1]
      add('hit', 'const pair = [start', 'pair = [start, start + len(word) - 1]', `"${word}" begins at ${start} and ends at ${pair[1]}.`, { start, word, candidate: pair })
      if (pairs.some(existing => sameAs(existing, pair))) {
        add('duplicate', 'if (!pairs.some(', 'if pair not in pairs', `[${pair[0]}, ${pair[1]}] is already recorded.`, { start, word, candidate: pair })
      } else {
        pairs.push(pair)
        add('record', 'pairs.push(pair)', 'pairs.append(pair)', `Record [${pair[0]}, ${pair[1]}] for "${word}".`, { start, word, candidate: pair })
      }
    }
  }
  const sorted = pairs.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1])
  add('sort', 'return pairs.sort(', 'pairs.sort()', 'Sorted by start, then by end.', { pairs: sorted.map(p => p.slice()), sorted: true })
  add('done', 'return pairs.sort(', 'return pairs', `${sorted.length} occurrence${sorted.length === 1 ? '' : 's'} found.`, { pairs: sorted.map(p => p.slice()), sorted: true, result: sorted.map(p => p.slice()) })
  return { input: { text, words }, result: sorted, frames }
}
