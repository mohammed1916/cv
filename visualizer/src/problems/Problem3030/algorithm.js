const MAX_SIDE = 6
const MAX_VALUE = 255

const grid = (rows, cols, value) => Array.from({ length: rows }, () => Array(cols).fill(value))
const copy = g => g.map(row => [...row])

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with image and threshold.')
  const { image, threshold } = input
  if (!Array.isArray(image) || image.length < 3 || image.length > MAX_SIDE) throw new Error('image has 3 to 6 rows.')
  const width = Array.isArray(image[0]) ? image[0].length : 0
  if (width < 3 || width > MAX_SIDE) throw new Error('each row has 3 to 6 columns.')
  for (const row of image) {
    if (!Array.isArray(row) || row.length !== width || !row.every(v => Number.isInteger(v) && v >= 0 && v <= MAX_VALUE)) {
      throw new Error('Every row has the same length and whole intensities from 0 to 255.')
    }
  }
  if (!Number.isInteger(threshold) || threshold < 0 || threshold > MAX_VALUE) throw new Error('threshold is a whole number from 0 to 255.')
  return { image: copy(image), threshold }
}

// Neighbour pairs inside the 3 by 3 window whose top left corner is (r, c).
function windowPairs(r, c) {
  const pairs = []
  for (let i = r; i < r + 3; i++) for (let j = c; j < c + 2; j++) pairs.push([[i, j], [i, j + 1]])
  for (let i = r; i < r + 2; i++) for (let j = c; j < c + 3; j++) pairs.push([[i, j], [i + 1, j]])
  return pairs
}

export function buildTrace({ image, threshold }) {
  const m = image.length
  const n = image[0].length
  const regionMean = grid(m - 2, n - 2, null)
  const total = grid(m, n, 0)
  const count = grid(m, n, 0)
  const result = grid(m, n, null)
  const frames = []

  const frame = (phase, activeLine, pythonLine, message, extra = {}) => ({
    phase,
    activeLine: L(activeLine),
    pythonLine: P(pythonLine),
    message,
    regionMean: copy(regionMean),
    total: copy(total),
    count: copy(count),
    result: copy(result),
    region: null,
    pair: null,
    sum: null,
    mean: null,
    cell: null,
    ...extra,
  })

  frames.push(frame('start', 'for each top left corner (r, c) of a window', 'for r in range(m - 2):',
    `Scan the ${(m - 2) * (n - 2)} possible 3 by 3 windows of this ${m} by ${n} image.`))

  for (let r = 0; r < m - 2; r++) {
    for (let c = 0; c < n - 2; c++) {
      frames.push(frame('window', 'for each top left corner (r, c) of a window', 'for c in range(n - 2):',
        `Test the window whose top left pixel is row ${r}, column ${c}.`, { region: [r, c] }))
      let valid = true
      for (const [a, b] of windowPairs(r, c)) {
        const diff = Math.abs(image[a[0]][a[1]] - image[b[0]][b[1]])
        const ok = diff <= threshold
        frames.push(frame('pair', 'if the two intensities differ by more than threshold', 'if abs(image[i][j] - image[i][j + 1]) > threshold:',
          ok ? `Difference ${diff} is within threshold ${threshold}.` : `Difference ${diff} is above threshold ${threshold}; this window is invalid.`,
          { region: [r, c], pair: { a, b, diff, ok } }))
        if (!ok) {
          valid = false
          break
        }
      }
      if (!valid) {
        frames.push(frame('reject', 'if not valid then skip this window', 'if not valid:',
          `Window at row ${r}, column ${c} is skipped; none of its pixels gain a mean from it.`, { region: [r, c] }))
        continue
      }
      let sum = 0
      for (let i = r; i < r + 3; i++) for (let j = c; j < c + 3; j++) sum += image[i][j]
      const mean = Math.floor(sum / 9)
      regionMean[r][c] = mean
      frames.push(frame('mean', 'set mean to floor of the window sum divided by 9', 'mean = window_sum // 9',
        `Window sum ${sum} floors to mean ${mean}.`, { region: [r, c], sum, mean }))
      for (let i = r; i < r + 3; i++) {
        for (let j = c; j < c + 3; j++) {
          total[i][j] += mean
          count[i][j] += 1
        }
      }
      frames.push(frame('cover', 'add mean to the total and count of its 9 pixels', 'total[i][j] += mean',
        `Mean ${mean} is added to the nine pixels of this window.`, { region: [r, c], sum, mean }))
    }
  }

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      const value = count[i][j] === 0 ? image[i][j] : Math.floor(total[i][j] / count[i][j])
      result[i][j] = value
      const message = count[i][j] === 0
        ? `Pixel row ${i}, column ${j} is covered by no valid window, so it keeps ${value}.`
        : `Pixel row ${i}, column ${j}: floor(${total[i][j]} / ${count[i][j]}) = ${value}.`
      frames.push(frame('pixel', 'for each pixel', 'for i in range(m):', message, { cell: [i, j] }))
    }
  }

  frames.push(frame('done', 'return the result grid', 'return result', 'Every pixel now holds its smoothed value.'))
  return { input: { image: copy(image), threshold }, result, frames }
}

// Frame lines are looked up by text, so a renamed or missing line fails loudly.
function lineIndex(lines, text, label) {
  const index = lines.findIndex(line => line.trim() === text || line.includes(text))
  if (index < 0) throw new Error(`Missing ${label} line: ${text}`)
  return index + 1
}
const L = text => lineIndex(code.map(c => c.text), text, 'pseudocode')
const P = text => lineIndex(python.split('\n'), text, 'python')

export const code = `build a total and count for every pixel
for each top left corner (r, c) of a window
  set valid to true
  for each horizontal and vertical neighbour pair in the window
    if the two intensities differ by more than threshold then set valid to false and stop
  if not valid then skip this window
  set mean to floor of the window sum divided by 9
  add mean to the total and count of its 9 pixels
for each pixel
  if count is zero keep the original intensity
  otherwise set it to floor of total divided by count
return the result grid`.split('\n').map((text, index) => ({ line: index + 1, text: text.trim() }))

export const python = `def grid_region_average(image, threshold):
    m = len(image)
    n = len(image[0])
    total = [[0] * n for _ in range(m)]
    count = [[0] * n for _ in range(m)]
    for r in range(m - 2):
        for c in range(n - 2):
            valid = True
            for i in range(r, r + 3):
                for j in range(c, c + 2):
                    if abs(image[i][j] - image[i][j + 1]) > threshold:
                        valid = False
            for i in range(r, r + 2):
                for j in range(c, c + 3):
                    if abs(image[i][j] - image[i + 1][j]) > threshold:
                        valid = False
            if not valid:
                continue
            window_sum = sum(image[i][j] for i in range(r, r + 3) for j in range(c, c + 3))
            mean = window_sum // 9
            for i in range(r, r + 3):
                for j in range(c, c + 3):
                    total[i][j] += mean
                    count[i][j] += 1
    result = []
    for i in range(m):
        row = []
        for j in range(n):
            if count[i][j] == 0:
                row.append(image[i][j])
            else:
                row.append(total[i][j] // count[i][j])
        result.append(row)
    return result
`
