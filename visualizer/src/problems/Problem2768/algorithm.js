export function parseInput(text) {
  const value = JSON.parse(text)
  if (!value || Array.isArray(value) || Object.keys(value).sort().join() !== 'coordinates,m,n') throw new Error('Use an object with exactly the keys "m", "n" and "coordinates".')
  const { m, n, coordinates } = value
  if (!Number.isInteger(m) || m < 2 || m > 8 || !Number.isInteger(n) || n < 2 || n > 8) throw new Error('m and n are integers from 2 to 8.')
  if (!Array.isArray(coordinates) || coordinates.length < 1 || coordinates.length > 12) throw new Error('Use 1 to 12 black cells.')
  const seen = new Set()
  for (const cell of coordinates) {
    if (!Array.isArray(cell) || cell.length !== 2 || !Number.isInteger(cell[0]) || !Number.isInteger(cell[1])) throw new Error('Each cell is [row, column].')
    if (cell[0] < 0 || cell[0] >= m || cell[1] < 0 || cell[1] >= n) throw new Error(`Cell [${cell}] is outside the ${m} by ${n} grid.`)
    if (seen.has(`${cell}`)) throw new Error('Black cells must be distinct.')
    seen.add(`${cell}`)
  }
  return { m, n, coordinates }
}

export function buildTrace({ m, n, coordinates }) {
  const frames = [{ phase: 'start', activeLine: L('set block counts to an empty map'), cell: null, state: { blocks: 0 }, message: 'Each black cell belongs to up to four 2 by 2 blocks. Count how many black cells each block holds.' }]
  const counts = new Map()
  coordinates.forEach(([row, col]) => {
    const touched = []
    for (const top of [row - 1, row]) {
      for (const left of [col - 1, col]) {
        if (top >= 0 && top <= m - 2 && left >= 0 && left <= n - 2) {
          const key = `${top},${left}`
          counts.set(key, (counts.get(key) ?? 0) + 1)
          touched.push(key)
        }
      }
    }
    frames.push({ phase: 'cell', activeLine: L('for each 2 by 2 block that contains the cell'), cell: [row, col], state: { cell: `[${row}, ${col}]`, blocksTouched: touched.length, blocks: counts.size }, message: `Black cell [${row}, ${col}] is in ${touched.length} in-grid blocks. ${counts.size} blocks now hold at least one black cell.` })
  })
  const answer = [0, 0, 0, 0, 0]
  for (const count of counts.values()) answer[count] += 1
  answer[0] = (m - 1) * (n - 1) - counts.size
  frames.push({ phase: 'done', activeLine: L('return answer'), cell: null, state: { answer: answer.join(', ') }, message: `Return [${answer.join(', ')}].` })
  const matrix = Array.from({ length: m }, () => Array(n).fill(0))
  for (const [row, col] of coordinates) matrix[row][col] = 1
  return { input: { m, n, coordinates }, result: answer, matrix, frames }
}

export const code = `count blocks by number of black cells
  set block counts to an empty map
  for each black cell at (row, col)
    for each 2 by 2 block that contains the cell
      if the block lies inside the grid then add 1 to its count
  set answer to five zeros
  for each count in block counts
    add 1 to answer at that count
  set answer[0] to the total blocks minus the number of blocks in block counts
  return answer`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_black_blocks(m, n, coordinates):
    block_counts = {}
    for row, col in coordinates:
        for top in (row - 1, row):
            for left in (col - 1, col):
                if 0 <= top <= m - 2 and 0 <= left <= n - 2:
                    key = (top, left)
                    block_counts[key] = block_counts.get(key, 0) + 1
    answer = [0] * 5
    for count in block_counts.values():
        answer[count] += 1
    answer[0] = (m - 1) * (n - 1) - len(block_counts)
    return answer
`
