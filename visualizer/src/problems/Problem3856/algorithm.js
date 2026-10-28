export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || Array.isArray(input) || typeof input !== 'object') throw new Error('Use an object with an s key.')
  const { s } = input
  if (typeof s !== 'string' || s.length < 1 || s.length > 20 || !/^[a-z]+$/.test(s)) throw new Error('s is 1 to 20 lowercase letters.')
  return { s }
}

export function buildTrace(input) {
  const { s } = input
  let end = s.length
  const frames = [{ phase: 'start', activeLine: L('set end to the length of s'), index: end, end, message: `Start at the end of "${s}".` }]
  while (end > 0 && 'aeiou'.includes(s[end - 1])) {
    end -= 1
    frames.push({ phase: 'trim', activeLine: L('move end back by one'), index: end, end, message: `"${s[end]}" is a trailing vowel; move the end back.` })
  }
  const result = s.slice(0, end)
  frames.push({ phase: 'done', activeLine: L('return the first end characters'), index: end, end, message: `Result: "${result}".` })
  return { input, result, frames }
}

export const code = `remove trailing vowels:
  set end to the length of s
  while end is above 0 and the character before end is a vowel
    move end back by one
  return the first end characters of s`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def trim_trailing_vowels(s):
    end = len(s)
    while end > 0 and s[end - 1] in 'aeiou':
        end -= 1
    return s[:end]
`
