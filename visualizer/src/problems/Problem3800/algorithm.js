const BIT = /^[01]+$/
const COST = v => Number.isInteger(v) && v >= 1 && v <= 1000000000

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with s, t, flipCost, swapCost and crossCost.')
  const { s, t, flipCost, swapCost, crossCost } = input
  if (typeof s !== 'string' || s.length < 1 || s.length > 40 || !BIT.test(s)) throw new Error('s is a binary string of 1 to 40 characters.')
  if (typeof t !== 'string' || t.length !== s.length || !BIT.test(t)) throw new Error('t is a binary string with the same length as s.')
  if (![flipCost, swapCost, crossCost].every(COST)) throw new Error('Each cost is an integer from 1 to 1000000000.')
  return { s, t, flipCost, swapCost, crossCost }
}

export function buildTrace({ s, t, flipCost, swapCost, crossCost }) {
  const frames = []
  let typeA = 0
  let typeB = 0
  frames.push({ pythonLine: at('type_a = 0'), phase: 'start', activeLine: L('count type A mismatches'), index: -1, mixed: -1, best: null, message: 'Start with no mismatches counted.' })
  for (let i = 0; i < s.length; i++) {
    let kind
    if (s[i] === '0' && t[i] === '1') { typeA++; kind = 'A' }
    else if (s[i] === '1' && t[i] === '0') { typeB++; kind = 'B' }
    else kind = 'same'
    const message = kind === 'A' ? `Index ${i}: s has 0 and t has 1, a type A mismatch.`
      : kind === 'B' ? `Index ${i}: s has 1 and t has 0, a type B mismatch.`
      : `Index ${i}: the bits already agree.`
    frames.push({ pythonLine: at('if s[i] == \'0\' and t[i] == \'1\''), phase: 'scan', activeLine: L('for each index'), index: i, mixed: -1, best: null, kind, message })
  }
  const mixedCost = Math.min(swapCost, 2 * flipCost)
  const sameCost = Math.min(2 * flipCost, crossCost + swapCost)
  frames.push({ pythonLine: at('mixed_cost = min'), phase: 'costs', activeLine: L('mixed pair cost = min'), index: -1, mixed: -1, best: null, typeA, typeB, mixedCost, sameCost, message: `Mixed pair costs ${mixedCost}; same-type pair costs ${sameCost}.` })
  frames.push({ pythonLine: at('best = None'), phase: 'costs', activeLine: L('best = nothing'), index: -1, mixed: -1, best: null, typeA, typeB, mixedCost, sameCost, message: 'No candidate is recorded yet.' })
  let best = null
  for (let mixed = 0; mixed <= Math.min(typeA, typeB); mixed++) {
    const a = typeA - mixed
    const b = typeB - mixed
    let cost = mixed * mixedCost
    cost += Math.floor(a / 2) * sameCost + (a % 2) * flipCost
    cost += Math.floor(b / 2) * sameCost + (b % 2) * flipCost
    frames.push({ pythonLine: at('cost = mixed * mixed_cost'), phase: 'try', activeLine: L('cost = m times mixed pair cost'), index: -1, mixed, best, typeA, typeB, cost, message: `Pair ${mixed} mixed mismatch${mixed === 1 ? '' : 'es'} and price the rest: total ${cost}.` })
    if (best === null || cost < best) {
      best = cost
      frames.push({ pythonLine: at('best = cost'), phase: 'best', activeLine: L('keep the cheapest'), index: -1, mixed, best, typeA, typeB, cost, message: `New best is ${best}.` })
    }
  }
  frames.push({ pythonLine: at('return best'), phase: 'done', activeLine: L('return best'), index: -1, mixed: -1, best, typeA, typeB, message: `Minimum cost is ${best}.` })
  return { input: { s, t, flipCost, swapCost, crossCost }, result: best, frames }
}

export const code = `minimum cost to make s and t equal
  count type A mismatches (s 0, t 1) and type B mismatches (s 1, t 0)
  for each index i
    if the bits at i disagree, count it as type A or type B
  mixed pair cost = min(swap cost, 2 times flip cost)
  same-type pair cost = min(2 times flip cost, cross cost plus swap cost)
  best = nothing
  for each number of mixed pairs m from 0 to min(type A, type B)
    left over: a = type A minus m, b = type B minus m
    cost = m times mixed pair cost
    add pairs of same type and a single flip for an odd one, for a and for b
    keep the cheapest cost in best
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_cost_to_equal(s, t, flip_cost, swap_cost, cross_cost):
    type_a = 0
    type_b = 0
    for i in range(len(s)):
        if s[i] == '0' and t[i] == '1':
            type_a += 1
        elif s[i] == '1' and t[i] == '0':
            type_b += 1
    mixed_cost = min(swap_cost, 2 * flip_cost)
    same_cost = min(2 * flip_cost, cross_cost + swap_cost)
    best = None
    for mixed in range(min(type_a, type_b) + 1):
        a = type_a - mixed
        b = type_b - mixed
        cost = mixed * mixed_cost
        cost += (a // 2) * same_cost + (a % 2) * flip_cost
        cost += (b // 2) * same_cost + (b % 2) * flip_cost
        if best is None or cost < best:
            best = cost
    return best
`
const PY_LINES = python.split('\n')
const at = s => PY_LINES.findIndex(line => line.includes(s)) + 1
