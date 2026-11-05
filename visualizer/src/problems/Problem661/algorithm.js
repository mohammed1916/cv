export function parseInput(text) {
  const img = JSON.parse(text)
  if (!Array.isArray(img) || img.length < 1 || img.length > 200 || !img.every(r => Array.isArray(r) && r.length === img[0].length)) throw new Error('Enter a rectangular JSON array of rows, at most 200 × 200.')
  if (img[0].length < 1 || img[0].length > 200) throw new Error('Each row must hold 1–200 values.')
  if (img.some(r => r.some(v => !Number.isInteger(v) || v < 0 || v > 255))) throw new Error('Pixel values must be integers from 0 to 255.')
  return img
}

// Each cell becomes the floor of the average of itself and its existing neighbours (up to 9 cells).
export function buildTrace(img) {
  const rows = img.length, cols = img[0].length
  const out = img.map(r => r.map(() => 0))
  const frames = [{ phase: 'start', row: null, col: null, cells: [], out: out.map(r => [...r]), activeLine: L('const out = '), pythonLine: P('out = ['), message: 'Each cell averages its neighbourhood, clipped at the image edges.' }]
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cells = []
      let sum = 0
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const rr = r + dr, cc = c + dc
          if (rr >= 0 && rr < rows && cc >= 0 && cc < cols) { cells.push({ row: rr, col: cc }); sum += img[rr][cc] }
        }
      }
      out[r][c] = Math.floor(sum / cells.length)
      frames.push({ phase: 'cell', row: r, col: c, cells, out: out.map(row => [...row]), activeLine: L('out[r][c] = '), pythonLine: P('out[r][c] ='), message: `Cell (${r}, ${c}): ${cells.length} neighbours, sum ${sum}, floor average ${out[r][c]}.` })
    }
  }
  frames.push({ phase: 'done', row: null, col: null, cells: [], out: out.map(r => [...r]), result: out, activeLine: L('return out'), pythonLine: P('return out'), message: 'The whole image is smoothed.' })
  return { input: img, result: out, frames }
}

const SOURCE = `function imageSmoother(img) {
  const rows = img.length
  const cols = img[0].length
  const out = img.map(row => row.map(() => 0))
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let sum = 0
      let count = 0
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const rr = r + dr
          const cc = c + dc
          if (rr >= 0 && rr < rows && cc >= 0 && cc < cols) {
            sum += img[rr][cc]
            count++
          }
        }
      }
      out[r][c] = Math.floor(sum / count)
    }
  }
  return out
}`
export const code = SOURCE.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def image_smoother(img):
    rows, cols = len(img), len(img[0])
    out = [[0] * cols for _ in range(rows)]
    for r in range(rows):
        for c in range(cols):
            total = count = 0
            for rr in range(max(0, r - 1), min(rows, r + 2)):
                for cc in range(max(0, c - 1), min(cols, c + 2)):
                    total += img[rr][cc]
                    count += 1
            out[r][c] = total // count
    return out`
const P = s => python.split('\n').findIndex(t => t.includes(s)) + 1
