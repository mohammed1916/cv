const MAX_CUSTOMERS = 4
const MAX_VALUES = 8

export function parseInput(text) {
  const data = JSON.parse(text)
  const { nums, quantity } = data ?? {}
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > MAX_VALUES) throw new Error(`nums must list 1 to ${MAX_VALUES} values.`)
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 10)) throw new Error('Values in nums are integers from 1 to 10.')
  if (!Array.isArray(quantity) || quantity.length < 1 || quantity.length > MAX_CUSTOMERS) throw new Error(`quantity must list 1 to ${MAX_CUSTOMERS} customers.`)
  if (quantity.some(q => !Number.isInteger(q) || q < 1 || q > 10)) throw new Error('Each quantity is an integer from 1 to 10.')
  return { nums, quantity }
}

export const code = `can distribute(nums, quantity)
  count how many times each distinct value appears
  set reachable[0] to true, meaning nobody is served yet
  for each value with count c
    copy reachable to next
    for each served group mask that is reachable
      for each non-empty set of unserved customers whose demand sums to at most c
        mark next[mask plus that set] as reachable
    replace reachable with next
  return reachable[all customers]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

// A mask holds the customers already served. Each value serves a set of customers whose total demand fits its count.
export function buildTrace({ nums, quantity }) {
  const tally = new Map()
  for (const v of nums) tally.set(v, (tally.get(v) ?? 0) + 1)
  const counts = [...tally.values()]
  const m = quantity.length
  const full = (1 << m) - 1
  const demand = Array.from({ length: 1 << m }, (_, mask) => quantity.reduce((sum, q, i) => sum + (mask & (1 << i) ? q : 0), 0))
  let reachable = Array(1 << m).fill(false)
  reachable[0] = true
  const show = r => r.map(b => (b ? '✓' : '·'))
  const frames = [{ phase: 'start', count: null, value: null, table: [show(reachable)], activeLine: L('set reachable[0]'), message: 'Nobody is served yet.' }]
  counts.forEach((c, index) => {
    const next = reachable.slice()
    for (let mask = 0; mask <= full; mask++) {
      if (!reachable[mask]) continue
      const rest = full ^ mask
      for (let sub = rest; sub > 0; sub = (sub - 1) & rest) {
        if (demand[sub] <= c) next[mask | sub] = true
      }
    }
    reachable = next
    frames.push({ phase: 'value', count: c, value: index + 1, table: [show(reachable)], activeLine: L('for each value with count'), message: `Value ${index + 1} appears ${c} time(s). Reachable sets now cover more customers.` })
  })
  const result = reachable[full]
  frames.push({ phase: 'done', count: null, value: null, table: [show(reachable)], activeLine: L('return reachable[all'), result, message: result ? 'Every customer can receive a full group of one value.' : 'Some customer cannot be served from the values available.' })
  return { input: { nums, quantity }, result, frames }
}

export const python = `def can_distribute(nums, quantity):
    from collections import Counter
    counts = list(Counter(nums).values())
    m = len(quantity)
    full = (1 << m) - 1
    demand = [sum(quantity[i] for i in range(m) if (mask >> i) & 1) for mask in range(1 << m)]
    reachable = [False] * (1 << m)
    reachable[0] = True
    for c in counts:
        nxt = reachable[:]
        for mask in range(1 << m):
            if not reachable[mask]:
                continue
            rest = full ^ mask
            sub = rest
            while sub:
                if demand[sub] <= c:
                    nxt[mask | sub] = True
                sub = (sub - 1) & rest
        reachable = nxt
    return reachable[full]
`
