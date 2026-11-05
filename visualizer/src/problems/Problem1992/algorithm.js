export const phases = [
  { id: 'start', label: 'Scan', description: 'Read the land row by row, left to right.' },
  { id: 'corner', label: 'Top-left corner', description: 'A farmland cell with no farmland above or to its left starts a new group.' },
  { id: 'extend', label: 'Extend to bottom-right', description: 'Walk right along the top row and down the left column to find the far corner.' },
  { id: 'done', label: 'Result', description: 'Return every group as [top, left, bottom, right].' },
]

export const code = `function findFarmland(land) {
  const groups = []
  for (let r = 0; r < land.length; r++) {
    for (let c = 0; c < land[0].length; c++) {
      const topLeft = land[r][c] === 1 && (r === 0 || land[r - 1][c] === 0) && (c === 0 || land[r][c - 1] === 0)
      if (!topLeft) continue
      let bottom = r
      while (bottom + 1 < land.length && land[bottom + 1][c] === 1) bottom++
      let right = c
      while (right + 1 < land[0].length && land[r][right + 1] === 1) right++
      groups.push([r, c, bottom, right])
    }
  }
  return groups
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def find_farmland(land):
    groups = []
    for r in range(len(land)):
        for c in range(len(land[0])):
            top_left = land[r][c] == 1 and (r == 0 or land[r - 1][c] == 0) and (c == 0 or land[r][c - 1] == 0)
            if not top_left:
                continue
            bottom = r
            while bottom + 1 < len(land) and land[bottom + 1][c] == 1:
                bottom += 1
            right = c
            while right + 1 < len(land[0]) and land[r][right + 1] == 1:
                right += 1
            groups.append([r, c, bottom, right])
    return groups
`

const C = fragment => code.findIndex(c => c.text.includes(fragment)) + 1
const P = fragment => python.split('\n').findIndex(line => line.includes(fragment)) + 1

export function parseInput(text) {
  let land
  try { land = JSON.parse(text) } catch { throw new Error('Use a JSON array of rows of 0s and 1s.') }
  if (!Array.isArray(land) || land.length < 1 || land.length > 12) throw new Error('land must have 1 to 12 rows here.')
  const width = land[0].length
  if (!land.every(row => Array.isArray(row) && row.length === width && width >= 1 && width <= 12 && row.every(v => v === 0 || v === 1))) {
    throw new Error('Every row must have the same length (1 to 12) and contain only 0 or 1.')
  }
  return land
}

export function buildTrace(land) {
  const frames = []
  const groups = []
  const rows = land.length, cols = land[0].length
  const add = (phase, c, p, message, cell, group) => frames.push({
    phase, activeLine: C(c), pythonLine: P(p), message,
    snapshot: { land, cell, groups: groups.slice(), group },
  })
  add('start', 'const groups', 'groups = []', 'Start scanning the land from the top-left corner.', null, null)
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const topLeft = land[r][c] === 1 && (r === 0 || land[r - 1][c] === 0) && (c === 0 || land[r][c - 1] === 0)
      if (!topLeft) continue
      let bottom = r
      while (bottom + 1 < rows && land[bottom + 1][c] === 1) bottom++
      let right = c
      while (right + 1 < cols && land[r][right + 1] === 1) right++
      const group = [r, c, bottom, right]
      add('corner', 'if (!topLeft)', 'if not top_left', `Cell (${r}, ${c}) has no farmland above or to its left: a new group starts here.`, [r, c], group)
      add('extend', 'let bottom = r', 'bottom = r', `The group reaches row ${bottom} and column ${right}.`, [bottom, right], group)
      groups.push(group)
    }
  }
  add('done', 'return groups', 'return groups', `${groups.length} farmland group(s) found.`, null, null)
  return { input: land, result: groups, frames }
}
