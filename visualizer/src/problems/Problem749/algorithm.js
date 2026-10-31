export const code = `function containVirus(grid):
  total = 0
  repeat until no infected region is left:
    clear the seen marks
    regions = empty list
    for each infected cell not yet seen:
      regions.append(flood fill the region from that cell)
    if regions is empty then return total
    worst = region that threatens the most healthy cells
    if worst threatens no healthy cell then return total
    total += walls needed to enclose worst
    set every cell of worst to contained
    for each other region:
      set each healthy cell it threatens to infected`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def contain_virus(grid):
    grid = [list(row) for row in grid]
    rows, cols = len(grid), len(grid[0])

    def flood_region(r, c, seen):
        stack = [(r, c)]
        seen.add((r, c))
        cells, threatened, walls = [], set(), 0
        while stack:
            x, y = stack.pop()
            cells.append((x, y))
            for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                if 0 <= nx < rows and 0 <= ny < cols:
                    if grid[nx][ny] == 1 and (nx, ny) not in seen:
                        seen.add((nx, ny))
                        stack.append((nx, ny))
                    elif grid[nx][ny] == 0:
                        threatened.add((nx, ny))
                        walls += 1
        return cells, threatened, walls

    total = 0
    while True:
        seen = set()
        regions = []
        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == 1 and (r, c) not in seen:
                    regions.append(flood_region(r, c, seen))
        if not regions:
            return total
        worst = 0
        for i in range(1, len(regions)):
            if len(regions[i][1]) > len(regions[worst][1]):
                worst = i
        if not regions[worst][1]:
            return total
        cells, threatened, walls = regions[worst]
        total += walls
        for x, y in cells:
            grid[x][y] = 2
        for i, region in enumerate(regions):
            if i != worst:
                for x, y in region[1]:
                    grid[x][y] = 1`

export function parseInput(text) {
  const g = JSON.parse(text)
  if (!Array.isArray(g) || !g.length || g.length > 20 || !Array.isArray(g[0]) || !g[0].length || g[0].length > 20) throw new Error('Enter a JSON grid of 1-20 rows and 1-20 columns (visualization cap).')
  if (g.some(row => !Array.isArray(row) || row.length !== g[0].length || row.some(v => v !== 0 && v !== 1))) throw new Error('The grid must be rectangular and contain only 0 and 1.')
  return g.map(r => [...r])
}

export function buildTrace(input) {
  const grid = input.map(r => [...r])
  const m = grid.length, n = grid[0].length
  const snap = () => grid.map(r => [...r])
  const frames = [{ phase: 'start', activeLine: L('function containVirus'), pythonLine: 22, grid: snap(), regionOf: null, regions: [], chosen: -1, total: 0, day: 0, message: 'Cells: 0 healthy, 1 infected, 2 contained (walled). Each day only the most threatening region is walled.' }]
  let total = 0, day = 0
  const explore = (r, c, seen) => {
    const stack = [[r, c]]; seen.add(r * n + c)
    const cells = [], threatened = new Set(); let walls = 0
    while (stack.length) {
      const [x, y] = stack.pop(); cells.push([x, y])
      for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
        if (nx >= 0 && nx < m && ny >= 0 && ny < n) {
          if (grid[nx][ny] === 1 && !seen.has(nx * n + ny)) { seen.add(nx * n + ny); stack.push([nx, ny]) }
          else if (grid[nx][ny] === 0) { threatened.add(nx * n + ny); walls++ }
        }
      }
    }
    return { cells, threatened, walls }
  }
  while (true) {
    day++
    const regions = [], seen = new Set()
    for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) if (grid[r][c] === 1 && !seen.has(r * n + c)) regions.push(explore(r, c, seen))
    const regionOf = grid.map(row => row.map(() => -1))
    regions.forEach((reg, id) => reg.cells.forEach(([x, y]) => { regionOf[x][y] = id }))
    const summary = regions.map((reg, id) => ({ id, size: reg.cells.length, threatened: reg.threatened.size, walls: reg.walls }))
    if (!regions.length) {
      frames.push({ phase: 'done', activeLine: L('return total'), pythonLine: 31, grid: snap(), regionOf, regions: summary, chosen: -1, total, day, message: `No infected region is left active. Total walls: ${total}.` })
      return { input, result: total, frames }
    }
    frames.push({ phase: 'scan', activeLine: L('regions.append'), pythonLine: 29, grid: snap(), regionOf, regions: summary, chosen: -1, total, day,
      message: `Day ${day}: ${regions.length} infected region${regions.length === 1 ? '' : 's'}. Each lists the healthy cells it threatens and the walls needed to seal it.` })
    let worst = 0
    regions.forEach((reg, i) => { if (reg.threatened.size > regions[worst].threatened.size) worst = i })
    if (!regions[worst].threatened.size) {
      frames.push({ phase: 'done', activeLine: L('threatens no healthy cell'), pythonLine: 37, grid: snap(), regionOf, regions: summary, chosen: -1, total, day, message: `No region threatens any healthy cell, so nothing more can spread. Total walls: ${total}.` })
      return { input, result: total, frames }
    }
    frames.push({ phase: 'choose', activeLine: L('worst = region'), pythonLine: 38, grid: snap(), regionOf, regions: summary, chosen: worst, total, day,
      message: `Region ${worst} threatens the most cells (${regions[worst].threatened.size}); it is the one to quarantine.` })
    total += regions[worst].walls
    regions[worst].cells.forEach(([x, y]) => { grid[x][y] = 2 })
    frames.push({ phase: 'wall', activeLine: L('total += walls'), pythonLine: 41, grid: snap(), regionOf, regions: summary, chosen: worst, total, day,
      message: `Build ${regions[worst].walls} walls around region ${worst} (one per infected-healthy border). Its cells become contained (2). Total walls: ${total}.` })
    regions.forEach((reg, i) => { if (i !== worst) reg.threatened.forEach(k => { grid[Math.floor(k / n)][k % n] = 1 }) })
    frames.push({ phase: 'spread', activeLine: L('set each healthy cell it threatens'), pythonLine: 45, grid: snap(), regionOf, regions: summary, chosen: -1, total, day,
      message: `Overnight the other regions infect every cell they threatened.` })
  }
}
