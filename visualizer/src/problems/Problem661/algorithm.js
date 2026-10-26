export function parseInput(text) {
  const img = JSON.parse(text)
  if (!Array.isArray(img) || img.length < 1 || img.length > 200 || img.some(r => !Array.isArray(r) || r.length !== img[0].length || r.length < 1 || r.length > 200)) throw new Error('Enter a rectangular JSON array of 1–200 rows and columns.')
  if (img.flat().some(v => !Number.isInteger(v) || v < 0 || v > 255)) throw new Error('Pixel values must be integers from 0 to 255.')
  return img
}

// Each output cell is the floor of the average of the (up to nine) cells around it.
export function buildTrace(img) {
  const m = img.length, n = img[0].length
  const out = Array.from({ length: m }, () => Array(n).fill(0))
  const frames = [{ phase: 'start', row: -1, col: -1, out: out.map(r => [...r]), activeLine: 2, message: 'Average each pixel with its neighbours inside the image.' }]
  for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) {
    let sum = 0, count = 0
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      const rr = r + dr, cc = c + dc
      if (rr >= 0 && rr < m && cc >= 0 && cc < n) { sum += img[rr][cc]; count++ }
    }
    out[r][c] = Math.floor(sum / count)
    frames.push({ phase: 'cell', row: r, col: c, sum, count, out: out.map(row => [...row]), activeLine: 6, message: `Cell (${r}, ${c}): ${sum} ÷ ${count} = ${out[r][c]}.` })
  }
  frames.push({ phase: 'done', row: m - 1, col: n - 1, out: out.map(r => [...r]), result: out, activeLine: 8, message: 'Smoothing complete.' })
  return { input: img, result: out, frames }
}

export const code = `def imageSmoother(img):
    m, n = len(img), len(img[0])
    out = [[0] * n for _ in range(m)]
    for r in range(m):
        for c in range(n):
            cells = [img[i][j] for i in range(max(0, r-1), min(m, r+2))
                               for j in range(max(0, c-1), min(n, c+2))]
            out[r][c] = sum(cells) // len(cells)
    return out`.split('\n').map((text, index) => ({ line: index + 1, text }))
