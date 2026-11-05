export function parseInput(text) {
  const data = JSON.parse(text)
  const { s, t } = data ?? {}
  const ok = x => typeof x === 'string' && x.length >= 1 && x.length <= 200 && /^[a-z#]+$/.test(x)
  if (!ok(s) || !ok(t)) throw new Error('s and t are 1–200 characters, each a lowercase letter or #.')
  return { s, t }
}

const JS_LINES = [
  'function backspaceCompare(s, t) {',
  '  let i = s.length - 1, j = t.length - 1 // read both strings from the end',
  '  let skipS = 0, skipT = 0 // pending backspaces that erase earlier characters',
  '  while (i >= 0 || j >= 0) {',
  '    while (i >= 0) { // find the next character of s that survives',
  '      if (s[i] === \'#\') { skipS++; i-- }',
  '      else if (skipS > 0) { skipS--; i-- }',
  '      else break',
  '    }',
  '    while (j >= 0) { // and the same for t',
  '      if (t[j] === \'#\') { skipT++; j-- }',
  '      else if (skipT > 0) { skipT--; j-- }',
  '      else break',
  '    }',
  '    if (i >= 0 && j >= 0) { if (s[i] !== t[j]) return false } // compare the surviving characters',
  '    else if (i >= 0 || j >= 0) return false // one string has more characters left',
  '    i--; j--',
  '  }',
  '  return true',
  '}',
]
const PY_LINES = [
  'def backspace_compare(s, t):',
  '    i, j = len(s) - 1, len(t) - 1',
  '    skip_s = skip_t = 0',
  '    while i >= 0 or j >= 0:',
  '        while i >= 0:',
  '            if s[i] == \'#\':',
  '                skip_s += 1',
  '                i -= 1',
  '            elif skip_s > 0:',
  '                skip_s -= 1',
  '                i -= 1',
  '            else:',
  '                break',
  '        while j >= 0:',
  '            if t[j] == \'#\':',
  '                skip_t += 1',
  '                j -= 1',
  '            elif skip_t > 0:',
  '                skip_t -= 1',
  '                j -= 1',
  '            else:',
  '                break',
  '        if i >= 0 and j >= 0:',
  '            if s[i] != t[j]:',
  '                return False',
  '        elif i >= 0 or j >= 0:',
  '            return False',
  '        i -= 1',
  '        j -= 1',
  '    return True',
]
const L = s => JS_LINES.findIndex(t => t.includes(s)) + 1
const P = s => PY_LINES.findIndex(t => t.includes(s)) + 1

export const code = JS_LINES.map((text, index) => ({ line: index + 1, text }))
export const python = PY_LINES.join('\n')

// Two pointers walk backwards. Each pointer skips characters that a later '#' erases, then the surviving characters are compared.
export function buildTrace({ s, t }) {
  let i = s.length - 1, j = t.length - 1
  let skipS = 0, skipT = 0
  const frames = [{ phase: 'start', i, j, kept: { s: [], t: [] }, activeLine: L('let i = s.length'), pythonLine: P('i, j = len(s)'), message: 'Both pointers start at the last characters and walk left.' }]
  const erased = { s: new Set(), t: new Set() }
  while (i >= 0 || j >= 0) {
    while (i >= 0) {
      if (s[i] === '#') { skipS++; erased.s.add(i); i--; frames.push({ phase: 'skip', i, j, kept: { s: [], t: [] }, erased: { s: [...erased.s], t: [...erased.t] }, activeLine: L("if (s[i] === '#')"), pythonLine: P("skip_s += 1"), message: `s[${i + 1}] is a backspace: it will erase one earlier character.` }) }
      else if (skipS > 0) { skipS--; erased.s.add(i); i--; frames.push({ phase: 'skip', i, j, kept: { s: [], t: [] }, erased: { s: [...erased.s], t: [...erased.t] }, activeLine: L('else if (skipS > 0)'), pythonLine: P('skip_s -= 1'), message: `s[${i + 1}] is erased by a backspace.` }) }
      else break
    }
    while (j >= 0) {
      if (t[j] === '#') { skipT++; erased.t.add(j); j--; frames.push({ phase: 'skip', i, j, kept: { s: [], t: [] }, erased: { s: [...erased.s], t: [...erased.t] }, activeLine: L("if (t[j] === '#')"), pythonLine: P("skip_t += 1"), message: `t[${j + 1}] is a backspace.` }) }
      else if (skipT > 0) { skipT--; erased.t.add(j); j--; frames.push({ phase: 'skip', i, j, kept: { s: [], t: [] }, erased: { s: [...erased.s], t: [...erased.t] }, activeLine: L('else if (skipT > 0)'), pythonLine: P('skip_t -= 1'), message: `t[${j + 1}] is erased by a backspace.` }) }
      else break
    }
    if (i >= 0 && j >= 0) {
      const same = s[i] === t[j]
      frames.push({ phase: same ? 'match' : 'mismatch', i, j, kept: { s: [i], t: [j] }, erased: { s: [...erased.s], t: [...erased.t] }, activeLine: L('compare the surviving characters'), pythonLine: P('if s[i] != t[j]'), message: same ? `Survivors s[${i}] = '${s[i]}' and t[${j}] = '${t[j]}' match.` : `Survivors s[${i}] = '${s[i]}' and t[${j}] = '${t[j]}' differ, so the results differ.` })
      if (!same) return { input: { s, t }, result: false, frames: [...frames, { phase: 'done', i, j, kept: { s: [], t: [] }, result: false, activeLine: L('return false'), pythonLine: P('return False'), message: 'The typed results differ.' }] }
    } else if (i >= 0 || j >= 0) {
      frames.push({ phase: 'mismatch', i, j, kept: { s: [], t: [] }, erased: { s: [...erased.s], t: [...erased.t] }, activeLine: L('one string has more characters left'), pythonLine: P('elif i >= 0 or j >= 0'), message: 'One string has a character left and the other does not, so the results differ.' })
      return { input: { s, t }, result: false, frames: [...frames, { phase: 'done', i, j, kept: { s: [], t: [] }, result: false, activeLine: L('return false'), pythonLine: P('return False'), message: 'The typed results differ.' }] }
    }
    i--
    j--
  }
  frames.push({ phase: 'done', i, j, kept: { s: [], t: [] }, result: true, activeLine: L('return true'), pythonLine: P('return True'), message: 'Every surviving character matched, so the typed results are equal.' })
  return { input: { s, t }, result: true, frames }
}
