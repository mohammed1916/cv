export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.cells) || obj.cells.length !== 8 || obj.cells.some(v => v !== 0 && v !== 1))
    throw new Error('Enter a JSON object like {"cells":[0,1,0,1,1,0,0,1],"n":7} with exactly 8 cells (0 or 1).')
  if (!Number.isInteger(obj.n) || obj.n < 0 || obj.n > 1000000000) throw new Error('n must be an integer between 0 and 1,000,000,000.')
  return { cells: obj.cells, n: obj.n }
}

const nextDay = cells => cells.map((_, i) => (i === 0 || i === 7 ? 0 : cells[i - 1] === cells[i + 1] ? 1 : 0))

export function buildTrace({ cells: start, n: total }) {
  let cells = [...start]
  let n = total
  const seen = new Map()
  let day = 0
  const frames = [{ phase: 'start', activeLine: L('create an empty map'), day, cells: [...cells], n, message: `${total} day(s) requested. Only 2^6 = 64 interior states exist, so the sequence must start repeating long before day ${total}.` }]
  while (day < n) {
    const key = cells.join('')
    if (seen.has(key)) {
      const cycle = day - seen.get(key)
      const oldN = n
      n = day + (n - day) % cycle
      frames.push({ phase: 'cycle', activeLine: L('set n to day plus'), day, cells: [...cells], n, cycle, message: `State ${key} was already seen on day ${seen.get(key)}: the cycle length is ${cycle}. Only (${oldN} - ${day}) mod ${cycle} = ${n - day} more day(s) are needed.` })
      if (day >= n) break
    }
    seen.set(key, day)
    cells = nextDay(cells)
    day++
    frames.push({ phase: 'step', activeLine: L('set cells to the next'), day, cells: [...cells], n, message: `Day ${day}: each interior cell becomes 1 iff both neighbours were equal; the end cells have only one neighbour so become 0.` })
  }
  frames.push({ phase: 'done', activeLine: L('return cells'), day, cells: [...cells], n, message: `State after ${total} day(s): [${cells.join(', ')}].` })
  return { input: { cells: [...start], n: total }, result: cells, frames }
}

export const code = `prisonAfterNDays(cells, n) returns the cells after n days
  create an empty map seen, and set day to 0
  while day is less than n
    if the current cells are already in seen, then
      set cycle to day minus seen[cells]
      set n to day plus (n minus day) modulo cycle
      if day is at least n, then leave the loop
    set seen[cells] to day
    set cells to the next day's state, and add 1 to day
  return cells`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def prison_after_n_days(cells, n):
    seen = {}
    day = 0
    while day < n:
        key = tuple(cells)
        if key in seen:
            n = day + (n - day) % (day - seen[key])
            if day >= n:
                break
        seen[key] = day
        cells = [0] + [int(cells[i - 1] == cells[i + 1]) for i in range(1, 7)] + [0]
        day += 1
    return cells`
