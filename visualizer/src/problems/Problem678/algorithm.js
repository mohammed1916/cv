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

export const code = `set low and high to 0
for each character c in s
  if c is an opening bracket then add 1 to low and to high
  otherwise if c is a closing bracket then subtract 1 from low and from high
  otherwise c is a star: subtract 1 from low and add 1 to high
  if high is negative then return false
  set low to the larger of low and 0
return true only if low is 0`.split('\n').map((text, index) => ({ line: index + 1, text }))

// Family line 3 reports a rejection, line 4 the clamped interval after each character, line 5 the return.
export const LINE_MAP = { 1: 1, 3: 6, 4: 7, 5: 8 }

export const python = `def check_valid_string(s):
    low = high = 0
    for c in s:
        if c == '(':
            low += 1
            high += 1
        elif c == ')':
            low -= 1
            high -= 1
        else:
            low -= 1
            high += 1
        if high < 0:
            return False
        low = max(low, 0)
    return low == 0`
