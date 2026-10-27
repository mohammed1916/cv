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

export function buildTrace({ n, paths }) {
  const neighbours = Array.from({ length: n + 1 }, () => [])
  const flowers = Array(n + 1).fill(0)
  const frames = [{ phase: 'start', activeLine: L('plant flowers so no two linked gardens match'), garden: null, flowers: [...flowers], taken: [], message: 'Gardens are planted in order. Each one must differ from the gardens it is linked to.' }]

  for (const [a, b] of paths) {
    neighbours[a].push(b)
    neighbours[b].push(a)
  }
  frames.push({ phase: 'links', activeLine: L('for each path join its two gardens'), garden: null, flowers: [...flowers], taken: [], message: 'Every path is recorded as a link in both directions.' })

  for (let garden = 1; garden <= n; garden++) {
    const taken = [...new Set(neighbours[garden].map(other => flowers[other]).filter(f => f > 0))].sort((x, y) => x - y)
    frames.push({ phase: 'collect', activeLine: L('collect the flower types'), garden, flowers: [...flowers], taken, message: `Garden ${garden} sees flower types ${taken.length ? taken.join(', ') : 'none'} among its neighbours.` })
    let pick = 1
    while (taken.includes(pick)) pick++
    flowers[garden] = pick
    frames.push({ phase: 'assign', activeLine: L('give it the smallest'), garden, flowers: [...flowers], taken, message: `Garden ${garden} gets flower type ${pick}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return the flower types'), garden: null, flowers: [...flowers], taken: [], message: 'Every garden has a flower type and no linked pair matches.' })
  return { input: { n, paths }, result: flowers.slice(1), frames }
}

export const code = `plant flowers so no two linked gardens match
  make an empty neighbour list for each garden
  for each path join its two gardens as neighbours
  for each garden from 1 to n in order
    collect the flower types already given to its neighbours
    give it the smallest flower type from 1 to 4 that is not collected
  return the flower types for gardens 1 to n`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def garden_flowers(n, paths):
    neighbours = [[] for _ in range(n + 1)]
    for a, b in paths:
        neighbours[a].append(b)
        neighbours[b].append(a)
    flowers = [0] * (n + 1)
    for garden in range(1, n + 1):
        taken = {flowers[other] for other in neighbours[garden]}
        pick = 1
        while pick in taken:
            pick += 1
        flowers[garden] = pick
    return flowers[1:]
`
