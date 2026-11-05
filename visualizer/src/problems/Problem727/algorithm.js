export function parseInput(text) {
  const data = JSON.parse(text)
  const { s1, s2 } = data ?? {}
  const ok = s => typeof s === 'string' && s.length >= 1 && s.length <= 40 && /^[a-z]+$/.test(s)
  if (!ok(s1) || !ok(s2)) throw new Error('s1 and s2 must be JSON strings of 1–40 lowercase letters.')
  return { s1, s2 }
}

const JS_LINES = [
  'function minWindow(s1, s2) {',
  '  const m = s2.length',
  '  const start = new Array(m).fill(-1) // start[j] = where the match of s2[0..j] began, for the latest end of s1',
  '  let bestLength = Infinity, bestStart = -1',
  '  for (let i = 0; i < s1.length; i++) {',
  '    for (let j = m - 1; j >= 0; j--) { // go backwards so one character of s1 is used once',
  '      if (s1[i] !== s2[j]) continue',
  '      if (j === 0) start[0] = i // a match of s2[0] starts a new candidate',
  '      else start[j] = start[j - 1] // extend the match that ended before i',
  '    }',
  '    if (start[m - 1] !== -1 && i - start[m - 1] + 1 < bestLength) { // strictly shorter keeps the leftmost window',
  '      bestLength = i - start[m - 1] + 1',
  '      bestStart = start[m - 1]',
  '    }',
  '  }',
  '  return bestStart === -1 ? \'\' : s1.slice(bestStart, bestStart + bestLength) // return the window or the empty string',
  '}',
]
const PY_LINES = [
  'def min_window(s1, s2):',
  '    m = len(s2)',
  '    start = [-1] * m',
  '    best_length, best_start = float(\'inf\'), -1',
  '    for i, ch in enumerate(s1):',
  '        for j in range(m - 1, -1, -1):',
  '            if ch != s2[j]:',
  '                continue',
  '            if j == 0:',
  '                start[0] = i',
  '            else:',
  '                start[j] = start[j - 1]',
  '        if start[m - 1] != -1 and i - start[m - 1] + 1 < best_length:',
  '            best_length = i - start[m - 1] + 1',
  '            best_start = start[m - 1]',
  '    return s1[best_start:best_start + best_length] if best_start != -1 else \'\'',
]
const L = s => JS_LINES.findIndex(t => t.includes(s)) + 1
const P = s => PY_LINES.findIndex(t => t.includes(s)) + 1

export const code = JS_LINES.map((text, index) => ({ line: index + 1, text }))
export const python = PY_LINES.join('\n')

// start[j] is the position where the latest match of s2[0..j] began. Each character of s1 is checked against the
// targets from the last one to the first, so a single character cannot satisfy two target positions.
export function buildTrace({ s1, s2 }) {
  const m = s2.length
  const start = new Array(m).fill(-1)
  let bestLength = Infinity, bestStart = -1
  const frames = [{ phase: 'start', i: -1, start: [...start], best: null, activeLine: L('const start = new Array'), pythonLine: P('start = [-1]'), message: 'No target character is matched yet.' }]
  for (let i = 0; i < s1.length; i++) {
    const matched = []
    for (let j = m - 1; j >= 0; j--) {
      if (s1[i] !== s2[j]) continue
      if (j === 0) start[0] = i
      else start[j] = start[j - 1]
      matched.push(j)
    }
    const complete = start[m - 1] !== -1
    let improved = false
    if (complete && i - start[m - 1] + 1 < bestLength) {
      bestLength = i - start[m - 1] + 1
      bestStart = start[m - 1]
      improved = true
    }
    const best = bestStart === -1 ? null : [bestStart, bestStart + bestLength - 1]
    frames.push({ phase: improved ? 'improve' : matched.length ? 'match' : 'scan', i, matched, start: [...start], best, activeLine: L(improved ? 'bestLength = i' : 'for (let j = m - 1'), pythonLine: P(improved ? 'best_length = i' : 'for j in range'),
      message: matched.length === 0 ? `s1[${i}] = '${s1[i]}' matches no target position.`
        : `s1[${i}] = '${s1[i]}' matches target${matched.length > 1 ? 's' : ''} ${matched.map(j => `s2[${j}]`).join(', ')}.${improved ? ` A window of length ${bestLength} now ends at ${i}.` : complete ? ' The full target is matched, but a shorter window was already seen.' : ''}` })
  }
  const result = bestStart === -1 ? '' : s1.slice(bestStart, bestStart + bestLength)
  frames.push({ phase: 'done', i: s1.length - 1, start: [...start], best: bestStart === -1 ? null : [bestStart, bestStart + bestLength - 1], result, activeLine: L('return bestStart'), pythonLine: P('return s1['), message: result ? `Shortest window: "${result}".` : 'No window contains s2 as a subsequence, so the answer is the empty string.' })
  return { input: { s1, s2 }, result, frames }
}
