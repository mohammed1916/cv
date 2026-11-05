export function parseInput(text) {
  const data = JSON.parse(text)
  const { image, sr, sc, color } = data ?? {}
  if (!Array.isArray(image) || image.length < 1 || image.length > 8 || image.some(r => !Array.isArray(r) || r.length !== image[0].length || r.length < 1 || r.length > 8)) throw new Error('image must be a rectangular array of up to 8×8 integers.')
  if (image.flat().some(v => !Number.isInteger(v) || v < 0 || v > 65535)) throw new Error('Pixel values must be integers from 0 to 65,535.')
  if (!Number.isInteger(sr) || !Number.isInteger(sc) || sr < 0 || sc < 0 || sr >= image.length || sc >= image[0].length) throw new Error('The start pixel must lie inside the image.')
  if (!Number.isInteger(color) || color < 0 || color > 65535) throw new Error('color must be an integer from 0 to 65,535.')
  return { image, sr, sc, color }
}

const JS_LINES = [
  'function floodFill(image, sr, sc, color) {',
  '  const original = image[sr][sc]',
  '  if (original === color) return image // nothing to change',
  '  const stack = [[sr, sc]] // cells waiting to be painted',
  '  image[sr][sc] = color',
  '  while (stack.length > 0) {',
  '    const [r, c] = stack.pop() // take the next cell to inspect',
  '    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {',
  '      const nr = r + dr, nc = c + dc',
  '      const inside = nr >= 0 && nc >= 0 && nr < image.length && nc < image[0].length',
  '      if (inside && image[nr][nc] === original) { // neighbour has the old colour: paint it',
  '        image[nr][nc] = color',
  '        stack.push([nr, nc])',
  '      }',
  '    }',
  '  }',
  '  return image // return image',
  '}',
]
const PY_LINES = [
  'def flood_fill(image, sr, sc, color):',
  '    original = image[sr][sc]',
  '    if original == color:',
  '        return image',
  '    stack = [(sr, sc)]',
  '    image[sr][sc] = color',
  '    while stack:',
  '        r, c = stack.pop()',
  '        for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):',
  '            nr, nc = r + dr, c + dc',
  '            inside = 0 <= nr < len(image) and 0 <= nc < len(image[0])',
  '            if inside and image[nr][nc] == original:',
  '                image[nr][nc] = color',
  '                stack.append((nr, nc))',
  '    return image',
]
const L = s => JS_LINES.findIndex(t => t.includes(s)) + 1
const P = s => PY_LINES.findIndex(t => t.includes(s)) + 1

export const code = JS_LINES.map((text, index) => ({ line: index + 1, text }))
export const python = PY_LINES.join('\n')

// An explicit stack replaces recursion, so the frontier is visible: each painted cell waits there until its neighbours are checked.
export function buildTrace({ image, sr, sc, color }) {
  const grid = image.map(row => [...row])
  const original = grid[sr][sc]
  const frames = [{ phase: 'start', cell: [sr, sc], painted: [], stack: [], grid: grid.map(r => [...r]), activeLine: L('const original'), pythonLine: P('original = image'), message: `The start pixel has colour ${original}; every connected pixel of that colour is repainted.` }]
  if (original === color) {
    frames.push({ phase: 'done', cell: [sr, sc], painted: [], stack: [], grid: grid.map(r => [...r]), result: grid, activeLine: L('nothing to change'), pythonLine: P('return image'), message: `The colour is already ${color}, so the image is unchanged.` })
    return { input: { image, sr, sc, color }, result: grid, frames }
  }
  const stack = [[sr, sc]]
  const painted = [[sr, sc]]
  grid[sr][sc] = color
  frames.push({ phase: 'paint', cell: [sr, sc], painted: [...painted], stack: stack.map(c => [...c]), grid: grid.map(r => [...r]), activeLine: L('image[sr][sc] = color'), pythonLine: P('image[sr][sc] = color'), message: `Paint the start pixel ${color}.` })
  while (stack.length > 0) {
    const [r, c] = stack.pop()
    frames.push({ phase: 'visit', cell: [r, c], painted: [...painted], stack: stack.map(x => [...x]), grid: grid.map(row => [...row]), activeLine: L('const [r, c] = stack.pop()'), pythonLine: P('r, c = stack.pop()'), message: `Look at the neighbours of (${r}, ${c}).` })
    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const nr = r + dr, nc = c + dc
      const inside = nr >= 0 && nc >= 0 && nr < grid.length && nc < grid[0].length
      if (inside && grid[nr][nc] === original) {
        grid[nr][nc] = color
        stack.push([nr, nc])
        painted.push([nr, nc])
        frames.push({ phase: 'paint', cell: [nr, nc], painted: [...painted], stack: stack.map(x => [...x]), grid: grid.map(row => [...row]), activeLine: L('image[nr][nc] = color'), pythonLine: P('image[nr][nc]'), message: `(${nr}, ${nc}) had colour ${original} and touches the fill, so it becomes ${color} and joins the stack.` })
      }
    }
  }
  frames.push({ phase: 'done', cell: null, painted: [...painted], stack: [], grid: grid.map(r => [...r]), result: grid, activeLine: L('return image'), pythonLine: P('return image'), message: `${painted.length} pixel${painted.length === 1 ? '' : 's'} repainted.` })
  return { input: { image, sr, sc, color }, result: grid, frames }
}
