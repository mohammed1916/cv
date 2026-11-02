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

// Price of one tested number of mixed pairs, split into the parts a learner can check.
function breakdownFor(mixed, typeA, typeB, mixedCost, sameCost, flipCost) {
  const a = typeA - mixed
  const b = typeB - mixed
  const mixedPart = mixed * mixedCost
  const aPairs = Math.floor(a / 2)
  const aSingle = a % 2
  const bPairs = Math.floor(b / 2)
  const bSingle = b % 2
  const aPart = aPairs * sameCost + aSingle * flipCost
  const bPart = bPairs * sameCost + bSingle * flipCost
  return { mixed, a, b, mixedPart, aPairs, aSingle, bPairs, bSingle, aPart, bPart, total: mixedPart + aPart + bPart }
}

export function buildTrace({ s, t, flipCost, swapCost, crossCost }) {
  const frames = []
  const n = s.length
  // Classification of every index, computed up front but revealed only as the scan reaches it.
  const allKinds = Array.from({ length: n }, (_, i) => {
    if (s[i] === '0' && t[i] === '1') return 'A'
    if (s[i] === '1' && t[i] === '0') return 'B'
    return 'same'
  })
  const revealed = i => allKinds.map((k, j) => (j <= i ? k : null))
  const typeA = allKinds.filter(k => k === 'A').length
  const typeB = allKinds.filter(k => k === 'B').length
  const mixedCost = Math.min(swapCost, 2 * flipCost)
  const sameCost = Math.min(2 * flipCost, crossCost + swapCost)
  const counts = { typeA: 0, typeB: 0 }

  frames.push({ pythonLine: at('type_a = 0'), phase: 'start', activeLine: L('count type A mismatches'), index: -1, mixed: -1, best: null, kinds: revealed(-1), counts: { ...counts }, tested: [], winner: null, message: 'Start with no mismatches counted. Every position is still unprocessed.' })
  for (let i = 0; i < n; i++) {
    const kind = allKinds[i]
    if (kind === 'A') counts.typeA++
    if (kind === 'B') counts.typeB++
    const message = kind === 'A' ? `Index ${i}: s has 0 and t has 1, so it is a type A mismatch.`
      : kind === 'B' ? `Index ${i}: s has 1 and t has 0, so it is a type B mismatch.`
      : `Index ${i}: the bits already agree, so it is not a mismatch.`
    frames.push({ pythonLine: at(kind === 'B' ? 'elif s[i] == \'1\' and t[i] == \'0\'' : 'if s[i] == \'0\' and t[i] == \'1\''), phase: 'scan', activeLine: L('for each index'), index: i, mixed: -1, best: null, kind, kinds: revealed(i), counts: { ...counts }, tested: [], winner: null, message })
  }
  frames.push({ pythonLine: at('mixed_cost = min'), phase: 'costs', activeLine: L('mixed pair cost = min'), index: -1, mixed: -1, best: null, kinds: revealed(n), counts: { typeA, typeB }, typeA, typeB, mixedCost, sameCost, tested: [], winner: null, message: `Mixed pair costs min(${swapCost}, 2 times ${flipCost}) = ${mixedCost}; same-type pair costs min(2 times ${flipCost}, ${crossCost} plus ${swapCost}) = ${sameCost}.` })
  frames.push({ pythonLine: at('best = None'), phase: 'costs', activeLine: L('best = nothing'), index: -1, mixed: -1, best: null, kinds: revealed(n), counts: { typeA, typeB }, typeA, typeB, mixedCost, sameCost, tested: [], winner: null, message: 'No candidate is recorded yet.' })

  let best = null
  let winner = null
  const tested = []
  for (let mixed = 0; mixed <= Math.min(typeA, typeB); mixed++) {
    const breakdown = breakdownFor(mixed, typeA, typeB, mixedCost, sameCost, flipCost)
    const cost = breakdown.total
    tested.push(breakdown)
    frames.push({ pythonLine: at('cost = mixed * mixed_cost'), phase: 'try', activeLine: L('cost = m times mixed pair cost'), index: -1, mixed, best, typeA, typeB, mixedCost, sameCost, cost, breakdown, kinds: revealed(n), counts: { typeA, typeB }, tested: tested.slice(), winner, message: `Try ${mixed} mixed pair${mixed === 1 ? '' : 's'}: ${breakdown.mixedPart} for mixed pairs, ${breakdown.aPart} for the ${breakdown.a} left of type A, ${breakdown.bPart} for the ${breakdown.b} left of type B, total ${cost}.` })
    if (best === null || cost < best) {
      best = cost
      winner = breakdown
      frames.push({ pythonLine: at('best = cost'), phase: 'best', activeLine: L('keep the cheapest'), index: -1, mixed, best, typeA, typeB, mixedCost, sameCost, cost, breakdown, kinds: revealed(n), counts: { typeA, typeB }, tested: tested.slice(), winner, message: `New best is ${best} with ${mixed} mixed pair${mixed === 1 ? '' : 's'}.` })
    }
  }
  frames.push({ pythonLine: at('return best'), phase: 'done', activeLine: L('return best'), index: -1, mixed: winner.mixed, best, typeA, typeB, mixedCost, sameCost, kinds: revealed(n), counts: { typeA, typeB }, tested: tested.slice(), winner, message: `Minimum cost is ${best}, from ${winner.mixed} mixed pair${winner.mixed === 1 ? '' : 's'}.` })
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
const L = s => {
  const line = code.findIndex(c => c.text.includes(s)) + 1
  if (line === 0) throw new Error(`Missing pseudocode line: ${s}`)
  return line
}

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
const at = s => {
  const line = PY_LINES.findIndex(line => line.includes(s)) + 1
  if (line === 0) throw new Error(`Missing python line: ${s}`)
  return line
}
