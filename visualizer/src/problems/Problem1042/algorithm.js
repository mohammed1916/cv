export function parseInput(text) {
  const input = JSON.parse(text)
  const n = input?.n
  const paths = input?.paths
  if (!Number.isInteger(n) || n < 1 || n > 12) throw new Error('Use n gardens, an integer from 1 to 12.')
  if (!Array.isArray(paths) || paths.length > 16) throw new Error('Paths must be a list of at most 16 pairs.')
  const degree = Array(n + 1).fill(0)
  for (const pair of paths) {
    if (!Array.isArray(pair) || pair.length !== 2 || !pair.every(g => Number.isInteger(g) && g >= 1 && g <= n) || pair[0] === pair[1]) {
      throw new Error('Each path joins two different gardens numbered 1 to n.')
    }
    degree[pair[0]]++
    degree[pair[1]]++
    if (degree[pair[0]] > 3 || degree[pair[1]] > 3) throw new Error('Each garden has at most 3 paths.')
  }
  return { n, paths }
}

// Each line of JavaScript is paired with the Python line on the same row.
const LINES = [
  ['function gardenFlowers(n, paths) {', 'def garden_flowers(n, paths):'],
  ['  const neighbours = Array.from({ length: n + 1 }, () => [])', '    neighbours = [[] for _ in range(n + 1)]'],
  ['  for (const [a, b] of paths) {', '    for a, b in paths:'],
  ['    neighbours[a].push(b)', '        neighbours[a].append(b)'],
  ['    neighbours[b].push(a)', '        neighbours[b].append(a)'],
  ['  }', ''],
  ['  const flowers = Array(n + 1).fill(0)', '    flowers = [0] * (n + 1)'],
  ['  for (let garden = 1; garden <= n; garden++) {', '    for garden in range(1, n + 1):'],
  ['    const taken = new Set(neighbours[garden].map(other => flowers[other]))', '        taken = {flowers[other] for other in neighbours[garden]}'],
  ['    let pick = 1', '        pick = 1'],
  ['    while (taken.has(pick)) pick++', '        while pick in taken: pick += 1'],
  ['    flowers[garden] = pick', '        flowers[garden] = pick'],
  ['  }', ''],
  ['  return flowers.slice(1)', '    return flowers[1:]'],
  ['}', ''],
]
const codeLines = LINES.map(([js]) => js)
export const code = codeLines.map((text, index) => ({ line: index + 1, text }))
const L = s => codeLines.findIndex(c => c.includes(s)) + 1
export const python = LINES.map(([, py]) => py).join('\n')
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export function buildTrace({ n, paths }) {
  const neighbours = Array.from({ length: n + 1 }, () => [])
  const flowers = Array(n + 1).fill(0)
  const frames = [{ phase: 'start', pythonLine: P('def garden_flowers'), activeLine: L('function gardenFlowers'), garden: null, flowers: [...flowers], taken: [], message: 'Gardens are planted in order. Each one must differ from the gardens it is linked to.' }]

  for (const [a, b] of paths) {
    neighbours[a].push(b)
    neighbours[b].push(a)
  }
  frames.push({ phase: 'links', pythonLine: P('neighbours[b].append(a)'), activeLine: L('neighbours[b].push(a)'), garden: null, flowers: [...flowers], taken: [], message: 'Every path is recorded as a link in both directions.' })

  for (let garden = 1; garden <= n; garden++) {
    const taken = [...new Set(neighbours[garden].map(other => flowers[other]).filter(f => f > 0))].sort((x, y) => x - y)
    frames.push({ phase: 'collect', pythonLine: P('taken = {flowers'), activeLine: L('const taken = new Set'), garden, flowers: [...flowers], taken, message: `Garden ${garden} sees flower types ${taken.length ? taken.join(', ') : 'none'} among its neighbours.` })
    let pick = 1
    while (taken.includes(pick)) pick++
    flowers[garden] = pick
    frames.push({ phase: 'assign', pythonLine: P('flowers[garden] = pick'), activeLine: L('flowers[garden] = pick'), garden, flowers: [...flowers], taken, message: `Garden ${garden} gets flower type ${pick}.` })
  }
  frames.push({ phase: 'done', pythonLine: P('return flowers[1:]'), activeLine: L('return flowers.slice(1)'), garden: null, flowers: [...flowers], taken: [], message: 'Every garden has a flower type and no linked pair matches.' })
  return { input: { n, paths }, result: flowers.slice(1), frames }
}
