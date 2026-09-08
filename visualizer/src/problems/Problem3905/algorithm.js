export function parseInput(text) {
  const data = JSON.parse(text)
  const n = data?.n, m = data?.m, sources = data?.sources
  if (!Number.isInteger(n) || !Number.isInteger(m) || n < 1 || m < 1 || n * m > 100000 || !Array.isArray(sources) || !sources.length || sources.length > n * m) {
    throw new Error('Enter {"n":3,"m":3,"sources":[[0,0,1]]}, with positive dimensions, at most 100,000 cells, and at least one source.')
  }
  const seen = new Set()
  for (const source of sources) {
    if (!Array.isArray(source) || source.length !== 3 || source.some(v => !Number.isInteger(v)) || source[0] < 0 || source[0] >= n
      || source[1] < 0 || source[1] >= m || source[2] < 1 || source[2] > 1000000 || seen.has(source[0] * m + source[1])) {
      throw new Error('Each source must have a unique in-bounds [row,column], and an integer color from 1 to 1,000,000.')
    }
    seen.add(source[0] * m + source[1])
  }
  return { n, m, sources }
}

export function buildTrace({ n, m, sources }) {
  const colors = new Int32Array(n * m), arrival = new Int32Array(n * m).fill(-1)
  const contenders = Array.from({ length: n * m }, () => [])
  let frontier = sources.map(([r, c, color]) => {
    const index = r * m + c
    colors[index] = color
    arrival[index] = 0
    return index
  })
  const layers = [frontier]
  let time = 0, colored = frontier.length
  const frames = [{ phase: 'start', time, colored, layer: 0, activeLine: 2, message: `Place ${colored} sources at time 0. All other cells are uncolored.` }]
  while (colored < n * m) {
    const next = []
    let conflicts = 0
    for (const index of frontier) {
      const r = Math.floor(index / m), c = index % m
      for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        const nr = r + dr, nc = c + dc
        if (nr < 0 || nr >= n || nc < 0 || nc >= m) continue
        const target = nr * m + nc
        if (arrival[target] >= 0 && arrival[target] <= time) continue
        if (arrival[target] < 0) { arrival[target] = time + 1; next.push(target) }
        if (!contenders[target].includes(colors[index])) contenders[target].push(colors[index])
        colors[target] = Math.max(colors[target], colors[index])
      }
    }
    for (const index of next) if (contenders[index].length > 1) conflicts++
    layers.push(next)
    frames.push({ phase: 'propose', time, colored, layer: time, pending: next.length, conflicts, activeLine: 15,
      message: `${next.length} uncolored cells receive proposals for time ${time + 1}; ${conflicts} receive distinct competing colors. Nothing spreads from these pending cells yet.` })
    time++
    colored += next.length
    frames.push({ phase: 'commit', time, colored, layer: time, conflicts, activeLine: 17,
      message: `Commit all ${next.length} cells simultaneously at time ${time}. The largest proposed color wins each tie.` })
    frontier = next
  }
  frames.push({ phase: 'done', time, colored, layer: time, activeLine: 19, message: `All ${colored} cells are colored after ${time} time steps. Previously colored cells never change.` })
  const result = Array.from({ length: n }, (_, r) => Array.from(colors.slice(r * m, (r + 1) * m)))
  return { n, m, colors, arrival, contenders, layers, result, frames }
}

export function cellAtStep(run, step, row, column) {
  const i = row * run.m + column, t = run.arrival[i]
  const visible = t <= step.time, pending = !visible && step.phase === 'propose' && t === step.time + 1
  const color = visible || pending ? run.colors[i] : 0
  const proposals = pending || visible && t > 0 ? run.contenders[i] : []
  return {
    value: visible ? color : pending ? `${color}?` : 0,
    role: pending ? 'pending' : visible ? t === 0 ? 'source' : t === step.time ? 'frontier' : 'filled' : 'uncolored',
    label: pending ? proposals.length > 1 ? 'tie → max' : 'proposed' : visible ? `t=${t}` : 'uncolored',
    color: color ? `hsl(${(color * 137.508) % 360} 65% 45%)` : undefined,
    detail: pending ? `Pending colors ${proposals.join(', ')}; maximum ${color} will be committed at time ${t}.`
      : visible ? `Color ${color}, reached at time ${t}.${t ? ` Incoming colors: ${proposals.join(', ')}.` : ' Original source.'}` : 'Uncolored; no proposal has reached this cell yet.',
  }
}

export const code = `def floodFill(n, m, sources):
    grid = [[0] * m for _ in range(n)]
    frontier = []
    for r, c, color in sources:
        grid[r][c] = color
        frontier.append((r, c))
    while frontier:
        pending = {}
        for r, c in frontier:
            for dr, dc in [(-1,0),(1,0),(0,-1),(0,1)]:
                nr, nc = r + dr, c + dc
                if not (0 <= nr < n and 0 <= nc < m):
                    continue
                if grid[nr][nc] == 0:
                    pending[nr,nc] = max(pending.get((nr,nc), 0), grid[r][c])
        for (r, c), color in pending.items():
            grid[r][c] = color
        frontier = list(pending)
    return grid`.split('\n').map((text, index) => ({ line: index + 1, text }))
