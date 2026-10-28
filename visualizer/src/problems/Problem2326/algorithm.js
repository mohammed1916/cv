export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Number.isInteger(input.m) || !Number.isInteger(input.n) || !Array.isArray(input.head)) throw new Error('Use {"m": rows, "n": columns, "head": [...]}.')
  if (input.m < 1 || input.m > 6 || input.n < 1 || input.n > 6) throw new Error('m and n are integers from 1 to 6.')
  if (input.head.length < 1 || input.head.length > 20) throw new Error('head has 1 to 20 values.')
  if (input.head.some(v => !Number.isInteger(v) || v < 0 || v > 99)) throw new Error('head values are integers from 0 to 99.')
  return { m: input.m, n: input.n, head: input.head }
}

const copy = matrix => matrix.map(row => [...row])

export function buildTrace({ m, n, head }) {
  const matrix = Array.from({ length: m }, () => Array(n).fill(-1))
  let top = 0
  let bottom = m - 1
  let left = 0
  let right = n - 1
  let k = 0
  const frames = [{ phase: 'start', activeLine: L('start with an m by n matrix'), cell: null, matrix: copy(matrix), message: `An ${m} by ${n} matrix of minus ones; the list is written clockwise from the outside.` }]
  while (top <= bottom && left <= right) {
    const cells = []
    for (let c = left; c <= right; c++) cells.push([top, c])
    for (let r = top + 1; r <= bottom; r++) cells.push([r, right])
    if (top < bottom) for (let c = right - 1; c >= left; c--) cells.push([bottom, c])
    if (left < right) for (let r = bottom - 1; r > top; r--) cells.push([r, left])
    for (const [r, c] of cells) {
      matrix[r][c] = k < head.length ? head[k] : -1
      k++
      frames.push({ phase: 'fill', activeLine: L('write the next head value'), cell: [r, c], matrix: copy(matrix), message: `Write ${matrix[r][c]} at row ${r}, column ${c}.` })
    }
    top++
    bottom--
    left++
    right--
    frames.push({ phase: 'ring', activeLine: L('move every boundary inward'), cell: null, matrix: copy(matrix), message: 'This ring is finished; move the boundaries inward.' })
  }
  frames.push({ phase: 'done', activeLine: L('return the matrix'), cell: null, matrix: copy(matrix), message: 'The spiral is complete.' })
  return { input: { m, n, head }, result: matrix, frames }
}

export const code = `spiral matrix filled from a list
  start with an m by n matrix of minus ones
  set the boundaries to the outer ring
  while the boundaries still enclose cells
    walk the top edge left to right, the right edge down, the bottom edge right to left, then the left edge up
    for each cell on that ring in that order
      write the next head value, or leave minus one when the list is used up
    move every boundary inward by one
  return the matrix`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def spiral_matrix(m, n, head):
    matrix = [[-1] * n for _ in range(m)]
    top, bottom, left, right = 0, m - 1, 0, n - 1
    k = 0
    while top <= bottom and left <= right:
        cells = [(top, c) for c in range(left, right + 1)]
        cells += [(r, right) for r in range(top + 1, bottom + 1)]
        if top < bottom:
            cells += [(bottom, c) for c in range(right - 1, left - 1, -1)]
        if left < right:
            cells += [(r, left) for r in range(bottom - 1, top, -1)]
        for r, c in cells:
            matrix[r][c] = head[k] if k < len(head) else -1
            k += 1
        top += 1
        bottom -= 1
        left += 1
        right -= 1
    return matrix
`
