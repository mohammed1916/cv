export function parseInput(text) {
  const data = JSON.parse(text)
  const { image, sr, sc, color } = data ?? {}
  if (!Array.isArray(image) || image.length < 1 || image.length > 8 || image.some(r => !Array.isArray(r) || r.length !== image[0].length || r.length < 1 || r.length > 8)) throw new Error('image must be a rectangular array of up to 8×8 integers.')
  if (image.flat().some(v => !Number.isInteger(v) || v < 0 || v > 65535)) throw new Error('Pixel values must be integers from 0 to 65,535.')
  if (!Number.isInteger(sr) || !Number.isInteger(sc) || sr < 0 || sc < 0 || sr >= image.length || sc >= image[0].length) throw new Error('The start pixel must lie inside the image.')
  if (!Number.isInteger(color) || color < 0 || color > 65535) throw new Error('color must be an integer from 0 to 65,535.')
  return { image, sr, sc, color }
}

// Breadth-first from the start pixel over pixels that share its original colour, repainting as they are reached.
export function buildTrace({ image, sr, sc, color }) {
  const m = image.length, n = image[0].length
  const out = image.map(r => [...r])
  const original = image[sr][sc]
  const frames = [{ phase: 'start', current: [sr, sc], out: out.map(r => [...r]), activeLine: 2, message: `Repaint the connected region of ${original} from (${sr}, ${sc}).` }]
  if (original === color) {
    frames.push({ phase: 'done', current: null, out: out.map(r => [...r]), result: out, activeLine: 4, message: 'Same colour: nothing changes.' })
    return { input: { image, sr, sc, color }, result: out, frames }
  }
  const queue = [[sr, sc]]
  out[sr][sc] = color
  for (let q = 0; q < queue.length; q++) {
    const [r, c] = queue[q]
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr, nc = c + dc
      if (nr < 0 || nc < 0 || nr >= m || nc >= n || out[nr][nc] !== original) continue
      out[nr][nc] = color
      queue.push([nr, nc])
      frames.push({ phase: 'paint', current: [nr, nc], out: out.map(row => [...row]), activeLine: 9, message: `Paint (${nr}, ${nc}) to ${color}.` })
    }
  }
  frames.push({ phase: 'done', current: null, out: out.map(r => [...r]), result: out, activeLine: 12, message: `${queue.length} pixel${queue.length === 1 ? '' : 's'} repainted.` })
  return { input: { image, sr, sc, color }, result: out, frames }
}

export const code = `def floodFill(image, sr, sc, color):
    original = image[sr][sc]
    if original == color: return image
    queue = deque([(sr, sc)])
    image[sr][sc] = color
    while queue:
        r, c = queue.popleft()
        for nr, nc in neighbours(r, c):
            if in_bounds(image, nr, nc) and image[nr][nc] == original:
                image[nr][nc] = color
                queue.append((nr, nc))
    return image`.split('\n').map((text, index) => ({ line: index + 1, text }))
