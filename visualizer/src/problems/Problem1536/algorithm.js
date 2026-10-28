export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || Array.isArray(input) || typeof input !== 'object') throw new Error('Use an object with a grid key.')
  const { grid } = input
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > 8) throw new Error('grid needs 1 to 8 rows.')
  if (grid.some(row => !Array.isArray(row) || row.length !== grid.length)) throw new Error('The grid must be square.')
  if (grid.some(row => row.some(v => v !== 0 && v !== 1))) throw new Error('Grid cells are 0 or 1.')
  return { grid }
}

export function buildTrace(input) {
  const { grid } = input
  const n = grid.length
  const zeros = grid.map(row => {
    let count = 0
    for (let j = row.length - 1; j >= 0 && row[j] === 0; j--) count++
    return count
  })
  let ids = grid.map((_, i) => i)
  let swaps = 0
  const frames = [{ phase: 'start', activeLine: L('count the trailing zeros'), row: -1, need: 0, order: ids.slice(), swaps, message: `Row i needs at least ${n - 1} - i trailing zeros; count what each row has.` }]
  for (let i = 0; i < n; i++) {
    const need = n - 1 - i
    let k = i
    while (k < n && zeros[ids[k]] < need) k++
    if (k === n) {
      frames.push({ phase: 'stuck', activeLine: L('if no row at or below'), row: i, need, order: ids.slice(), swaps, message: `Position ${i} needs ${need} trailing zeros and no row below has enough, so it is impossible.` })
      return { input, result: -1, frames }
    }
    while (k > i) {
      ;[ids[k - 1], ids[k]] = [ids[k], ids[k - 1]]
      k--
      swaps++
    }
    frames.push({ phase: 'place', activeLine: L('bubble that row up'), row: i, need, order: ids.slice(), swaps, message: `Position ${i} takes row ${ids[i]} with ${zeros[ids[i]]} trailing zeros; ${swaps} swaps so far.` })
  }
  ids = ids.slice()
  frames.push({ phase: 'done', activeLine: L('return swaps'), row: -1, need: 0, order: ids, swaps, message: `Minimum adjacent swaps: ${swaps}.` })
  return { input, result: swaps, frames }
}

export const code = `minimum adjacent row swaps to arrange a binary grid:
  count the trailing zeros of each row
  set swaps to 0
  for each row position i from top to bottom
    set need to the number of zeros that position i requires
    find the first row at or below position i with enough trailing zeros
    if no row at or below i has enough then return -1
    bubble that row up to position i, one adjacent swap at a time
    add each swap to swaps
  return swaps`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimum_swaps(grid):
    n = len(grid)
    zeros = []
    for row in grid:
        count = 0
        for value in reversed(row):
            if value != 0:
                break
            count += 1
        zeros.append(count)
    ids = list(range(n))
    swaps = 0
    for i in range(n):
        need = n - 1 - i
        k = i
        while k < n and zeros[ids[k]] < need:
            k += 1
        if k == n:
            return -1
        while k > i:
            ids[k - 1], ids[k] = ids[k], ids[k - 1]
            k -= 1
            swaps += 1
    return swaps
`
