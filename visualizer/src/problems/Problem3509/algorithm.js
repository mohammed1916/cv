export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || Array.isArray(input) || !Array.isArray(input.nums) || !Number.isInteger(input.k) || !Number.isInteger(input.limit)) {
    throw new Error('Use an object such as {"nums": [1,2,3], "k": 2, "limit": 10}.')
  }
  const { nums, k, limit } = input
  if (nums.length < 1 || nums.length > 16) throw new Error('nums needs 1 to 16 entries for the visualization.')
  if (nums.some(v => !Number.isInteger(v) || v < 0 || v > 12)) throw new Error('Each value is an integer from 0 to 12.')
  if (k < -100000 || k > 100000) throw new Error('k is an integer from -100000 to 100000.')
  if (limit < 1 || limit > 5000) throw new Error('limit is an integer from 1 to 5000.')
  return { nums, k, limit }
}

// A state is (next sign, alternating sum, contains zero). Without a zero the product only grows, so a
// product above the limit is stored as "over" (limit + 1): a later zero can still bring it down to 0.
export function buildTrace({ nums, k, limit }) {
  const input = { nums, k, limit }
  const over = limit + 1
  const states = new Map()
  const frames = [{ phase: 'start', activeLine: L('set states to empty'), index: -1, best: -1, message: 'No subsequence has been started yet.' }]
  nums.forEach((v, i) => {
    const additions = [v === 0 ? ['1,0,1', 0] : [`1,${v},0`, Math.min(v, over)]]
    for (const [key, products] of states) {
      const [parity, sum, zero] = key.split(',').map(Number)
      const signed = parity === 0 ? sum + v : sum - v
      if (v === 0) additions.push([`${1 - parity},${signed},1`, 0])
      else for (const q of products) additions.push([`${1 - parity},${signed},${zero}`, zero ? 0 : Math.min(q * v, over)])
    }
    for (const [key, product] of additions) {
      if (!states.has(key)) states.set(key, new Set())
      states.get(key).add(product)
    }
    frames.push({ phase: 'consider', activeLine: L('for each value'), index: i, best: bestFor(states, k, limit), message: `Value ${v} starts or extends subsequences. ${states.size} states are reachable.` })
  })
  const result = bestFor(states, k, limit)
  frames.push({ phase: 'done', activeLine: L('return the largest product'), index: nums.length - 1, best: result, message: `Largest product with alternating sum ${k}: ${result}.` })
  return { input, result, frames }
}

function bestFor(states, k, limit) {
  let best = -1
  for (const [key, products] of states) {
    if (Number(key.split(',')[1]) !== k) continue
    for (const p of products) if (p <= limit && p > best) best = p
  }
  return best
}

export const code = `largest product of a subsequence with alternating sum k
  set states to empty, where a state is the next sign, the alternating sum, and whether a zero is used
  for each value in nums
    a value can start a new subsequence with a plus sign
    a value can extend any state, with the sign that comes next
    a zero makes the product zero, and a product above the limit is kept as over
    add the new products to the states
  return the largest product whose alternating sum is k and that is within the limit`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_alternating_product(nums, k, limit):
    over = limit + 1
    states = {}
    for value in nums:
        additions = [((1, 0, 1), 0)] if value == 0 else [((1, value, 0), min(value, over))]
        for (parity, total, zero), products in states.items():
            signed = total + value if parity == 0 else total - value
            if value == 0:
                additions.append(((1 - parity, signed, 1), 0))
            else:
                for q in products:
                    additions.append(((1 - parity, signed, zero), 0 if zero else min(q * value, over)))
        for key, product in additions:
            states.setdefault(key, set()).add(product)
    best = -1
    for (parity, total, zero), products in states.items():
        if total == k:
            for p in products:
                if p <= limit and p > best:
                    best = p
    return best
`
