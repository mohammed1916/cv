export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use a JSON object with minutes.')
  const { minutes } = input
  if (!Number.isInteger(minutes) || minutes < 1 || minutes > 200) throw new Error('minutes must be an integer from 1 to 200.')
  return { minutes }
}

export function buildTrace({ minutes }) {
  let count = 1
  const frames = [{ phase: 'start', activeLine: L('set count to 1'), minute: 1, added: 1, count, message: 'After the first minute, one cell is colored.' }]
  for (let minute = 2; minute <= minutes; minute++) {
    const added = 4 * (minute - 1)
    count += added
    frames.push({ phase: 'ring', activeLine: L('set added to 4 times'), minute, added, count, message: `Minute ${minute} colors a new ring of ${added} cells.` })
  }
  frames.push({ phase: 'done', activeLine: L('return count'), minute: minutes, added: 0, count, message: `After ${minutes} minutes, ${count} cells are colored.` })
  return { input: { minutes }, result: count, frames }
}

export const code = `count the colored cells after a number of minutes
read the number of minutes from the input
set count to 1 for the first minute
for each minute from 2 to the input do
  set added to 4 times one less than the minute
  add added to count, which is the new ring of cells
return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_colored_cells(minutes):
    count = 1
    for minute in range(2, minutes + 1):
        count += 4 * (minute - 1)
    return count
`
