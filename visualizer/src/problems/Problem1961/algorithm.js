// LeetCode 1961: concatenate words one at a time; the string is a prefix string when the build matches s exactly.
const SOURCE = [
  "function isPrefixString(s, words) {",
  "  let built = ''",
  "  for (const word of words) {",
  "    built += word",
  "    if (built === s) return true",
  "    if (!s.startsWith(built)) return false",
  "  }",
  "  return false",
  "}",
]

export const code = SOURCE.map((text, index) => ({ line: index + 1, text }))

export const python = `def is_prefix_string(s, words):
    built = ""
    for word in words:
        built += word
        if built == s:
            return True
        if not s.startswith(built):
            return False
    return False
`

const L = text => { const i = SOURCE.findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no code line: ${text}`); return i + 1 }
const P = text => { const i = python.split('\n').findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no python line: ${text}`); return i + 1 }

export const phases = [
  { id: 'build', label: 'Build', description: 'Append the next word and compare with s.' },
  { id: 'done', label: 'Result', description: 'Decide whether the build matched.' },
]

export function parseInput(text) {
  let input
  try { input = JSON.parse(text) } catch { throw new Error('Enter JSON like {"s":"catdog","words":["cat","dog"]}.') }
  const { s, words } = input || {}
  if (typeof s !== 'string' || !/^[a-z]{1,30}$/.test(s)) throw new Error('s is 1 to 30 lowercase letters.')
  if (!Array.isArray(words) || words.length < 1 || words.length > 8 || !words.every(w => typeof w === 'string' && /^[a-z]{1,10}$/.test(w))) throw new Error('words holds 1 to 8 lowercase words.')
  return { s, words }
}

export function buildTrace({ s, words }) {
  const frames = []
  let built = ''
  let result = false
  for (const word of words) {
    built += word
    const matched = built === s
    const stop = !matched && !s.startsWith(built)
    frames.push({ phase: 'build', activeLine: L('built += word'), pythonLine: P('built +='), message: `Build is now "${built}".`, s, built, word, matched: false, stop: false })
    if (matched) {
      result = true
      frames.push({ phase: 'build', activeLine: L('return true'), pythonLine: P('return True'), message: 'The build equals s, so the answer is true.', s, built, word, matched: true, stop: false })
      break
    }
    if (stop) {
      frames.push({ phase: 'build', activeLine: L('return false'), pythonLine: P('return False'), message: `"${built}" is not a prefix of s, so the answer is false.`, s, built, word, matched: false, stop: true })
      break
    }
  }
  frames.push({ phase: 'done', activeLine: L('return false'), pythonLine: P('return False'), message: result ? 'Result: true.' : 'Result: false.', s, built, word: null, matched: result, stop: !result, result })
  return { input: { s, words }, result, frames }
}
