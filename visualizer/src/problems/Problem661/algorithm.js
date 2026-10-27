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

export const code = `create an output grid with the same shape as img
for each cell (r, c):
  add the values of existing cells in its 3 by 3 block, counting itself, and count them
  set output[r][c] to floor(sum / count)
return output`.split('\n').map((text, index) => ({ line: index + 1, text }))

// Scan trace: activeLine 1 (setup), 4 (update per cell), 5 (return).
export const LINE_MAP = { 1: 1, 3: 3, 4: 4, 5: 5 }

export const familyLine = frame => LINE_MAP[frame.activeLine] ?? frame.activeLine

export const python = `def image_smoother(img):
    rows = len(img)
    cols = len(img[0])
    output = [[0] * cols for _ in range(rows)]
    for r in range(rows):
        for c in range(cols):
            total = 0
            count = 0
            for dr in (-1, 0, 1):
                for dc in (-1, 0, 1):
                    rr = r + dr
                    cc = c + dc
                    if 0 <= rr < rows and 0 <= cc < cols:
                        total += img[rr][cc]
                        count += 1
            output[r][c] = total // count
    return output`
