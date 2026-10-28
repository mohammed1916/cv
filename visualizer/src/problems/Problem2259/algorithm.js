export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).sort().join() !== 'digit,number') throw new Error('Use a JSON object with exactly the keys number and digit.')
  const { number, digit } = input
  if (typeof number !== 'string' || number.length < 2 || number.length > 30) throw new Error('number must be a string of 2 to 30 digits.')
  if (!/^[1-9][0-9]*$/.test(number)) throw new Error('number must be digits with no leading zero.')
  if (typeof digit !== 'string' || !/^[0-9]$/.test(digit)) throw new Error('digit must be a single character from 0 to 9.')
  if (!number.includes(digit)) throw new Error('digit must occur in number.')
  return { number, digit }
}

export function buildTrace({ number, digit }) {
  let best = null
  const frames = [{ phase: 'start', activeLine: L('set best to nothing'), position: -1, candidate: '', best: '', message: `Try removing each ${digit} from ${number}.` }]
  for (let i = 0; i < number.length; i++) {
    if (number[i] !== digit) continue
    const candidate = number.slice(0, i) + number.slice(i + 1)
    if (best === null || candidate > best) best = candidate
    frames.push({ phase: 'candidate', activeLine: L('let candidate be'), position: i, candidate, best, message: `Removing the ${digit} at position ${i} gives ${candidate}. Best so far: ${best}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return best'), position: -1, candidate: '', best, message: `Largest result: ${best}.` })
  return { input: { number, digit }, result: best, frames }
}

export const code = `number with one digit removed, largest:
  set best to nothing
  for each position i in number
    if the digit at i is the chosen digit then
      let candidate be number with position i removed
      if best is nothing or candidate is larger than best then
        set best to candidate
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def remove_digit(number, digit):
    best = None
    for i, ch in enumerate(number):
        if ch == digit:
            candidate = number[:i] + number[i + 1:]
            if best is None or candidate > best:
                best = candidate
    return best
`
