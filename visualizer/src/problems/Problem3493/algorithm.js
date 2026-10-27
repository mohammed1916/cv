export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with properties and k.')
  const { properties, k } = data
  if (!Array.isArray(properties) || properties.length < 1 || properties.length > 8) throw new Error('properties must have 1 to 8 rows.')
  const width = Array.isArray(properties[0]) ? properties[0].length : 0
  if (width < 1 || width > 6) throw new Error('Each row must have 1 to 6 values.')
  for (const row of properties) {
    if (!Array.isArray(row) || row.length !== width) throw new Error('Every row must have the same length.')
    if (row.some(v => !Number.isInteger(v) || v < 1 || v > 10)) throw new Error('Each value is an integer from 1 to 10.')
  }
  if (!Number.isInteger(k) || k < 1 || k > 6) throw new Error('k must be an integer from 1 to 6.')
  return { properties, k }
}

export function buildTrace({ properties, k }) {
  const m = properties.length
  const sets = properties.map(row => new Set(row))
  const parent = Array.from({ length: m }, (_, i) => i)
  const size = Array(m).fill(1)
  const find = x => { while (parent[x] !== x) x = parent[x]; return x }
  const frames = []
  const frame = (phase, line, pair, shared, message) => frames.push({ phase, activeLine: line, pair, shared, parent: [...parent], size: parent.map((_, i) => size[find(i)] ?? 1), message })
  frame('start', L('make each row its own root'), null, null, `Start with ${m} rows, each in its own component.`)
  for (let i = 0; i < m; i++) {
    for (let j = i + 1; j < m; j++) {
      const shared = [...sets[i]].filter(v => sets[j].has(v)).length
      if (shared >= k) {
        const ri = find(i)
        const rj = find(j)
        if (ri !== rj) {
          parent[ri] = rj
          size[rj] += size[ri]
        }
        frame('join', L('merge their roots'), [i, j], shared, `Rows ${i} and ${j} share ${shared} values, at least ${k}, so they join.`)
      } else {
        frame('apart', L('if the shared count is at least k'), [i, j], shared, `Rows ${i} and ${j} share ${shared} values, which is below ${k}.`)
      }
    }
  }
  const components = parent.filter((_, i) => find(i) === i).length
  frame('done', L('return that count'), null, null, `Connected components: ${components}.`)
  return { input: { properties, k }, result: components, frames }
}

export const code = `count connected components of the properties graph
  make each row its own root, with size 1
  for each pair of rows i less than j do
    count the distinct values that rows i and j share
    if the shared count is at least k then
      merge their roots
  count the roots that remain
  return that count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error('missing code line: ' + s); return i + 1 }

export const python = `def number_of_components(properties, k):
    m = len(properties)
    sets = [set(row) for row in properties]
    parent = list(range(m))

    def find(x):
        while parent[x] != x:
            x = parent[x]
        return x

    for i in range(m):
        for j in range(i + 1, m):
            shared = len(sets[i] & sets[j])
            if shared >= k:
                parent[find(i)] = find(j)
    return sum(1 for i in range(m) if find(i) == i)
`
