const lengthAfter = (ch, L) => (ch === '*' ? Math.max(0, L - 1) : ch === '#' ? 2 * L : ch === '%' ? L : L + 1)

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with s and k.')
  const { s, k } = data
  if (typeof s !== 'string' || s.length < 1 || s.length > 30 || !/^[a-z*#%]+$/.test(s)) throw new Error('s is 1 to 30 characters: lowercase letters, *, # or %.')
  if (!Number.isInteger(k) || k < 0 || k > 200) throw new Error('k is an integer from 0 to 200.')
  let len = 0
  for (const ch of s) {
    len = lengthAfter(ch, len)
    if (len > 5000) throw new Error('The processed string may be at most 5000 characters in this visualization.')
  }
  return { s, k }
}

export function buildTrace(input) {
  const { s, k } = input
  // lengths[i] is the length of the string after the first i operations.
  const lengths = [0]
  for (const ch of s) lengths.push(lengthAfter(ch, lengths[lengths.length - 1]))
  const total = lengths[s.length]
  const frames = [{ phase: 'lengths', activeLine: L('set length to 0'), index: -1, pos: k, total, message: `The processed string has length ${total}.` }]
  if (k >= total) {
    frames.push({ phase: 'done', activeLine: L('if k is at least length'), index: -1, pos: k, total, message: `k = ${k} is past the end, so the answer is a dot.` })
    return { input, result: '.', frames }
  }
  let pos = k
  for (let i = s.length - 1; i >= 0; i--) {
    const ch = s[i]
    const before = lengths[i]
    if (ch === '#') {
      if (pos >= before) pos -= before
      frames.push({ phase: 'back', activeLine: L('if the operation is #'), index: i, pos, total, message: `Operation ${i + 1} is a copy, so position ${pos} is read from the part before the copy.` })
    } else if (ch === '%') {
      pos = before - 1 - pos
      frames.push({ phase: 'back', activeLine: L('if the operation is %'), index: i, pos, total, message: `Operation ${i + 1} reverses the string, so the position becomes ${pos}.` })
    } else if (ch !== '*' && pos === before) {
      frames.push({ phase: 'found', activeLine: L('if the operation is a letter'), index: i, pos, total, message: `Operation ${i + 1} added ${ch} at the end, and that is position ${pos}.` })
      frames.push({ phase: 'done', activeLine: L('return that letter'), index: -1, pos, total, message: `The character at position ${k} is ${ch}.` })
      return { input, result: ch, frames }
    }
  }
  frames.push({ phase: 'done', activeLine: L('  return dot'), index: -1, pos, total, message: 'No letter was found, so the answer is a dot.' })
  return { input, result: '.', frames }
}

export const code = `find the kth character after all operations
  set length to 0 and record the length after each operation
  for each character ch of s in order
    if ch is a letter then add 1 to length
    if ch is * then subtract 1 from length but not below 0
    if ch is # then double length
    if ch is % then length stays the same
  if k is at least length then return dot
  set pos to k
  for each operation from last to first
    if the operation is a letter and pos equals the length before it then return that letter
    if the operation is # and pos is at least the length before it then subtract that length from pos
    if the operation is % then set pos to the length before it minus 1 minus pos
  return dot`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def kth_character(s, k):
    lengths = [0]
    for ch in s:
        n = lengths[-1]
        if ch == "*":
            lengths.append(max(0, n - 1))
        elif ch == "#":
            lengths.append(2 * n)
        elif ch == "%":
            lengths.append(n)
        else:
            lengths.append(n + 1)
    if k >= lengths[-1]:
        return "."
    pos = k
    for i in range(len(s) - 1, -1, -1):
        ch = s[i]
        before = lengths[i]
        if ch == "#":
            if pos >= before:
                pos -= before
        elif ch == "%":
            pos = before - 1 - pos
        elif ch != "*" and pos == before:
            return ch
    return "."
`
