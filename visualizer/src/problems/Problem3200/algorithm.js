export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with red and blue.')
  const { red, blue } = input
  if (![red, blue].every(v => Number.isInteger(v) && v >= 0 && v <= 100)) throw new Error('red and blue are integers from 0 to 100.')
  return { red, blue }
}

export function buildTrace({ red, blue }) {
  const frames = []
  let best = 0
  frames.push({ pythonLine: 2, phase: 'start', activeLine: L('best = 0'), first: null, height: 0, usedA: 0, usedB: 0, best, message: `Red ${red}, blue ${blue}.` })
  for (const [a, b] of [[red, blue], [blue, red]]) {
    const label = a === red ? 'red first' : 'blue first'
    let usedA = 0
    let usedB = 0
    let height = 0
    for (;;) {
      const row = height + 1
      const addA = row % 2 === 1 ? Math.floor((row + 1) / 2) : Math.floor(row / 2)
      const addB = Math.floor(row / 2)
      if (usedA + addA > a || usedB + addB > b) {
        frames.push({ pythonLine: 12, phase: 'stop', activeLine: L('otherwise stop'), first: label, height, usedA, usedB, best, message: `Row ${row} needs too many balls when ${label}.` })
        break
      }
      usedA += addA
      usedB += addB
      height += 1
      frames.push({ pythonLine: 15, phase: 'row', activeLine: L('if the balls needed so far fit both colors'), first: label, height, usedA, usedB, best, message: `Row ${row} fits when ${label}; height ${height}.` })
    }
    best = Math.max(best, height)
  }
  frames.push({ pythonLine: 17, phase: 'done', activeLine: L('return best'), first: null, height: best, usedA: null, usedB: null, best, message: `Maximum height ${best}.` })
  return { input: { red, blue }, result: best, frames }
}

export const code = `maximum height of a triangle with alternating colors
  best = 0
  for each starting color
    rows are built one at a time; row r has r balls
    odd rows start with the starting color, even rows start with the other
    if the balls needed so far fit both colors, the row fits and height grows
    otherwise stop
    best = maximum of best and the height reached
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_height(red, blue):
    best = 0
    for a, b in ((red, blue), (blue, red)):
        used_a = 0
        used_b = 0
        height = 0
        while True:
            row = height + 1
            add_a = (row + 1) // 2 if row % 2 == 1 else row // 2
            add_b = row // 2
            if used_a + add_a > a or used_b + add_b > b:
                break
            used_a += add_a
            used_b += add_b
            height += 1
        best = max(best, height)
    return best
`
