const MAX_VALUE = 100000

function listOf(value, name) {
  if (!Array.isArray(value) || value.length < 1 || value.length > 8) throw new Error(`${name} must be an array of 1 to 8 integers.`)
  if (value.some(v => !Number.isInteger(v) || v < 1 || v > MAX_VALUE)) throw new Error(`${name} holds integers from 1 to 100000.`)
  return value
}

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || Array.isArray(data)) throw new Error('Use {"nums1": [...], "nums2": [...]}.')
  return { nums1: listOf(data.nums1, 'nums1'), nums2: listOf(data.nums2, 'nums2') }
}

export function buildTrace(input) {
  const { nums1, nums2 } = input
  const frames = []
  let ways = 0
  const snapshot = table => [{ name: 'products', keyLabel: 'product', valueLabel: 'pairs', isSet: false, entries: [...table] }]
  frames.push({ phase: 'start', activeLine: L('ways = 0'), maps: snapshot(new Map()), ops: [], result: 0, message: 'Start with zero ways. Each list takes a turn as the squared side and the other list supplies the pairs.' })
  for (const [squared, pairs, label] of [[nums1, nums2, 'nums2 pairs'], [nums2, nums1, 'nums1 pairs']]) {
    const table = new Map()
    for (let j = 0; j < pairs.length; j++) {
      for (let k = j + 1; k < pairs.length; k++) {
        const product = pairs[j] * pairs[k]
        const before = table.get(product)
        table.set(product, (before ?? 0) + 1)
        frames.push({ phase: 'pair', activeLine: L('add one to table'), maps: snapshot(table),
          ops: [{ map: 'products', type: before === undefined ? 'insert' : 'update', key: product, value: (before ?? 0) + 1, before }],
          result: ways, message: `${label}: ${pairs[j]} times ${pairs[k]} = ${product}. The table counts ${table.get(product)} pair(s) with this product.` })
      }
    }
    for (const v of squared) {
      const target = v * v
      const hit = table.has(target)
      const count = table.get(target) ?? 0
      ways += count
      frames.push({ phase: 'square', activeLine: L('add table at v times v'), maps: snapshot(table),
        ops: [{ map: 'products', type: 'lookup', via: 'get', key: target, hit, value: hit ? count : undefined,
          hitNote: 'the table already counts pairs with this product', missNote: 'no pair on the other side multiplies to this square' }],
        result: ways, message: `${v} squared is ${target}. ${count} pair(s) match, so ways goes up by ${count}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return ways'), maps: snapshot(new Map()), ops: [], result: ways, message: `Total ways: ${ways}.` })
  return { input, result: ways, frames }
}

export const code = `count ways of equal square and product triplets
ways = 0
for each side, pair the squared list with the pair list
  table = empty map from product to count
  for each j less than k in the pair list
    add one to table at the product of the two numbers
  for each v in the squared list
    add table at v times v (zero if missing) to ways
return ways`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def num_triplets(nums1, nums2):
    ways = 0
    for squared, pairs in ((nums1, nums2), (nums2, nums1)):
        table = {}
        for j in range(len(pairs)):
            for k in range(j + 1, len(pairs)):
                product = pairs[j] * pairs[k]
                table[product] = table.get(product, 0) + 1
        for v in squared:
            ways += table.get(v * v, 0)
    return ways
`
