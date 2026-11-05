// LeetCode 2212: Maximum Points in an Archery Competition.
// Bob scores section k (0 to 11) for k points if he lands at least alice[k] + 1 arrows there. Choose which sections
// to win with a 0/1 knapsack: a section costs alice[k] + 1 arrows and is worth k points. Any arrows Bob has left
// over go to section 0, which costs nothing in points.

const SECTIONS = 12
const MAX_ARROWS = 12

export function parseInput(text) {
  let spec
  try { spec = JSON.parse(text) } catch { throw new Error('Use JSON like {"numArrows":5,"aliceArrows":[0,0,0,0,0,0,0,0,0,0,1,4]}.') }
  if (!spec || !Number.isInteger(spec.numArrows) || !Array.isArray(spec.aliceArrows)) throw new Error('Give numArrows and an aliceArrows array.')
  if (spec.numArrows < 1 || spec.numArrows > MAX_ARROWS) throw new Error(`numArrows is from 1 to ${MAX_ARROWS} in this visualization.`)
  if (spec.aliceArrows.length !== SECTIONS || !spec.aliceArrows.every(v => Number.isInteger(v) && v >= 0)) throw new Error(`aliceArrows has ${SECTIONS} non-negative integers.`)
  if (spec.aliceArrows.reduce((a, b) => a + b, 0) !== spec.numArrows) throw new Error('aliceArrows must add up to numArrows.')
  return { numArrows: spec.numArrows, aliceArrows: spec.aliceArrows }
}

export const code = `FUNCTION maximumBobPoints(numArrows, aliceArrows)
    best ← array of numArrows + 1 zeros (points with at most j arrows)
    take ← matrix of booleans, 12 by numArrows + 1
    FOR k from 1 to 11
        cost ← aliceArrows[k] + 1
        FOR j from numArrows down to cost
            IF best[j - cost] + k > best[j] THEN
                best[j] ← best[j - cost] + k
                take[k][j] ← true
    rebuild bob by walking back from j = numArrows through take
    bob[0] ← numArrows minus arrows used
    RETURN bob`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def maximum_bob_points(num_arrows, alice_arrows):
    best = [0] * (num_arrows + 1)
    take = [[False] * (num_arrows + 1) for _ in range(12)]
    for k in range(1, 12):
        cost = alice_arrows[k] + 1
        for j in range(num_arrows, cost - 1, -1):
            if best[j - cost] + k > best[j]:
                best[j] = best[j - cost] + k
                take[k][j] = True
    bob = [0] * 12
    j = num_arrows
    for k in range(11, 0, -1):
        if take[k][j]:
            cost = alice_arrows[k] + 1
            bob[k] = cost
            j -= cost
    bob[0] = j
    return bob
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Budget', description: 'Bob has numArrows arrows. Each section has a price in arrows.' },
  { id: 'section', label: 'Sections', description: 'For each section, decide whether winning it is worth the arrows.' },
  { id: 'rebuild', label: 'Rebuild', description: 'Walk back through the decisions to find Bob\'s arrows.' },
  { id: 'done', label: 'Result', description: 'Bob\'s arrow distribution and his points.' },
]

export function buildTrace({ numArrows, aliceArrows }) {
  const best = Array(numArrows + 1).fill(0)
  const take = Array.from({ length: SECTIONS }, () => Array(numArrows + 1).fill(false))
  const frames = []
  const push = (phase, k, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, index: k, k, activeLine, pythonLine, message, numArrows, aliceArrows, best: best.slice(), take: take.map(r => r.slice()), ...extra,
  })
  push('start', 0, L('best ← array'), P('best = [0]'), `Bob has ${numArrows} arrows. Alice's arrows: ${aliceArrows.join(', ')}.`)
  for (let k = 1; k < SECTIONS; k++) {
    const cost = aliceArrows[k] + 1
    let changed = 0
    for (let j = numArrows; j >= cost; j--) {
      if (best[j - cost] + k > best[j]) { best[j] = best[j - cost] + k; take[k][j] = true; changed++ }
    }
    push('section', k, L('cost ← aliceArrows'), P('cost = alice_arrows[k] + 1'),
      cost > numArrows ? `Section ${k} needs ${cost} arrows, more than Bob has, so it is skipped.`
        : `Section ${k} costs ${cost} arrows for ${k} points. It improves ${changed} entr${changed === 1 ? 'y' : 'ies'} of the table. Best with ${numArrows} arrows: ${best[numArrows]}.`,
      { cost, changed })
  }
  const bob = Array(SECTIONS).fill(0)
  let j = numArrows
  for (let k = SECTIONS - 1; k >= 1; k--) {
    if (take[k][j]) { const cost = aliceArrows[k] + 1; bob[k] = cost; j -= cost }
  }
  bob[0] = j
  const points = bob.reduce((sum, a, k) => (k > 0 && a >= aliceArrows[k] + 1 ? sum + k : sum), 0)
  push('rebuild', -1, L('rebuild bob'), P('bob = [0] * 12'), `Bob's distribution: ${bob.join(', ')}. Section 0 takes the leftover ${bob[0]} arrow(s).`, { bob: bob.slice(), points })
  push('done', -1, L('RETURN bob'), P('return bob'), `Bob scores ${points} points.`, { bob: bob.slice(), points, result: bob.slice() })
  return { input: { numArrows, aliceArrows }, result: bob.slice(), frames }
}
