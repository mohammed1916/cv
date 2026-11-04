export const code = `function maxActivated(points) {
  // parent starts with every x value and y value alone, each keyed by its label
  const parent = new Map()
  const find = a => {
    if (!parent.has(a)) parent.set(a, a)
    while (parent.get(a) !== a) a = parent.get(a)
    return a
  }
  // for each point join its x value and its y value
  for (const [x, y] of points) {
    const ra = find('x' + x)
    const rb = find('y' + y)
    if (ra !== rb) parent.set(ra, rb)
  }
  // count the points in each group, by the root of their x value
  const counts = new Map()
  for (const [x] of points) {
    const root = find('x' + x)
    counts.set(root, (counts.get(root) || 0) + 1)
  }
  const sizes = [...counts.values()].sort((a, b) => b - a)
  // if two groups exist then best is the two largest counts plus one
  // otherwise best is the largest count plus one
  const best = sizes.length >= 2 ? sizes[0] + sizes[1] + 1 : sizes[0] + 1
  // return best
  return best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = key => code.findIndex(c => c.text.includes(key)) + 1
const PY = key => python.split('\n').findIndex(line => line.includes(key)) + 1

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with points.')
  const { points } = input
  if (!Array.isArray(points) || points.length < 1 || points.length > 12) throw new Error('points has 1 to 12 entries.')
  const seen = new Set()
  for (const p of points) {
    if (!Array.isArray(p) || p.length !== 2 || !p.every(v => Number.isInteger(v) && v >= 0 && v <= 20)) throw new Error('Each point is [x, y] with integers from 0 to 20.')
    const key = `${p[0]},${p[1]}`
    if (seen.has(key)) throw new Error('Points must be distinct.')
    seen.add(key)
  }
  return { points }
}

export function buildTrace({ points }) {
  const parent = new Map()
  const find = x => {
    if (!parent.has(x)) parent.set(x, x)
    let root = x
    while (parent.get(root) !== root) root = parent.get(root)
    return root
  }
  const join = (a, b) => {
    const ra = find(a)
    const rb = find(b)
    if (ra !== rb) parent.set(ra, rb)
  }
  const groupsSoFar = upTo => {
    const groups = new Map()
    for (let j = 0; j <= upTo; j++) {
      const root = find(`x${points[j][0]}`)
      if (!groups.has(root)) groups.set(root, [])
      groups.get(root).push(points[j])
    }
    return [...groups.values()]
  }
  const frames = [{ groups: [], best: null, phase: 'setup', pythonLine: PY('parent = {}'), activeLine: L('parent starts'), message: 'Each coordinate starts alone.' }]
  points.forEach(([x, y], i) => {
    join(`x${x}`, `y${y}`)
    frames.push({ groups: groupsSoFar(i), best: null, phase: 'join', pythonLine: PY('ra, rb = find'), activeLine: L('for each point join'), message: `Point (${x}, ${y}) joins x ${x} with y ${y}.` })
  })
  const counts = new Map()
  for (const [x] of points) {
    const root = find(`x${x}`)
    counts.set(root, (counts.get(root) || 0) + 1)
  }
  const sizes = [...counts.values()].sort((a, b) => b - a)
  const best = sizes.length >= 2 ? sizes[0] + sizes[1] + 1 : sizes[0] + 1
  frames.push({ groups: groupsSoFar(points.length - 1), best, phase: 'count', pythonLine: PY('if len(sizes) >= 2'), activeLine: L('if two groups exist'),
    message: sizes.length >= 2 ? `Largest groups have ${sizes[0]} and ${sizes[1]} points; the new point links them.` : `One group with ${sizes[0]} points; the new point joins it.` })
  frames.push({ groups: groupsSoFar(points.length - 1), best, phase: 'done', pythonLine: PY('return sizes[0] + 1'), activeLine: L('return best'), message: `Maximum activated: ${best}.` })
  return { input: { points }, result: best, frames }
}

export const python = `def max_activated(points):
    parent = {}

    def find(a):
        parent.setdefault(a, a)
        while parent[a] != a:
            a = parent[a]
        return a

    for x, y in points:
        ra, rb = find(('x', x)), find(('y', y))
        if ra != rb:
            parent[ra] = rb
    counts = {}
    for x, _ in points:
        root = find(('x', x))
        counts[root] = counts.get(root, 0) + 1
    sizes = sorted(counts.values(), reverse=True)
    if len(sizes) >= 2:
        return sizes[0] + sizes[1] + 1
    return sizes[0] + 1`
