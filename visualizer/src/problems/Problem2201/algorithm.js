// LeetCode 2201: Count Artifacts That Can Be Extracted.
// An artifact is rectangular and can be lifted only when every one of its cells has been dug. Mark the dug cells in a
// set, then test each artifact by counting how many of its cells are in the set.

const MAX_N = 6
const MAX_ARTIFACTS = 5

export function parseInput(text) {
  let spec
  try { spec = JSON.parse(text) } catch { throw new Error('Use JSON like {"n":3,"artifacts":[[0,0,0,1]],"dig":[[0,0],[0,1]]}.') }
  if (!spec || !Number.isInteger(spec.n) || !Array.isArray(spec.artifacts) || !Array.isArray(spec.dig)) throw new Error('Give n, artifacts and dig.')
  if (spec.n < 1 || spec.n > MAX_N) throw new Error(`n is from 1 to ${MAX_N} in this visualization.`)
  if (spec.artifacts.length < 1 || spec.artifacts.length > MAX_ARTIFACTS) throw new Error(`Use 1 to ${MAX_ARTIFACTS} artifacts.`)
  const inside = (r, c) => Number.isInteger(r) && Number.isInteger(c) && r >= 0 && c >= 0 && r < spec.n && c < spec.n
  for (const [r1, c1, r2, c2] of spec.artifacts) {
    if (![r1, c1, r2, c2].every(Number.isInteger) || !inside(r1, c1) || !inside(r2, c2) || r1 > r2 || c1 > c2) throw new Error('Each artifact is [r1, c1, r2, c2] with r1 <= r2 and c1 <= c2 inside the grid.')
  }
  for (const cell of spec.dig) if (!Array.isArray(cell) || cell.length !== 2 || !inside(cell[0], cell[1])) throw new Error('Each dug cell is [row, col] inside the grid.')
  return { n: spec.n, artifacts: spec.artifacts, dig: spec.dig }
}

export const code = `FUNCTION countArtifacts(n, artifacts, dig)
    dugSet ← set of "row,col" for every dug cell
    ans ← 0
    FOR each [r1, c1, r2, c2] in artifacts
        dugCount ← number of cells (r, c) in the rectangle with "r,c" in dugSet
        IF dugCount = (r2 - r1 + 1) * (c2 - c1 + 1) THEN
            ans ← ans + 1
    RETURN ans`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def count_artifacts(n, artifacts, dig):
    dug = {(r, c) for r, c in dig}
    ans = 0
    for r1, c1, r2, c2 in artifacts:
        dug_count = sum((r, c) in dug for r in range(r1, r2 + 1) for c in range(c1, c2 + 1))
        if dug_count == (r2 - r1 + 1) * (c2 - c1 + 1):
            ans += 1
    return ans
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Dug cells', description: 'Mark the cells that have been dug.' },
  { id: 'check', label: 'Check artifacts', description: 'An artifact lifts only when its whole rectangle is dug.' },
  { id: 'done', label: 'Result', description: 'The number of artifacts that can be extracted.' },
]

export function buildTrace({ n, artifacts, dig }) {
  const dugSet = new Set(dig.map(([r, c]) => `${r},${c}`))
  const frames = []
  let ans = 0
  const push = (phase, index, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, index, activeLine, pythonLine, message, n, artifacts, dig, dug: [...dugSet], ans, ...extra,
  })
  push('start', -1, L('dugSet ← set'), P('dug = {'), `${dugSet.size} cell(s) dug on a ${n} by ${n} grid.`)
  artifacts.forEach(([r1, c1, r2, c2], i) => {
    let count = 0
    for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) if (dugSet.has(`${r},${c}`)) count++
    const area = (r2 - r1 + 1) * (c2 - c1 + 1)
    const ok = count === area
    if (ok) ans += 1
    push('check', i, L('IF dugCount'), P('if dug_count =='),
      `Artifact ${i} covers rows ${r1}-${r2}, columns ${c1}-${c2}: ${count} of ${area} cells dug. ${ok ? 'It can be lifted.' : 'It is still buried.'}`,
      { artifact: [r1, c1, r2, c2], count, area, ok })
  })
  push('done', -1, L('RETURN ans'), P('return ans'), `${ans} artifact(s) can be extracted.`)
  return { input: { n, artifacts, dig }, result: ans, frames }
}
