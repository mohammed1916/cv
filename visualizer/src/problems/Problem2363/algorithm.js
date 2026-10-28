function itemsOf(value, name) {
  if (!Array.isArray(value) || value.length < 1 || value.length > 10) throw new Error(`${name} must hold 1 to 10 [value, weight] pairs.`)
  const seen = new Set()
  for (const pair of value) {
    if (!Array.isArray(pair) || pair.length !== 2 || !pair.every(Number.isInteger)) throw new Error(`${name} items are [value, weight] integer pairs.`)
    const [v, w] = pair
    if (v < 1 || v > 1000 || w < 1 || w > 100) throw new Error(`${name}: values are 1 to 1000 and weights are 1 to 100.`)
    if (seen.has(v)) throw new Error(`${name}: each value appears once within a list.`)
    seen.add(v)
  }
  return value
}

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || Array.isArray(data)) throw new Error('Use {"items1": [...], "items2": [...]}.')
  return { items1: itemsOf(data.items1, 'items1'), items2: itemsOf(data.items2, 'items2') }
}

export function buildTrace(input) {
  const totals = new Map()
  const frames = []
  const maps = () => [{ name: 'totals', keyLabel: 'value', valueLabel: 'total weight', isSet: false, entries: [...totals] }]
  frames.push({ phase: 'start', activeLine: L('totals = empty map'), maps: maps(), ops: [], result: [], message: 'Start with empty totals. Every item from both lists adds its weight to its value.' })
  for (const [source, items] of [['items1', input.items1], ['items2', input.items2]]) {
    for (const [value, weight] of items) {
      const before = totals.get(value)
      totals.set(value, (before ?? 0) + weight)
      frames.push({ phase: 'add', activeLine: L('add weight to totals'), maps: maps(),
        ops: [{ map: 'totals', type: before === undefined ? 'insert' : 'update', key: value, value: (before ?? 0) + weight, before }],
        result: [], message: `${source}: value ${value} adds weight ${weight}. Its total is now ${totals.get(value)}.` })
    }
  }
  const result = [...totals].sort((a, b) => a[0] - b[0]).map(([value, total]) => [value, total])
  frames.push({ phase: 'done', activeLine: L('return the list'), maps: maps(), ops: [], result, message: `Merged items in value order: ${result.map(([v, w]) => `[${v}, ${w}]`).join(' ')}.` })
  return { input, result, frames }
}

export const code = `merge two lists of items by value
totals = empty map from value to total weight
for each item [value, weight] in the first list, then the second list
  add weight to totals at value, starting from zero
sort the values in increasing order
return the list of [value, total weight] pairs in that order`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def merge_similar_items(items1, items2):
    totals = {}
    for value, weight in list(items1) + list(items2):
        totals[value] = totals.get(value, 0) + weight
    return [[value, totals[value]] for value in sorted(totals)]
`
