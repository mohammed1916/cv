export const phases = [
  { id: 'start', label: 'Start', description: 'Every computer begins as its own group. A cable count below n - 1 means the network can never connect.' },
  { id: 'cable', label: 'Read cable', description: 'Take the next cable between computers a and b.' },
  { id: 'merge', label: 'Join groups', description: 'If a and b are in different groups, join the groups; the number of groups drops by one.' },
  { id: 'redundant', label: 'Spare cable', description: 'a and b are already in one group, so this cable is spare and can be moved.' },
  { id: 'done', label: 'Complete', description: 'Each extra group needs one moved cable to join it to the rest.' },
]

export const examples = [
  { label: 'Two groups', input: '{"n":4,"links":[[0,1],[0,2],[1,2]]}' },
  { label: 'Not enough cables', input: '{"n":6,"links":[[0,1],[0,2],[0,3],[1,2]]}' },
  { label: 'Connected already', input: '{"n":5,"links":[[0,1],[1,2],[2,3],[3,4]]}' },
]

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with n and links, such as {"n":4,"links":[[0,1],[1,2]]}.')
  if (!Number.isInteger(data.n) || data.n < 1 || data.n > 12) throw new Error('n must be from 1 to 12 in this visualization.')
  if (!Array.isArray(data.links)) throw new Error('links must be a list of pairs.')
  const seen = new Set()
  for (const link of data.links) {
    if (!Array.isArray(link) || link.length !== 2 || !link.every(Number.isInteger) || link.some(v => v < 0 || v >= data.n)) throw new Error(`Link ${JSON.stringify(link)} must join two different computers numbered 0 to n - 1.`)
    if (link[0] === link[1]) throw new Error('A cable must join two different computers.')
    const key = [Math.min(...link), Math.max(...link)].join(',')
    if (seen.has(key)) throw new Error('There are no repeated connections.')
    seen.add(key)
  }
  return { n: data.n, links: data.links }
}

export function buildTrace({ n, links }) {
  const parent = Array.from({ length: n }, (_, i) => i)
  const find = x => { while (parent[x] !== x) x = parent[x]; return x }
  let groups = n
  const snap = (extra = {}) => ({ n, roots: parent.map((_, i) => find(i)), groups, ...extra })
  const frames = [{ phase: 'start', activeLine: L('const parent = Array.from'), pythonLine: P('parent = list'), snapshot: snap(),
    message: `${n} computers start as ${n} separate groups. We have ${links.length} cables; ${links.length < n - 1 ? 'fewer than n - 1, so the answer is -1.' : 'enough to try.'}` }]
  if (links.length < n - 1) {
    frames.push({ phase: 'done', activeLine: L('return -1'), pythonLine: P('return -1'), snapshot: snap(), message: 'Return -1: not enough cables.', result: -1 })
    return { input: { n, links }, result: -1, frames }
  }
  for (const [a, b] of links) {
    const ra = find(a), rb = find(b)
    frames.push({ phase: 'cable', activeLine: L('for (const [a, b] of links)'), pythonLine: P('for a, b in links'), snapshot: snap({ a, b }),
      message: `Cable ${a}-${b}.` })
    if (ra !== rb) {
      parent[ra] = rb
      groups--
      frames.push({ phase: 'merge', activeLine: L('parent[ra] = rb'), pythonLine: P('parent[ra] = rb'), snapshot: snap({ a, b }),
        message: `${a} and ${b} were in different groups, so join them. ${groups} group(s) remain.` })
    } else {
      frames.push({ phase: 'redundant', activeLine: L('if (ra !== rb)'), pythonLine: P('if ra != rb'), snapshot: snap({ a, b }),
        message: `${a} and ${b} are already connected, so this cable is spare.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return groups - 1'), pythonLine: P('return groups - 1'), snapshot: snap(),
    message: `${groups} group(s) remain, so ${groups - 1} cable(s) must move.`, result: groups - 1 })
  return { input: { n, links }, result: groups - 1, frames }
}

export const code = `function makeConnected(n, links) {
  if (links.length < n - 1) return -1
  const parent = Array.from({ length: n }, (_, i) => i)
  const find = x => { while (parent[x] !== x) x = parent[x]; return x }
  let groups = n
  for (const [a, b] of links) {
    const ra = find(a), rb = find(b)
    if (ra !== rb) {
      parent[ra] = rb
      groups--
    }
  }
  return groups - 1
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def make_connected(n, links):
    if len(links) < n - 1:
        return -1
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            x = parent[x]
        return x

    groups = n
    for a, b in links:
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[ra] = rb
            groups -= 1
    return groups - 1
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
