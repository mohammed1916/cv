export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.grid)) throw new Error('Use a JSON object with a "grid" array of rows.')
  const { grid } = obj
  if (grid.length < 1 || grid.length > 6) throw new Error('grid must have 1 to 6 rows for this visualization.')
  if (grid.some(row => !Array.isArray(row) || row.length < 1)) throw new Error('Every row must be a non-empty array.')
  if (grid.reduce((sum, row) => sum + row.length, 0) > 30) throw new Error('grid may have at most 30 values in total for this visualization.')
  const width = grid[0].length
  if (grid.some(row => row.length !== width)) throw new Error('Every row must have the same length.')
  if (grid.some(row => row.some(v => !Number.isInteger(v) || v < 1 || v > 100000))) throw new Error('Each value must be an integer from 1 to 100000.')
  return { grid }
}

// A row is satisfied by a mask when one of its values uses only bits set in the mask.
const fits = (value, mask) => (value & ~mask) === 0

export function buildTrace({ grid }) {
  const top = Math.max(...grid.flat()).toString(2).length
  const limit = (2 ** top) - 1
  let answer = limit
  const frames = [{ phase: 'start', activeLine: L('set limit'), bit: null, candidate: null, answer, message: `Start with all ${top} bits set, which every value fits inside.` }]
  for (let bit = top - 1; bit >= 0; bit--) {
    const candidate = answer & ~(1 << bit)
    const ok = grid.every(row => row.some(v => fits(v, candidate)))
    frames.push({ phase: ok ? 'clear' : 'keep', activeLine: L(ok ? 'set answer to candidate' : 'if every row'), bit, candidate, answer, message: `Try clearing bit ${bit}: ${ok ? 'every row still has a value that fits, so keep it cleared' : 'some row has no value that fits, so the bit stays'}.` })
    if (ok) answer = candidate
    frames[frames.length - 1].answer = answer
  }
  frames.push({ phase: 'done', activeLine: L('return answer'), bit: null, candidate: null, answer, message: `Minimum bitwise OR: ${answer}.` })
  return { input: { grid }, result: answer, frames }
}

export const code = `minimum bitwise or from grid (grid):
  set limit to all ones up to the highest bit in the grid
  set answer to limit
  for each bit from high to low
    set candidate to answer with this bit cleared
    if every row has a value whose bits are all inside candidate then
      set answer to candidate
  return answer

a value fits a mask when every bit of the value is also set in the mask`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_or_from_grid(grid):
    top = max(max(row) for row in grid).bit_length()
    answer = (1 << top) - 1
    for bit in range(top - 1, -1, -1):
        candidate = answer & ~(1 << bit)
        if all(any((v & ~candidate) == 0 for v in row) for row in grid):
            answer = candidate
    return answer
`
