export function parseInput(text) {
  const spec = JSON.parse(text)
  for (const key of ['a', 'b', 'c']) {
    if (!Number.isInteger(spec[key]) || spec[key] < 0 || spec[key] > 100) throw new Error(`${key} is an integer from 0 to 100.`)
  }
  if (spec.a + spec.b + spec.c < 1) throw new Error('Use at least one letter.')
  return spec
}

// Greedy: add the letter with the most remaining copies unless it would make three equal letters in a row.
export function buildTrace(spec) {
  const left = { a: spec.a, b: spec.b, c: spec.c }
  let s = ''
  const frames = [{ phase: 'start', activeLine: L('counts ='), s: '', left: { ...left }, letter: null, message: 'Always add the letter with the most copies left, unless it would make three in a row.' }]
  while (left.a + left.b + left.c > 0) {
    const options = ['a', 'b', 'c']
      .filter(ch => left[ch] > 0)
      .filter(ch => !(s.length >= 2 && s.at(-1) === ch && s.at(-2) === ch))
      .sort((x, y) => left[y] - left[x] || (x < y ? -1 : 1))
    if (options.length === 0) {
      frames.push({ phase: 'stuck', activeLine: L('return ""'), s, left: { ...left }, letter: null, message: 'Every remaining letter would make three in a row, so no string exists.' })
      return { input: spec, result: '', frames }
    }
    const letter = options[0]
    left[letter]--
    s += letter
    frames.push({ phase: 'add', activeLine: L('s += letter'), s, left: { ...left }, letter, message: `Add ${letter}: ${left[letter]} ${letter} left.` })
  }
  frames.push({ phase: 'done', activeLine: L('return s'), s, left: { ...left }, letter: null, message: `Built ${s}.` })
  return { input: spec, result: s, frames }
}

export const code = `def longestDiverseString(a, b, c):
    counts = {'a': a, 'b': b, 'c': c}
    s = ''
    while sum(counts.values()) > 0:
        for ch in sorted(counts, key=lambda x: -counts[x]):
            if counts[ch] == 0:
                continue
            if len(s) >= 2 and s[-1] == ch and s[-2] == ch:
                continue
            s += ch
            counts[ch] -= 1
            break
        else:
            return ''
    return s`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
