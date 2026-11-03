export const phases = [
  { id: 'start', label: 'Read string', description: 'Start at the left end, walking to the right.' },
  { id: 'pair', label: 'Pair brackets', description: 'Use a stack to match every opening bracket with its closing bracket.' },
  { id: 'letter', label: 'Write letter', description: 'A letter is written in the current direction.' },
  { id: 'jump', label: 'Jump and turn', description: 'A bracket jumps to its partner and reverses the walking direction, which reverses that group.' },
  { id: 'done', label: 'Result', description: 'The letters written during the walk form the answer.' },
]

export function parseInput(text) {
  const data = JSON.parse(text)
  const s = data?.s
  if (typeof s !== 'string' || s.length < 1 || s.length > 2000) throw new Error('s must be a string of 1 to 2000 characters.')
  if (!/^[a-z()]+$/.test(s)) throw new Error('Use lowercase letters and parentheses only.')
  let depth = 0
  for (const ch of s) {
    if (ch === '(') depth++
    else if (ch === ')' && --depth < 0) throw new Error('A closing bracket has no matching opening bracket.')
  }
  if (depth !== 0) throw new Error('Every opening bracket needs a closing bracket.')
  return { s }
}

export function buildTrace({ s }) {
  const n = s.length
  const partner = Array(n).fill(-1)
  const frames = []
  const stack = []
  const snap = extra => ({ s, partner: [...partner], ...extra })

  frames.push({ phase: 'start', activeLine: 3, message: 'Start at position 0, walking right. The output is empty.', snapshot: snap({ index: 0, direction: 1, out: '', pointer: 0 }) })
  for (let i = 0; i < n; i++) {
    if (s[i] === '(') stack.push(i)
    else if (s[i] === ')') {
      const j = stack.pop()
      partner[i] = j
      partner[j] = i
      frames.push({ phase: 'pair', activeLine: 2, message: `The closing bracket at ${i} matches the opening bracket at ${j}. Their positions are linked.`, snapshot: snap({ index: i, direction: 1, out: '', pointer: -1 }) })
    }
  }

  const out = []
  let i = 0
  let step = 1
  while (i >= 0 && i < n) {
    if (s[i] === '(' || s[i] === ')') {
      const to = partner[i]
      step = -step
      frames.push({ phase: 'jump', activeLine: 6, message: `Bracket at ${i} jumps to its partner at ${to} and the direction flips to ${step > 0 ? 'right' : 'left'}.`, snapshot: snap({ index: i, direction: step, out: out.join(''), pointer: to }) })
      i = to
    } else {
      out.push(s[i])
      frames.push({ phase: 'letter', activeLine: 7, message: `Write ${s[i]} from position ${i}. Output so far: ${out.join('')}.`, snapshot: snap({ index: i, direction: step, out: out.join(''), pointer: i }) })
    }
    i += step
  }
  const result = out.join('')
  frames.push({ phase: 'done', activeLine: 9, message: `The walk is complete. The answer is ${result || 'empty'}.`, snapshot: snap({ index: -1, direction: step, out: result, pointer: -1 }) })
  return { input: { s }, result, frames }
}

export const code = [
  'FUNCTION reverseInParentheses(s)',
  '    partner ← bracket partner index for every bracket (stack)',
  '    out ← empty list, i ← 0, step ← +1',
  '    WHILE 0 ≤ i < LENGTH(s)',
  '        IF s[i] IS a bracket THEN',
  '            i ← partner[i], step ← -step',
  '        ELSE APPEND s[i] TO out',
  '        i ← i + step',
  '    RETURN out',
]

export const python = `def reverse_in_parentheses(s):
    partner = [0] * len(s)
    stack = []
    for i, ch in enumerate(s):
        if ch == '(':
            stack.append(i)
        elif ch == ')':
            j = stack.pop()
            partner[i], partner[j] = j, i
    out, i, step = [], 0, 1
    while 0 <= i < len(s):
        if s[i] in '()':
            i = partner[i]
            step = -step
        else:
            out.append(s[i])
        i += step
    return ''.join(out)`

export const pythonLineMap = { 1: 1, 2: 2, 3: 10, 4: 11, 5: 12, 6: 13, 7: 16, 8: 17, 9: 18 }
