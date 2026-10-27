export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with s.')
  const { s } = data
  if (typeof s !== 'string' || s.length < 1 || s.length > 30 || !/^[01]+$/.test(s)) throw new Error('s is a binary string of 1 to 30 characters.')
  return { s }
}

export function buildTrace(input) {
  let s = input.s
  let seconds = 0
  const frames = [{ phase: 'start', activeLine: L('set seconds to 0'), seconds, s, message: `Start with ${s}.` }]
  while (s.includes('01')) {
    // Two 01 pairs never share a character, so replacing them all at once is the same as one pass left to right.
    s = s.replace(/01/g, '10')
    seconds += 1
    frames.push({ phase: 'swap', activeLine: L('replace every 01'), seconds, s, message: `After second ${seconds}: ${s}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return seconds'), seconds, s, message: `The string has no 01 left after ${seconds} seconds.` })
  return { input, result: seconds, frames }
}

export const code = `count the seconds needed to sort the string
  set seconds to 0
  while the string still contains 01
    replace every 01 with 10 at the same time
    add 1 to seconds
  return seconds`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def seconds_to_rearrange(s):
    seconds = 0
    while "01" in s:
        s = s.replace("01", "10")
        seconds += 1
    return seconds
`
