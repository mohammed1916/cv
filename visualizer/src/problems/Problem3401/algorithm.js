const MAX_ROWS = 12

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with SecretSanta.')
  const rows = input.SecretSanta
  if (!Array.isArray(rows)) throw new Error('SecretSanta must be a list of rows.')
  if (rows.length > MAX_ROWS) throw new Error(`This visualization draws at most ${MAX_ROWS} rows.`)
  const givers = new Set(), receivers = new Set()
  const clean = rows.map((row, i) => {
    if (!row || typeof row !== 'object') throw new Error(`Row ${i} must be an object.`)
    const { giver_id, receiver_id, gift_value } = row
    if (![giver_id, receiver_id, gift_value].every(Number.isInteger)) throw new Error(`Row ${i} needs integer giver_id, receiver_id and gift_value.`)
    if (giver_id === receiver_id) throw new Error(`Row ${i}: an employee gives to someone else, not to themselves.`)
    if (givers.has(giver_id)) throw new Error(`Employee ${giver_id} gives more than once; each employee gives exactly one gift.`)
    if (receivers.has(receiver_id)) throw new Error(`Employee ${receiver_id} receives more than once; each employee receives exactly one gift.`)
    givers.add(giver_id)
    receivers.add(receiver_id)
    return { giver_id, receiver_id, gift_value }
  })
  return { SecretSanta: clean }
}

export const phases = [
  { id: 'load', label: 'Load', description: 'Each row is one gift arrow from a giver to a receiver.' },
  { id: 'seed', label: 'Seed', description: 'Every row starts its own walk, one gift long.' },
  { id: 'walk', label: 'Walk', description: 'Follow the next gift from where a walk currently stands.' },
  { id: 'closed', label: 'Closed', description: 'The walk is back at its start, so it traced a full loop.' },
  { id: 'dead', label: 'Dead end', description: 'Nobody continues the chain, so this walk never closes.' },
  { id: 'distinct', label: 'Distinct', description: 'Each loop was found once per member, and equal combinations count once.' },
  { id: 'order', label: 'Order', description: 'Sort by length, then total, both descending, and number the rows.' },
  { id: 'done', label: 'Result', description: 'Return chain_id, chain_length and total_gift_value.' },
]

export const sql = `WITH RECURSIVE walk AS (
    SELECT giver_id AS start_id, receiver_id AS at_id, 1 AS hops, gift_value AS total
    FROM SecretSanta
    UNION ALL
    SELECT w.start_id, s.receiver_id, w.hops + 1, w.total + s.gift_value
    FROM walk w
    JOIN SecretSanta s ON s.giver_id = w.at_id
    WHERE w.at_id <> w.start_id
      AND w.hops < (SELECT COUNT(*) FROM SecretSanta)
),
loops AS (
    SELECT DISTINCT hops, total
    FROM walk
    WHERE at_id = start_id
)
SELECT ROW_NUMBER() OVER (ORDER BY hops DESC, total DESC) AS chain_id,
       hops AS chain_length,
       total AS total_gift_value
FROM loops
ORDER BY chain_length DESC, total_gift_value DESC;
`

export const code = `find circular gift chains
  start one walk per row: start = giver, at = receiver, hops = 1, total = value
  repeat while any walk is still moving
    for each moving walk
      if at equals start, record (hops, total) as a closed loop
      else if at gives a gift, follow it: add one hop and the gift value
      else the chain is open, drop this walk
  keep each distinct (hops, total) once
  sort by hops, then total, both descending
  number the rows from 1 and return them`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def circular_chains(santa):
    gift_from = {giver: (receiver, value) for giver, receiver, value in santa}
    walks = [(giver, receiver, 1, value) for giver, receiver, value in santa]
    closed = []
    while walks:
        moved = []
        for start, at, hops, total in walks:
            if at == start:
                closed.append((hops, total))
            elif at in gift_from:
                receiver, value = gift_from[at]
                moved.append((start, receiver, hops + 1, total + value))
        walks = moved
    combos = sorted(set(closed), key=lambda c: (-c[0], -c[1]))
    return [(i + 1, hops, total) for i, (hops, total) in enumerate(combos)]
`

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Pseudocode line missing: ${s}`)
  return index + 1
}
const pyLines = python.trim().split('\n')
const P = s => {
  const index = pyLines.findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Python line missing: ${s}`)
  return index + 1
}

export function buildTrace({ SecretSanta: rows }) {
  const frames = []
  const giftFrom = new Map(rows.map((r, i) => [r.giver_id, { ...r, rowIndex: i }]))
  const walks = rows.map(r => ({ start: r.giver_id, at: r.receiver_id, hops: 1, total: r.gift_value, path: [r.giver_id, r.receiver_id], status: 'walking' }))
  const closedEdges = new Set()
  const openEdges = new Set()
  const closedRows = []
  let distinct = []
  let chains = []
  const snap = () => walks.map(w => ({ ...w, path: [...w.path] }))
  const push = (phase, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine, message, walker: -1, rowIndex: -1, trail: [], walks: snap(),
    closedEdges: [...closedEdges], openEdges: [...openEdges], closedRows: closedRows.map(c => ({ ...c })), distinct: distinct.map(c => ({ ...c })), chains: chains.map(c => ({ ...c })), closedIndex: -1, ...extra,
  })
  const trailOf = w => w.path.slice(0, -1).map((p, i) => `${p}>${w.path[i + 1]}`)

  push('load', L('find circular gift chains'), P('gift_from ='), rows.length
    ? `${rows.length} gift${rows.length === 1 ? '' : 's'} become arrows. Nobody gives or receives twice, so the arrows can only form loops or open lines.`
    : 'The table is empty, so there are no gifts and no loops.')
  push('seed', L('start one walk per row'), P('walks ='), rows.length
    ? `Every row starts a walk from its giver. Each walk has taken one gift so far.`
    : 'No rows, so no walks start.')

  let round = 1
  while (walks.some(w => w.status === 'walking')) {
    const moving = walks.filter(w => w.status === 'walking')
    for (const w of moving) {
      const walker = walks.indexOf(w)
      if (w.at === w.start) {
        w.status = 'closed'
        closedRows.push({ start: w.start, hops: w.hops, total: w.total })
        for (const e of trailOf(w)) closedEdges.add(e)
        push('closed', L('if at equals start'), P('closed.append'),
          `Walk from ${w.start} is back at ${w.start} after ${w.hops} gifts: record length ${w.hops}, total ${w.total}.`,
          { walker, trail: trailOf(w) })
      } else if (giftFrom.has(w.at)) {
        const gift = giftFrom.get(w.at)
        const before = w.total
        w.at = gift.receiver_id
        w.hops += 1
        w.total += gift.gift_value
        w.path.push(gift.receiver_id)
        push('walk', L('else if at gives'), P('moved.append'),
          `Round ${round}: walk from ${w.start} follows ${gift.giver_id} to ${gift.receiver_id}. Total ${before} + ${gift.gift_value} = ${w.total}.`,
          { walker, rowIndex: gift.rowIndex, trail: trailOf(w), edge: `${gift.giver_id}>${gift.receiver_id}` })
      } else {
        w.status = 'open'
        for (const e of trailOf(w)) openEdges.add(e)
        push('dead', L('else the chain is open'), P('elif at in gift_from'),
          `Walk from ${w.start} reached ${w.at}, who gives nothing in this table. It can never return, so it is dropped.`,
          { walker, trail: trailOf(w) })
      }
    }
    round++
  }

  const seen = new Set()
  closedRows.forEach((c, closedIndex) => {
    const key = `${c.hops}|${c.total}`
    if (seen.has(key)) {
      push('distinct', L('keep each distinct'), P('combos ='), `Length ${c.hops}, total ${c.total} from walk ${c.start} is already listed, so it adds nothing.`, { closedIndex })
    } else {
      seen.add(key)
      distinct.push({ chain_length: c.hops, total_gift_value: c.total })
      push('distinct', L('keep each distinct'), P('combos ='), `Length ${c.hops}, total ${c.total} from walk ${c.start} is a new combination.`, { closedIndex })
    }
  })
  if (!closedRows.length) push('distinct', L('keep each distinct'), P('combos ='), 'No walk closed, so there is nothing to keep.')
  distinct = [...distinct].sort((a, b) => b.chain_length - a.chain_length || b.total_gift_value - a.total_gift_value)
  push('order', L('sort by hops'), P('combos ='), distinct.length > 1
    ? `Longest first, and the larger total breaks ties: ${distinct.map(d => `(${d.chain_length}, ${d.total_gift_value})`).join(', ')}.`
    : 'Sorting has nothing to rearrange here.')
  chains = distinct.map((d, i) => ({ chain_id: i + 1, ...d }))
  push('done', L('number the rows'), P('return [(i + 1'), chains.length
    ? `Return ${chains.length} row${chains.length === 1 ? '' : 's'}, with chain_id counting from 1.`
    : 'Return no rows: the table has no closed loop.')
  return { input: { SecretSanta: rows }, result: chains, frames }
}
