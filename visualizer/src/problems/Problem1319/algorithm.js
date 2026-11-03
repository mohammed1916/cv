export const phases = [
  { id: 'start', label: 'Start', description: 'Give every computer its own set, so each one starts as a separate component.' },
  { id: 'check', label: 'Check cable count', description: 'A connected network needs at least n minus one cables. Fewer than that is impossible.' },
  { id: 'merge', label: 'Join components', description: 'The cable joins two components, so they become one and the component count drops by one.' },
  { id: 'spare', label: 'Spare cable', description: 'Both ends are already connected. This cable is spare and can be moved without changing the count.' },
  { id: 'done', label: 'Complete', description: 'Each relocation joins two components, so the answer is components minus one.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"n": 4, "links": [[0, 1], [1, 2]]}.')
  const { n, links } = input
  if (!Number.isInteger(n) || n < 1 || n > 12) throw new Error('n is an integer from 1 to 12.')
  if (!Array.isArray(links) || links.length > 30) throw new Error('links is a list of at most 30 cables.')
  for (const link of links) {
    if (!Array.isArray(link) || link.length !== 2 || !link.every(v => Number.isInteger(v) && v >= 0 && v < n) || link[0] === link[1]) {
      throw new Error(`Each cable is a pair of different computers from 0 to ${n - 1}.`)
    }
  }
  return { n, links }
}

export function buildTrace({ n, links }) {
  const parent = Array.from({ length: n }, (_, i) => i)
  const find = x => { while (parent[x] !== x) x = parent[x]; return x }
  let components = n
  let spare = 0
  const snap = (link, cables = links.length, needed = n - 1) => ({ parent: [...parent], components, spare, link, cables, needed })
  const frames = [{ phase: 'start', activeLine: L('parent[i] = i'), pythonLine: P('parent = list'), snapshot: snap(null), message: `${n} computers, each in its own component.` }]
  frames.push({ phase: 'check', activeLine: L('if length of links'), pythonLine: P('if len(connections)'), snapshot: snap(null), message: `${links.length} cables are available and at least ${n - 1} are needed.` })
  if (links.length < n - 1) {
    frames.push({ phase: 'done', activeLine: L('return -1'), pythonLine: P('return -1'), snapshot: snap(null), message: 'Too few cables to connect everything, so the answer is -1.' })
    return { input: { n, links }, result: -1, frames }
  }
  for (const link of links) {
    const [a, b] = link
    const ra = find(a)
    const rb = find(b)
    if (ra !== rb) {
      parent[ra] = rb
      components -= 1
      frames.push({ phase: 'merge', activeLine: L('union(a, b)'), pythonLine: P('parent[ra] = rb'), snapshot: snap(link), message: `Cable ${a}-${b} joins two components. ${components} remain.` })
    } else {
      spare += 1
      frames.push({ phase: 'spare', activeLine: L('if find(a) != find(b)'), pythonLine: P('if ra != rb'), snapshot: snap(link), message: `Cable ${a}-${b} stays inside one component, so it is spare.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return components - 1'), pythonLine: P('return components - 1'), snapshot: snap(null), message: `${components} components remain, so ${components - 1} relocation${components - 1 === 1 ? '' : 's'} connect them.` })
  return { input: { n, links }, result: components - 1, frames }
}

export const code = `network operations (n, links):
  if length of links < n - 1: return -1
  parent[i] = i for every computer i
  components = n
  for each cable (a, b) in links:
    if find(a) != find(b):
      union(a, b)
      components -= 1
  return components - 1`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export const python = `def make_connected(n, connections):
    if len(connections) < n - 1:
        return -1
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            x = parent[x]
        return x

    components = n
    for a, b in connections:
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[ra] = rb
            components -= 1
    return components - 1
`
