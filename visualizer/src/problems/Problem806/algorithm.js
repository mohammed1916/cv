export function parseInput(text) {
  const data = JSON.parse(text)
  const { widths, s } = data ?? {}
  if (!Array.isArray(widths) || widths.length !== 26 || widths.some(w => !Number.isInteger(w) || w < 2 || w > 10)) throw new Error('widths is 26 integers from 2 to 10, one per lowercase letter.')
  if (typeof s !== 'string' || s.length < 1 || s.length > 100 || !/^[a-z]+$/.test(s)) throw new Error('s is 1–100 lowercase letters.')
  return { widths, s }
}

const JS_LINES = [
  'function numberOfLines(widths, s) {',
  '  let lines = 1, used = 0 // start on line one with nothing written',
  '  for (const ch of s) {',
  '    const w = widths[ch.charCodeAt(0) - 97]',
  '    if (used + w > 100) { lines++; used = 0 } // the letter does not fit: start a new line',
  '    used += w',
  '  }',
  '  return [lines, used] // the line count and the width of the last line',
  '}',
]
const PY_LINES = [
  'def number_of_lines(widths, s):',
  '    lines, used = 1, 0',
  '    for ch in s:',
  '        w = widths[ord(ch) - ord(\'a\')]',
  '        if used + w > 100:',
  '            lines += 1',
  '            used = 0',
  '        used += w',
  '    return [lines, used]',
]
const L = s => JS_LINES.findIndex(t => t.includes(s)) + 1
const P = s => PY_LINES.findIndex(t => t.includes(s)) + 1

export const code = JS_LINES.map((text, index) => ({ line: index + 1, text }))
export const python = PY_LINES.join('\n')

// Each line is 100 pixels wide. A letter moves to a new line when it would overflow the current one.
export function buildTrace({ widths, s }) {
  let lines = 1, used = 0
  const rows = []
  const frames = [{ phase: 'start', i: -1, lines, used, rows: [], activeLine: L('let lines = 1'), pythonLine: P('lines, used = 1, 0'), message: 'Line 1 starts empty.' }]
  for (let i = 0; i < s.length; i++) {
    const w = widths[s.charCodeAt(i) - 97]
    const wrap = used + w > 100
    if (wrap) { lines++; used = 0 }
    used += w
    rows.push({ letter: s[i], w, line: lines, used })
    frames.push({ phase: wrap ? 'wrap' : 'fit', i, lines, used, rows: rows.map(r => ({ ...r })), activeLine: L(wrap ? 'start a new line' : 'used += w'), pythonLine: P(wrap ? 'lines += 1' : 'used += w'),
      message: wrap ? `'${s[i]}' (${w} px) would overflow, so it starts line ${lines}.` : `'${s[i]}' (${w} px) fits on line ${lines}; ${used} px used.` })
  }
  const result = [lines, used]
  frames.push({ phase: 'done', i: s.length - 1, lines, used, rows: rows.map(r => ({ ...r })), result, activeLine: L('return [lines, used]'), pythonLine: P('return [lines, used]'), message: `${lines} line${lines === 1 ? '' : 's'}; the last line is ${used} px wide.` })
  return { input: { widths, s }, result, frames }
}
