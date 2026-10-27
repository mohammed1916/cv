export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with s.')
  const { s } = data
  if (typeof s !== 'string' || s.length < 1 || s.length > 30 || !/^[a-z*#%]+$/.test(s)) throw new Error('s is 1 to 30 characters: lowercase letters, *, # or %.')
  // Copies can double the length, so check the final length while reading the operations.
  let len = 0
  for (const ch of s) {
    if (ch === '*') len = Math.max(0, len - 1)
    else if (ch === '#') len *= 2
    else if (ch !== '%') len += 1
    if (len > 5000) throw new Error('The processed string may be at most 5000 characters in this visualization.')
  }
  return { s }
}

export function buildTrace(input) {
  let text = ''
  const frames = [{ phase: 'start', activeLine: L('set result to empty'), index: -1, text, message: 'Start with an empty string.' }]
  input.s.split('').forEach((ch, i) => {
    if (/[a-z]/.test(ch)) {
      text += ch
      frames.push({ phase: 'add', activeLine: L('if ch is a letter'), index: i, text, message: `Append ${ch}: ${text}.` })
    } else if (ch === '*') {
      text = text.slice(0, -1)
      frames.push({ phase: 'remove', activeLine: L('if ch is *'), index: i, text, message: `Remove the last character: ${text || '(empty)'}.` })
    } else if (ch === '#') {
      text += text
      frames.push({ phase: 'copy', activeLine: L('if ch is #'), index: i, text, message: `Append a copy of the string to itself: ${text || '(empty)'}.` })
    } else {
      text = [...text].reverse().join('')
      frames.push({ phase: 'reverse', activeLine: L('if ch is %'), index: i, text, message: `Reverse the string: ${text || '(empty)'}.` })
    }
  })
  frames.push({ phase: 'done', activeLine: L('return result'), index: -1, text, message: `The processed string is ${text || '(empty)'}.` })
  return { input, result: text, frames }
}

export const code = `process the special operations
  set result to empty
  for each character ch of s in order
    if ch is a letter then add it to the end of result
    if ch is * and result is not empty then remove its last character
    if ch is # then append a copy of result to itself
    if ch is % then reverse result
  return result`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def process_string(s):
    result = ""
    for ch in s:
        if ch.isalpha():
            result += ch
        elif ch == "*":
            result = result[:-1]
        elif ch == "#":
            result = result + result
        else:
            result = result[::-1]
    return result
`
