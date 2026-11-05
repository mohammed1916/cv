export function parseInput(text) {
  const s = JSON.parse(text)
  if (typeof s !== 'string' || s.length < 1 || s.length > 100 || ![...s].every(c => c === '(' || c === ')' || c === '*')) throw new Error('Enter a JSON string of 1–100 characters, each (, ) or *.')
  return s
}

// Track the range [lo, hi] of possible counts of unmatched '('. '(' raises both ends; ')' lowers both; '*' can
// be '(' (raise hi), ')' (lower lo), or empty (keep lo). lo never goes below zero, and hi < 0 is impossible.
export function buildTrace(s) {
  let lo = 0
  let hi = 0
  let result = true
  const frames = [{ phase: 'start', index: null, char: null, lo, hi, activeLine: L('let lo = 0'), pythonLine: P('lo = hi = 0'), message: 'No characters read yet: zero open brackets are possible.' }]
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (c === '(') { lo++; hi++ }
    else if (c === ')') { lo--; hi-- }
    else { lo--; hi++ }
    if (hi < 0) {
      result = false
      frames.push({ phase: 'fail', index: i, char: c, lo, hi, activeLine: L('if (hi < 0)'), pythonLine: P('if hi < 0'), message: `${c} at ${i} leaves no way to close the brackets (hi ${hi}).` })
      break
    }
    lo = Math.max(lo, 0)
    frames.push({ phase: 'step', index: i, char: c, lo, hi, activeLine: L('lo = Math.max'), pythonLine: P('lo = max(lo, 0)'), message: `${c} at ${i}: possible open counts are now ${lo} to ${hi}.` })
  }
  if (result) {
    result = lo === 0
    frames.push({ phase: 'done', index: s.length - 1, char: null, lo, hi, result, activeLine: L('return lo === 0'), pythonLine: P('return lo == 0'), message: result ? 'Zero open brackets is in the range, so the string is valid.' : `The fewest possible open brackets is ${lo}, so it is invalid.` })
  }
  return { input: s, result, frames }
}

const SOURCE = `function checkValidString(s) {
  let lo = 0
  let hi = 0
  for (const c of s) {
    if (c === '(') {
      lo++
      hi++
    } else if (c === ')') {
      lo--
      hi--
    } else {
      lo--
      hi++
    }
    if (hi < 0) return false
    lo = Math.max(lo, 0)
  }
  return lo === 0
}`
export const code = SOURCE.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def check_valid_string(s):
    lo = hi = 0
    for c in s:
        if c == '(':
            lo, hi = lo + 1, hi + 1
        elif c == ')':
            lo, hi = lo - 1, hi - 1
        else:
            lo, hi = lo - 1, hi + 1
        if hi < 0:
            return False
        lo = max(lo, 0)
    return lo == 0`
const P = s => python.split('\n').findIndex(t => t.includes(s)) + 1
