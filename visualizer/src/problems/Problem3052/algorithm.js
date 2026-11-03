// Teaching rule (not the official statement): a set is one item_category; its footprint is the sum of square_footage.
// Prime sets are considered first, smallest footprint first, then non-prime sets use the remaining capacity the same way.
// The sample tables and capacities are invented for this visualization.
export const sql = `WITH sets AS (
  SELECT item_category, item_type, SUM(square_footage) AS footprint
  FROM Inventory
  GROUP BY item_category, item_type
)
SELECT item_category, item_type, footprint,
  SUM(footprint) OVER (PARTITION BY item_type ORDER BY footprint, item_category) AS running_total
FROM sets
ORDER BY item_type DESC, footprint, item_category`

export const code = [
  'sets = GROUP Inventory BY item_category',
  'prime = sets with item_type = prime, ORDER BY footprint, item_category',
  'remaining = capacity',
  'for set in prime: if footprint <= remaining, pack it and subtract',
  'non = sets with item_type = non_prime, same order',
  'for set in non: if footprint <= remaining, pack it and subtract',
  'return packed, remaining',
].map((text, index) => ({ line: index + 1, text }))

export const python = `def maximize_items(capacity, inventory):
    sets = {}
    for row in inventory:
        s = sets.setdefault(row["item_category"], {"item_category": row["item_category"], "item_type": row["item_type"], "footprint": 0})
        s["footprint"] += row["square_footage"]
    remaining = capacity
    packed = []
    for kind in ["prime", "non_prime"]:
        group = sorted((s for s in sets.values() if s["item_type"] == kind), key=lambda s: (s["footprint"], s["item_category"]))
        for s in group:
            if s["footprint"] <= remaining:
                packed.append(s)
                remaining -= s["footprint"]
    return packed, remaining`

const COLUMNS = ['item_category', 'item_type', 'footprint', 'status']
const CODE_LINES = code.map(line => line.text)
const PY_LINES = python.split('\n')

function findLine(lines, key, label, offset = 0) {
  const index = lines.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing ${label} line: ${key}`)
  return index + 1 + offset
}
const CODE = key => findLine(CODE_LINES, key, 'pseudocode')
const PY = key => findLine(PY_LINES, key, 'Python')

export const phases = [
  { id: 'group', label: 'Sets', description: 'Group the rows into one set per category.' },
  { id: 'prime', label: 'Prime', description: 'Pack prime sets, smallest footprint first.' },
  { id: 'non_prime', label: 'Non-prime', description: 'Fill the leftover space with non-prime sets.' },
  { id: 'done', label: 'Result', description: 'Report the packed sets and the space left over.' },
]

export function parseInput(text) {
  let data
  try { data = JSON.parse(text) } catch { throw new Error('Input must be JSON with capacity and inventory') }
  const capacity = data?.capacity
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 1000) throw new Error('capacity must be an integer from 1 to 1000')
  if (!Array.isArray(data.inventory) || data.inventory.length < 1 || data.inventory.length > 12) throw new Error('inventory must have 1 to 12 rows')
  const ids = new Set()
  const inventory = data.inventory.map(row => {
    const { item_id, item_type, item_category, square_footage } = row ?? {}
    if (!Number.isInteger(item_id) || ids.has(item_id)) throw new Error('item_id must be a unique integer')
    ids.add(item_id)
    if (item_type !== 'prime' && item_type !== 'non_prime') throw new Error('item_type must be prime or non_prime')
    if (typeof item_category !== 'string' || item_category.trim() === '') throw new Error('item_category must be a non-empty string')
    if (!Number.isInteger(square_footage) || square_footage < 1 || square_footage > capacity) throw new Error('square_footage must be an integer from 1 to capacity')
    return { item_id, item_type, item_category, square_footage }
  })
  return { capacity, inventory }
}

function groupSets(inventory) {
  const byCategory = new Map()
  for (const row of inventory) {
    if (!byCategory.has(row.item_category)) {
      byCategory.set(row.item_category, { item_category: row.item_category, item_type: row.item_type, footprint: 0, status: 'waiting' })
    }
    const set = byCategory.get(row.item_category)
    if (set.item_type !== row.item_type) throw new Error(`Category ${row.item_category} mixes item types`)
    set.footprint += row.square_footage
  }
  return [...byCategory.values()]
}

const order = (a, b) => a.footprint - b.footprint || (a.item_category < b.item_category ? -1 : a.item_category > b.item_category ? 1 : 0)

export function buildTrace(input) {
  const { capacity, inventory } = parseInput(JSON.stringify(input))
  const sets = groupSets(inventory)
  const frames = []
  let remaining = capacity

  const snapshot = () => sets.map(set => ({ ...set }))
  const frame = (phase, codeKey, pyKey, message) => frames.push({
    phase, activeLine: CODE(codeKey), pythonLine: PY(pyKey), message, remaining,
    columns: COLUMNS, rows: snapshot(),
  })

  frame('group', 'GROUP', 'sets = {}', `${sets.length} sets from ${inventory.length} rows. Capacity ${capacity}.`)

  const packKind = (kind, phase, listKey, loopKey, pyKey) => {
    const group = sets.filter(set => set.item_type === kind).sort(order)
    frame(phase, listKey, 'for kind in', `${kind === 'prime' ? 'Prime' : 'Non-prime'} sets, smallest first. Space left: ${remaining}.`)
    for (const set of group) {
      const before = remaining
      if (set.footprint <= remaining) {
        set.status = 'packed'
        remaining -= set.footprint
        frame(phase, loopKey, pyKey, `${set.item_category} (${set.footprint}) fits in ${before}: pack it, ${remaining} left.`)
      } else {
        set.status = 'skipped'
        frame(phase, loopKey, pyKey, `${set.item_category} (${set.footprint}) is larger than ${before}: skip it.`)
      }
    }
  }

  packKind('prime', 'prime', 'prime = ', 'for set in prime', 'if s["footprint"] <= remaining')
  packKind('non_prime', 'non_prime', 'non = ', 'for set in non', 'if s["footprint"] <= remaining')

  const packed = sets.filter(set => set.status === 'packed').map(({ item_category, item_type, footprint }) => ({ item_category, item_type, footprint }))
  const result = { packed, remaining }
  frames.push({
    phase: 'done', activeLine: CODE('return packed'), pythonLine: PY('return packed, remaining'),
    message: `Packed ${packed.length} sets. Space left over: ${remaining}.`, remaining,
    columns: COLUMNS, rows: snapshot(),
  })
  return { input: { capacity, inventory }, result, frames }
}
