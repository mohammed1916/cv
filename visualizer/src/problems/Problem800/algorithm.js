export function parseInput(text) {
  const color = JSON.parse(text)
  if (typeof color !== 'string' || !/^#[0-9a-f]{6}$/.test(color)) throw new Error('Enter a color as "#rrggbb" in lowercase hex.')
  return color
}

const NAMES = ['red', 'green', 'blue']

export function buildTrace(color) {
  const parts = [1, 3, 5].map(i => parseInt(color.slice(i, i + 2), 16))
  const frames = [{ phase: 'start', activeLine: L('split the color'), channel: null, value: null, digit: null, digits: [], message: `Split ${color} into red, green and blue. Each channel can only be a repeated hex digit, such as 11 or ee.` }]
  const digits = []
  parts.forEach((value, channel) => {
    // Shorthand values are 17 * d for d = 0..15; the nearest one wins (no two are equally close for integer channels).
    let digit = 0
    for (let d = 1; d < 16; d++) {
      if (Math.abs(value - d * 17) < Math.abs(value - digit * 17)) digit = d
    }
    digits.push(digit)
    frames.push({ phase: 'channel', activeLine: L('find the digit'), channel, value, digit, digits: [...digits], message: `${NAMES[channel]} ${value} is nearest to ${digit * 17}, written ${digit.toString(16)}${digit.toString(16)}.` })
  })
  const result = '#' + digits.map(d => d.toString(16) + d.toString(16)).join('')
  frames.push({ phase: 'done', activeLine: L('return'), channel: null, value: null, digit: null, digits: [...digits], message: `Result: ${result}.` })
  return { input: color, result, frames }
}

export const code = `split the color into the red, green and blue values
set out to "#"
for each channel value in red, green, blue
  find the digit d from 0 to 15 whose shorthand value 17 * d is closest to the channel
  append that digit twice in hex to out
return out`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def similar_rgb(color):
    parts = [int(color[i:i + 2], 16) for i in (1, 3, 5)]
    out = '#'
    for value in parts:
        best = min(range(16), key=lambda d: abs(value - d * 17))
        out += format(best, 'x') * 2
    return out
`
const L = s => code.findIndex(c => c.text.includes(s)) + 1
