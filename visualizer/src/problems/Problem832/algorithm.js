export function parseInput(text) {
  const image = JSON.parse(text)
  if (!Array.isArray(image) || image.length < 1 || image.length > 20 || image.some(row => !Array.isArray(row) || row.length !== image.length || row.some(v => v !== 0 && v !== 1))) {
    throw new Error('Enter a square binary image of up to 20 by 20 cells.')
  }
  return image
}

const JS_LINES = [
  'function flipAndInvertImage(image) {',
  '  const n = image[0].length',
  '  for (const row of image) {',
  '    let i = 0, j = n - 1 // two pointers walk inwards from both ends',
  '    while (i < j) {',
  '      const left = row[i]',
  '      row[i] = 1 - row[j] // flip: swap the ends and invert each one',
  '      row[j] = 1 - left',
  '      i++',
  '      j--',
  '    }',
  '    if (i === j) row[i] = 1 - row[i] // the middle cell is inverted alone',
  '  }',
  '  return image',
  '}',
]
const PY_LINES = [
  'def flip_and_invert_image(image):',
  '    n = len(image[0])',
  '    for row in image:',
  '        i, j = 0, n - 1',
  '        while i < j:',
  '            left = row[i]',
  '            row[i] = 1 - row[j]',
  '            row[j] = 1 - left',
  '            i += 1',
  '            j -= 1',
  '        if i == j:',
  '            row[i] = 1 - row[i]',
  '    return image',
]
const L = s => JS_LINES.findIndex(t => t.includes(s)) + 1
const P = s => PY_LINES.findIndex(t => t.includes(s)) + 1

export const code = JS_LINES.map((text, index) => ({ line: index + 1, text }))
export const python = PY_LINES.join('\n')

// Reversing and inverting in one pass: the two pointers swap the ends, and each end is inverted as it moves.
export function buildTrace(image) {
  const n = image[0].length
  const grid = image.map(row => [...row])
  const frames = [{ phase: 'start', row: -1, cells: [], grid: grid.map(r => [...r]), activeLine: L('const n = image'), pythonLine: P('n = len(image[0])'), message: 'Each row is reversed and then inverted: a 1 becomes 0 and a 0 becomes 1.' }]
  for (let r = 0; r < n; r++) {
    const row = grid[r]
    let i = 0, j = n - 1
    while (i < j) {
      const left = row[i]
      row[i] = 1 - row[j]
      row[j] = 1 - left
      frames.push({ phase: 'swap', row: r, cells: [i, j], grid: grid.map(x => [...x]), activeLine: L('row[i] = 1 - row[j]'), pythonLine: P('row[i] = 1 - row[j]'), message: `Row ${r}: swap ends ${i} and ${j}, inverting both.` })
      i++
      j--
    }
    if (i === j) {
      row[i] = 1 - row[i]
      frames.push({ phase: 'middle', row: r, cells: [i], grid: grid.map(x => [...x]), activeLine: L('the middle cell is inverted'), pythonLine: P('row[i] = 1 - row[i]'), message: `Row ${r}: the middle cell ${i} is inverted alone.` })
    }
  }
  frames.push({ phase: 'done', row: n - 1, cells: [], grid: grid.map(r => [...r]), result: grid, activeLine: L('return image'), pythonLine: P('return image'), message: 'Every row is flipped and inverted.' })
  return { input: image, result: grid, frames }
}
