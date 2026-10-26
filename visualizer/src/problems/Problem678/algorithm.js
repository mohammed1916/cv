export function parseInput(text) {
  const s = JSON.parse(text)
  if (typeof s !== 'string' || s.length < 1 || s.length > 100 || ![...s].every(c => c === '(' || c === ')' || c === '*')) throw new Error('Enter a JSON string of 1–100 characters, each (, ) or *.')
  return s
}

// Track the range of possible open-bracket counts: '*' can close (−1), stay (0), or open (+1).
export function buildTrace(s) {
  let lo = 0, hi = 0
  const frames = [{ phase: 'start', index: -1, lo, hi, activeLine: 2, message: 'No brackets are open yet.' }]
  let failed = false
  for (let i = 0; i < s.length && !failed; i++) {
    const c = s[i]
    if (c === '(') { lo++; hi++ }
    else if (c === ')') { lo--; hi-- }
    else { lo--; hi++ }
    if (hi < 0) { failed = true; frames.push({ phase: 'reject', index: i, lo, hi, activeLine: 8, message: `Too many ')' at ${i}: even the most generous reading is unbalanced.` }); break }
    lo = Math.max(lo, 0)
    frames.push({ phase: 'step', index: i, lo, hi, activeLine: 6, message: `${c} at ${i}: open count can be between ${lo} and ${hi}.` })
  }
  const result = !failed && lo === 0
  frames.push({ phase: 'done', index: s.length - 1, lo, hi, result, activeLine: 10, message: result ? 'Zero open brackets is possible at the end: valid.' : 'Some open brackets must remain: invalid.' })
  return { input: s, result, frames }
}

export const code = `def checkValidString(s):
    lo = hi = 0
    for c in s:
        if c == '(': lo, hi = lo + 1, hi + 1
        elif c == ')': lo, hi = lo - 1, hi - 1
        else: lo, hi = lo - 1, hi + 1
        if hi < 0: return False
        lo = max(lo, 0)
    return lo == 0`.split('\n').map((text, index) => ({ line: index + 1, text }))
