// LeetCode 3200: row r of the triangle has r balls, all of one colour, and adjacent rows
// must differ in colour. Try each colour for row 1; the rows then alternate. Each row
// spends its r balls from one colour's remaining count, and the height grows while it fits.

export const code = `function maxHeight(red, blue) {
  let best = 0
  for (const start of ['red', 'blue']) {
    const left = { red, blue }
    let height = 0
    for (;;) {
      const row = height + 1
      const color = row % 2 === 1 ? start : (start === 'red' ? 'blue' : 'red')
      if (left[color] < row) break
      left[color] -= row
      height++
    }
    best = Math.max(best, height)
  }
  return best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing code line: ${s}`)
  return index + 1
}

export const python = `def max_height(red, blue):
    best = 0
    for start in ("red", "blue"):
        left = {"red": red, "blue": blue}
        height = 0
        while True:
            row = height + 1
            color = start if row % 2 == 1 else ("blue" if start == "red" else "red")
            if left[color] < row:
                break
            left[color] -= row
            height += 1
        best = max(best, height)
    return best
`
const PY = s => {
  const index = python.split('\n').findIndex(c => c.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}

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
  frames.push({ pythonLine: PY('best = 0'), phase: 'start', activeLine: L('let best = 0'), first: null, height: 0, usedA: 0, usedB: 0, best, message: `Red ${red}, blue ${blue}. Each row is one colour, and adjacent rows differ.` })
  for (const start of ['red', 'blue']) {
    const left = { red, blue }
    const label = start === 'red' ? 'red first' : 'blue first'
    let height = 0
    for (;;) {
      const row = height + 1
      const color = row % 2 === 1 ? start : (start === 'red' ? 'blue' : 'red')
      if (left[color] < row) {
        frames.push({ pythonLine: PY('break'), phase: 'stop', activeLine: L('if (left[color] < row)'), first: label, height, usedA: red - left.red, usedB: blue - left.blue, best, message: `Row ${row} needs ${row} ${color} balls but only ${left[color]} remain, so the triangle stops at height ${height} when ${label}.` })
        break
      }
      left[color] -= row
      height++
      frames.push({ pythonLine: PY('left[color] -= row'), phase: 'row', activeLine: L('left[color] -= row'), first: label, height, usedA: red - left.red, usedB: blue - left.blue, best, message: `Row ${row} is all ${color}, using ${row} ${color} balls; height ${height} when ${label}.` })
    }
    best = Math.max(best, height)
  }
  frames.push({ pythonLine: PY('return best'), phase: 'done', activeLine: L('return best'), first: null, height: best, usedA: null, usedB: null, best, message: `Maximum height ${best}.` })
  return { input: { red, blue }, result: best, frames }
}
