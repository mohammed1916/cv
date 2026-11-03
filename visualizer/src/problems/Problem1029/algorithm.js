export const phases = [
  { id: 'split', label: 'Measure', description: 'Each person has two costs. Their difference shows how much more they cost in city B than in city A.' },
  { id: 'sort', label: 'Sort', description: 'Order people by that difference, so the people most favoured by city A come first.' },
  { id: 'assign', label: 'Assign', description: 'The first half goes to city A and the rest to city B, each at its own cost.' },
  { id: 'done', label: 'Total', description: 'The running total is the minimum possible cost.' },
]

export function parseInput(text) {
  const people = JSON.parse(text)
  if (!Array.isArray(people) || people.length < 2 || people.length > 40 || people.length % 2 !== 0) throw new Error('Enter an even number (2–40) of [costA, costB] pairs.')
  if (people.some(p => !Array.isArray(p) || p.length !== 2 || p.some(v => !Number.isInteger(v) || v < 1 || v > 1000))) throw new Error('Each pair needs two integer costs from 1 to 1000.')
  return people
}

export function buildTrace(people) {
  const n = people.length / 2
  const frames = []
  const ordered = people.map(([a, b], index) => ({ index, a, b, diff: a - b }))
  frames.push({ phase: 'split', activeLine: 2, message: `${people.length} people, so each city receives ${n}. Every difference is A minus B.`, snapshot: { ordered: [], k: -1, n, total: 0 } })
  ordered.sort((x, y) => x.diff - y.diff || x.index - y.index)
  frames.push({ phase: 'sort', activeLine: 3, message: 'Sorted by difference: the smallest values are the people who are cheapest to send to A.', snapshot: { ordered: ordered.map(p => ({ ...p, city: null })), k: -1, n, total: 0 } })
  let total = 0
  const assigned = []
  for (let k = 0; k < people.length; k++) {
    const toA = k < n
    const cost = toA ? ordered[k].a : ordered[k].b
    total += cost
    assigned.push({ ...ordered[k], city: toA ? 'A' : 'B' })
    frames.push({
      phase: 'assign', activeLine: 6,
      message: `Person ${ordered[k].index + 1} (difference ${ordered[k].diff}) goes to city ${toA ? 'A' : 'B'} for ${cost}. Running total ${total}.`,
      snapshot: { ordered: ordered.map((p, idx) => ({ ...p, city: idx < assigned.length ? assigned[idx].city : null })), k, n, total },
    })
  }
  frames.push({ phase: 'done', activeLine: 7, message: `Minimum total cost: ${total}.`, snapshot: { ordered: assigned, k: people.length, n, total } })
  return { input: people, result: total, frames }
}

export const code = [
  'FUNCTION minCost(people)',
  '    n ← length(people) / 2',
  '    sort people by (costA − costB) ascending',
  '    total ← 0',
  '    FOR k FROM 0 TO 2n − 1',
  '        total ← total + (costA if k < n else costB)',
  '    RETURN total',
]

export const python = `def min_cost(people):
    n = len(people) // 2
    ordered = sorted(people, key=lambda p: p[0] - p[1])
    total = 0
    for k in range(2 * n):
        total += ordered[k][0] if k < n else ordered[k][1]
    return total`

export const pythonLineMap = { 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7 }
