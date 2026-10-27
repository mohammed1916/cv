export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input.s !== 'string' || !Number.isInteger(input.k)) throw new Error('Use an object with a binary string s and an integer k.')
  if (input.s.length < 1 || input.s.length > 40) throw new Error('s must have 1 to 40 characters.')
  if (!/^[01]+$/.test(input.s)) throw new Error('s may only contain the characters 0 and 1.')
  if (input.k < 0 || input.k > input.s.length) throw new Error('k must be from 0 up to the length of s.')
  return { s: input.s, k: input.k }
}

export function buildTrace({ s, k }) {
  const frames = []
  let count = 0
  let left = 0
  const window = { zeros: 0, ones: 0 }
  frames.push({ phase: 'start', activeLine: L('set count to 0'), left, right: -1, window: { ...window }, count, message: 'No substring has been counted yet.' })
  for (let right = 0; right < s.length; right++) {
    if (s[right] === '0') window.zeros++
    else window.ones++
    frames.push({ phase: 'extend', activeLine: L('add the character'), left, right, window: { ...window }, count, message: `Add ${s[right]} at position ${right}.` })
    while (window.zeros > k && window.ones > k) {
      if (s[left] === '0') window.zeros--
      else window.ones--
      left++
      frames.push({ phase: 'shrink', activeLine: L('while the window has more'), left, right, window: { ...window }, count, message: `The window has too many of both characters, so the start moves to ${left}.` })
    }
    count += right - left + 1
    frames.push({ phase: 'count', activeLine: L('add right minus left plus 1'), left, right, window: { ...window }, count, message: `Substrings ending at ${right} that satisfy the rule: ${right - left + 1}. Total ${count}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return count'), left, right: s.length - 1, window: { ...window }, count, message: `Total valid substrings: ${count}.` })
  return { input: { s, k }, result: count, frames }
}

export const code = `count substrings that satisfy the k-constraint (s, k):
  set count to 0
  set left to 0
  for each position right in s
    add the character at right to the window counts
    while the window has more than k zeros and more than k ones
      remove the character at left from the window counts
      move left forward by one
    add right minus left plus 1 to count
  return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_substrings(s, k):
    count = 0
    left = 0
    zeros = 0
    ones = 0
    for right, ch in enumerate(s):
        if ch == '0':
            zeros += 1
        else:
            ones += 1
        while zeros > k and ones > k:
            if s[left] == '0':
                zeros -= 1
            else:
                ones -= 1
            left += 1
        count += right - left + 1
    return count
`
