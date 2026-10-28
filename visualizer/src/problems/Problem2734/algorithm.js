export function parseInput(text) {
  const s = JSON.parse(text)
  if (typeof s !== 'string' || s.length < 1 || s.length > 20) throw new Error('Use a JSON string of 1 to 20 lowercase letters.')
  if (!/^[a-z]+$/.test(s)) throw new Error('Use only lowercase letters a to z.')
  return s
}

export function buildTrace(s) {
  const chars = [...s]
  const n = chars.length
  const frames = [{ phase: 'start', activeLine: L('if every letter is a'), start: -1, end: -1, text: s, message: 'Look for the first letter that is not a. The shift has to begin there.' }]
  let start = 0
  while (start < n && chars[start] === 'a') start++
  if (start === n) {
    chars[n - 1] = 'z'
    const text = chars.join('')
    frames.push({ phase: 'wrap', activeLine: L('change the last letter'), start: n - 1, end: n, text, message: `Every letter is a, so the last one becomes z: ${text}.` })
    return { input: s, result: text, frames }
  }
  frames.push({ phase: 'find', activeLine: L('set start to'), start, end: start, text: s, message: `The first letter that is not a is ${chars[start]} at position ${start}.` })
  let end = start
  while (end < n && chars[end] !== 'a') end++
  frames.push({ phase: 'extend', activeLine: L('set end to'), start, end, text: s, message: `Extend the substring up to position ${end - 1}, stopping before the next a.` })
  for (let k = start; k < end; k++) chars[k] = String.fromCharCode(chars[k].charCodeAt(0) - 1)
  const text = chars.join('')
  frames.push({ phase: 'shift', activeLine: L('shift each letter'), start, end, text, message: `Shift positions ${start} to ${end - 1} back one letter: ${text}.` })
  frames.push({ phase: 'done', activeLine: L('return the result'), start, end, text, message: `Smallest string: ${text}.` })
  return { input: s, result: text, frames }
}

export const code = `smallest string after one substring shift:
  if every letter is a then
    change the last letter to z and return it
  set start to the first position whose letter is not a
  set end to the first position after start whose letter is a, or the length
  shift each letter from start up to end back one letter
  return the result`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def smallest_after_shift(s):
    chars = list(s)
    n = len(chars)
    start = 0
    while start < n and chars[start] == 'a':
        start += 1
    if start == n:
        chars[n - 1] = 'z'
        return ''.join(chars)
    end = start
    while end < n and chars[end] != 'a':
        end += 1
    for k in range(start, end):
        chars[k] = chr(ord(chars[k]) - 1)
    return ''.join(chars)
`
