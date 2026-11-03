export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with regions, region1 and region2.')
  const { regions, region1, region2 } = input
  if (!Array.isArray(regions) || regions.length < 1 || regions.length > 8) throw new Error('regions lists 1 to 8 rows.')
  const parent = new Map()
  const names = new Set()
  for (const row of regions) {
    if (!Array.isArray(row) || row.length < 2 || !row.every(n => typeof n === 'string' && n.length > 0)) throw new Error('Each row is a parent region followed by at least one child region name.')
    for (const name of row) names.add(name)
    for (const child of row.slice(1)) {
      if (parent.has(child)) throw new Error(`${child} is listed as a child twice.`)
      parent.set(child, row[0])
    }
  }
  const roots = [...names].filter(n => !parent.has(n))
  if (roots.length !== 1) throw new Error('Exactly one region has no parent.')
  if (names.size > 14) throw new Error('The visualization shows at most 14 region names.')
  if (!names.has(region1) || !names.has(region2)) throw new Error('region1 and region2 must appear in regions.')
  return { regions, region1, region2 }
}

export function buildTrace({ regions, region1, region2 }) {
  const parent = new Map()
  for (const row of regions) for (const child of row.slice(1)) parent.set(child, row[0])
  const frames = []
  const marked = []
  frames.push({ pythonLine: 2, phase: 'start', activeLine: L('record the parent'), node: null, marked: [], answer: null, message: `Each child points to the region whose row lists it; ${parent.size} links recorded.` })
  let node = region1
  for (;;) {
    marked.push(node)
    const top = !parent.has(node)
    frames.push({ pythonLine: 9, phase: 'mark', activeLine: L('mark region1'), node, marked: marked.slice(), answer: null, message: top ? `${node} has no parent, so the chain above region1 is complete.` : `Mark ${node}, then climb to ${parent.get(node)}.` })
    if (top) break
    node = parent.get(node)
  }
  node = region2
  frames.push({ pythonLine: 13, phase: 'second', activeLine: L('let current be'), node, marked: marked.slice(), answer: null, message: `Start from ${region2} and climb until it reaches a marked region.` })
  while (!marked.includes(node)) {
    frames.push({ pythonLine: 14, phase: 'check', activeLine: L('while current is not marked'), node, marked: marked.slice(), answer: null, message: `${node} is not on the chain of ${region1}; keep climbing.` })
    node = parent.get(node)
    frames.push({ pythonLine: 15, phase: 'climb', activeLine: L('move current'), node, marked: marked.slice(), answer: null, message: `Move up to ${node}.` })
  }
  frames.push({ pythonLine: 14, phase: 'found', activeLine: L('while current is not marked'), node, marked: marked.slice(), answer: node, message: `${node} is marked, so it contains both regions.` })
  frames.push({ pythonLine: 16, phase: 'done', activeLine: L('return current'), node, marked: marked.slice(), answer: node, message: `The smallest common region is ${node}.` })
  return { input: { regions, region1, region2 }, result: node, frames }
}

export const code = `smallest common region of region1 and region2 in regions
  record the parent of each child from its row
  mark region1 and every region above it
  let current be region2
  while current is not marked
    move current to its parent
  return current`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def smallest_common_region(regions, region1, region2):
    parent = {}
    for row in regions:
        for child in row[1:]:
            parent[child] = row[0]
    seen = set()
    node = region1
    while True:
        seen.add(node)
        if node not in parent:
            break
        node = parent[node]
    node = region2
    while node not in seen:
        node = parent[node]
    return node
`
