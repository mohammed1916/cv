export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with s.')
  const { s } = data
  if (typeof s !== 'string' || s.length < 1 || s.length > 100 || !/^[a-z]+$/.test(s)) throw new Error('s is 1 to 100 lowercase letters.')
  return { s }
}

export function buildTrace(input) {
  let text = ''
  const frames = [{ phase: 'start', activeLine: L('set text to empty'), index: -1, text, message: 'The keyboard starts with an empty screen.' }]
  for (let i = 0; i < input.s.length; i++) {
    const ch = input.s[i]
    if (ch === 'i') {
      text = [...text].reverse().join('')
      frames.push({ phase: 'reverse', activeLine: L('if ch is i'), index: i, text, message: `Typing i reverses the screen to ${text}.` })
    } else {
      text += ch
      frames.push({ phase: 'type', activeLine: L('otherwise add ch'), index: i, text, message: `Typing ${ch} appends it: ${text}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return text'), index: -1, text, message: `The screen shows ${text}.` })
  return { input, result: text, frames }
}

export const code = `type the faulty keyboard text
  set text to empty
  for each character ch of s in order
    if ch is i then reverse text
    otherwise add ch to the end of text
  return text`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def faulty_keyboard(s):
    text = ""
    for ch in s:
        if ch == "i":
            text = text[::-1]
        else:
            text += ch
    return text
`
