const PY = [
  "def minFlips(grid):",
  "    m = len(grid)",
  "    n = len(grid[0])",
  "    seen = set()",
  "    INF = float(\"inf\")",
  "    dp = [0, INF, INF, INF]",
  "    for i in range(m):",
  "        for j in range(n):",
  "            if (i, j) in seen:",
  "                continue",
  "            orbit = {(i, j), (i, n - 1 - j), (m - 1 - i, j), (m - 1 - i, n - 1 - j)}",
  "            seen |= orbit",
  "            size = len(orbit)",
  "            ones = sum(grid[r][c] for r, c in orbit)",
  "            new = [INF] * 4",
  "            for mod in range(4):",
  "                if dp[mod] == INF:",
  "                    continue",
  "                for v in (0, 1):",
  "                    cost = ones if v == 0 else size - ones",
  "                    nm = (mod + v * size) % 4",
  "                    new[nm] = min(new[nm], dp[mod] + cost)",
  "            dp = new",
  "    return dp[0]",
]

export const python = PY.join("\n")
const at = text => PY.findIndex(line => line.includes(text)) + 1

export const code = [
  { line: 1, text: "start with dp[0] = 0 and every other remainder at infinity" },
  { line: 2, text: "for each cell not already in an orbit" },
  { line: 3, text: "collect the mirror orbit of the cell" },
  { line: 4, text: "count the ones in the orbit" },
  { line: 5, text: "for each remainder and each choice of value 0 or 1" },
  { line: 6, text: "record the cost and the new remainder, keeping the minimum" },
  { line: 7, text: "replace dp with the new table" },
  { line: 8, text: "return dp[0]" },
]

const MAX_SIDE = 6
const INF = Infinity

function readJson(text) {
  if (typeof text !== "string") return text
  try {
    return JSON.parse(text)
  } catch (error) {
    throw new Error(`Input must be JSON such as {"grid": [[1,0],[0,1]]}: ${error.message}`)
  }
}

export function parseInput(text) {
  const data = readJson(text)
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error('Input must be an object with key "grid".')
  const { grid } = data
  if (!Array.isArray(grid) || grid.length < 1) throw new Error('Key "grid" must be a non-empty array of rows.')
  const n = Array.isArray(grid[0]) ? grid[0].length : 0
  if (n < 1) throw new Error("Each row must be a non-empty array.")
  if (grid.length > MAX_SIDE || n > MAX_SIDE) throw new Error(`The visualization accepts grids up to ${MAX_SIDE} by ${MAX_SIDE}.`)
  grid.forEach((row, index) => {
    if (!Array.isArray(row) || row.length !== n) throw new Error(`Row ${index} must have ${n} values.`)
    row.forEach(value => { if (value !== 0 && value !== 1) throw new Error("Every cell must be 0 or 1.") })
  })
  return { grid }
}

export function buildTrace(input) {
  const { grid } = input
  const m = grid.length
  const n = grid[0].length
  const frames = []
  const seen = new Set()
  let dp = [0, INF, INF, INF]
  const add = (phase, activeLine, pythonText, message, extra) => frames.push({
    phase, activeLine, pythonLine: at(pythonText), message, grid, m, n, dp: [...dp], ...extra,
  })
  add("setup", 1, "dp = [0, INF", "Start with remainder 0 at cost 0. Every other remainder is unreachable.", { cells: [], orbitIndex: -1 })
  for (let i = 0; i < m; i += 1) {
    for (let j = 0; j < n; j += 1) {
      if (seen.has(i * n + j)) continue
      const keys = [[i, j], [i, n - 1 - j], [m - 1 - i, j], [m - 1 - i, n - 1 - j]].map(([r, c]) => r * n + c)
      const unique = [...new Set(keys)]
      unique.forEach(key => seen.add(key))
      const cells = unique.map(key => [Math.floor(key / n), key % n])
      const size = cells.length
      const ones = cells.reduce((sum, [r, c]) => sum + grid[r][c], 0)
      add("orbit", 3, "orbit = {", `Cells (${i},${j}) mirror into ${size} cell(s) that must share one value.`, { cells, orbitIndex: unique[0] })
      add("count", 4, "ones = sum(", `The orbit holds ${ones} one(s).`, { cells, orbitIndex: unique[0], ones, size })
      const next = [INF, INF, INF, INF]
      for (let mod = 0; mod < 4; mod += 1) {
        if (dp[mod] === INF) continue
        for (const value of [0, 1]) {
          const cost = value === 0 ? ones : size - ones
          const nm = (mod + value * size) % 4
          next[nm] = Math.min(next[nm], dp[mod] + cost)
        }
      }
      add("combine", 6, "new[nm] = min(", `Combine the orbit choices into the remainder table.`, { cells, orbitIndex: unique[0], ones, size })
      dp = next
      add("replace", 7, "dp = new", `dp is now [${dp.map(value => (value === INF ? "inf" : value)).join(", ")}].`, { cells: [], orbitIndex: -1 })
    }
  }
  add("done", 8, "return dp[0]", `Return dp[0] = ${dp[0]}, the minimum flips.`, { cells: [], orbitIndex: -1 })
  return { input: { grid }, result: dp[0], frames }
}
