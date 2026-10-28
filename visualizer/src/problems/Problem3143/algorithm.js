export function parseInput(text) {
  const value = JSON.parse(text)
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Use an object with points and s.')
  const { points, s } = value
  if (!Array.isArray(points) || points.length < 1 || points.length > 8) throw new Error('points must list 1 to 8 pairs.')
  if (points.some(p => !Array.isArray(p) || p.length !== 2 || p.some(v => !Number.isInteger(v) || v < -10 || v > 10))) throw new Error('Each point is a pair of integers from -10 to 10.')
  const keys = new Set(points.map(p => `${p[0]},${p[1]}`))
  if (keys.size !== points.length) throw new Error('Points must be distinct.')
  if (typeof s !== 'string' || s.length !== points.length || !/^[a-z]+$/.test(s)) throw new Error('s must be lowercase letters, one per point.')
  return { points, s }
}

export function buildTrace({ points, s }) {
  const dist = i => Math.max(Math.abs(points[i][0]), Math.abs(points[i][1]))
  const order = points.map((_, i) => ({ i, d: dist(i), letter: s[i] })).sort((a, b) => a.d - b.d || a.i - b.i)
  const frames = [{ phase: 'sort', activeLine: L('compute the distance'), group: [], count: 0, seen: [], message: 'Order the points by their chebyshev distance from the origin.' }]
  const seen = new Set()
  let count = 0
  let i = 0
  while (i < order.length) {
    let j = i
    while (j < order.length && order[j].d === order[i].d) j++
    const group = order.slice(i, j)
    const letters = group.map(p => p.letter)
    if (new Set(letters).size !== letters.length || letters.some(l => seen.has(l))) {
      frames.push({ phase: 'stop', activeLine: L('stop checking'), group: group.map(p => p.i), count, seen: [...seen], message: `Distance ${group[0].d} holds letters ${letters.join(', ')}, which repeat. The square cannot reach this ring.` })
      break
    }
    letters.forEach(l => seen.add(l))
    count += group.length
    frames.push({ phase: 'take', activeLine: L('add the group'), group: group.map(p => p.i), count, seen: [...seen], message: `Distance ${group[0].d}: add ${group.length} point${group.length === 1 ? '' : 's'}. Count is ${count}.` })
    i = j
  }
  frames.push({ phase: 'done', activeLine: L('return count'), group: [], count, seen: [...seen], message: `Maximum points inside: ${count}.` })
  return { input: { points, s }, result: count, frames }
}

export const code = `maximum points inside the square with distinct letters:
  compute the distance of each point as max of absolute x and absolute y
  sort the points by distance
  set count to 0 and seen to an empty set
  for each group of points with equal distance do
    if a letter in the group is already seen or repeats then
      stop checking further groups
    otherwise add the group's letters to seen and add its size to count
  return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_points_inside(points, s):
    def dist(i):
        return max(abs(points[i][0]), abs(points[i][1]))
    order = sorted(range(len(points)), key=dist)
    seen = set()
    count = 0
    i = 0
    while i < len(order):
        j = i
        while j < len(order) and dist(order[j]) == dist(order[i]):
            j += 1
        group = [s[order[k]] for k in range(i, j)]
        if len(set(group)) != len(group) or any(c in seen for c in group):
            break
        seen.update(group)
        count += len(group)
        i = j
    return count
`
