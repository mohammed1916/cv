export function parseInput(text) {
  const s = JSON.parse(text)
  if (typeof s !== 'string' || s.length < 1 || s.length > 1000 || !/^[a-z]+$/.test(s)) throw new Error('s is 1–1,000 lowercase letters.')
  return s
}

const JS_LINES = [
  'function largeGroupPositions(s) {',
  '  const result = []',
  '  let start = 0 // start of the current run of equal letters',
  '  for (let i = 1; i <= s.length; i++) {',
  '    if (i === s.length || s[i] !== s[start]) { // the run ends before i',
  '      if (i - start >= 3) result.push([start, i - 1]) // groups of three or more',
  '      start = i',
  '    }',
  '  }',
  '  return result',
  '}',
]
const PY_LINES = [
  'def large_group_positions(s):',
  '    result = []',
  '    start = 0',
  '    for i in range(1, len(s) + 1):',
  '        if i == len(s) or s[i] != s[start]:',
  '            if i - start >= 3:',
  '                result.append([start, i - 1])',
  '            start = i',
  '    return result',
]
const L = s => JS_LINES.findIndex(t => t.includes(s)) + 1
const P = s => PY_LINES.findIndex(t => t.includes(s)) + 1

export const code = JS_LINES.map((text, index) => ({ line: index + 1, text }))
export const python = PY_LINES.join('\n')

// Scan once, tracking where the current run of equal letters started. A run closes when the letter changes or the string ends.
export function buildTrace(s) {
  const result = []
  let start = 0
  const frames = [{ phase: 'start', i: 0, start: 0, runs: [], activeLine: L('let start = 0'), pythonLine: P('start = 0'), message: `Start a run at position 0 ('${s[0]}').` }]
  for (let i = 1; i <= s.length; i++) {
    if (i === s.length || s[i] !== s[start]) {
      const length = i - start
      if (length >= 3) result.push([start, i - 1])
      frames.push({ phase: length >= 3 ? 'group' : 'short', i, start, end: i - 1, runs: result.map(r => [...r]), activeLine: L(length >= 3 ? 'groups of three' : 'if (i === s.length'), pythonLine: P(length >= 3 ? 'result.append' : 'if i == len'),
        message: length >= 3 ? `The run "${s.slice(start, i)}" from ${start} to ${i - 1} has ${length} letters: a large group.` : `The run "${s.slice(start, i)}" has only ${length} letter${length === 1 ? '' : 's'}.` })
      start = i
    }
  }
  frames.push({ phase: 'done', i: s.length, start, runs: result.map(r => [...r]), result, activeLine: L('return result'), pythonLine: P('return result'), message: `${result.length} large group${result.length === 1 ? '' : 's'} found.` })
  return { input: s, result, frames }
}
