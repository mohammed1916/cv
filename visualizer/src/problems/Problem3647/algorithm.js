// Maximum Weight in Two Bags. Each item goes into bag 1, into bag 2, or stays unused.
// Each bag has its own capacity. A table of reachable (load in bag 1, load in bag 2)
// pairs is extended one item at a time; the answer is the largest reachable total.

const MAX_ITEMS = 8
const MAX_ITEM = 9
const MAX_CAPACITY = 12

const CODE_TEXT = [
  'FUNCTION maxPacked(items, w1, w2)',
  '    reach ← (w1 + 1) by (w2 + 1) grid of false; reach[0][0] ← true',
  '    FOR each item x',
  '        next ← copy of reach',
  '        FOR each load pair (a, b) that is reachable',
  '            IF a + x ≤ w1 THEN next[a + x][b] ← true',
  '            IF b + x ≤ w2 THEN next[a][b + x] ← true',
  '        reach ← next',
  '    RETURN largest a + b with reach[a][b] true',
]

const PY = [
  'def max_packed(items, w1, w2):',
  '    reach = [[False] * (w2 + 1) for _ in range(w1 + 1)]',
  '    reach[0][0] = True',
  '    for x in items:',
  '        nxt = [row[:] for row in reach]',
  '        for a in range(w1 + 1):',
  '            for b in range(w2 + 1):',
  '                if reach[a][b]:',
  '                    if a + x <= w1:',
  '                        nxt[a + x][b] = True',
  '                    if b + x <= w2:',
  '                        nxt[a][b + x] = True',
  '        reach = nxt',
  '    return max(a + b for a in range(w1 + 1) for b in range(w2 + 1) if reach[a][b])',
  '',
  'if __name__ == "__main__":',
  '    import sys, json',
  '    data = json.loads(sys.stdin.read())',
  '    print(json.dumps(max_packed(data["items"], data["w1"], data["w2"])))',
]

const PHASES = [
  { id: 'setup', label: 'Empty bags', description: 'Only the empty pair of loads is reachable.' },
  { id: 'item', label: 'Item', description: 'Try each bag for the next item.' },
  { id: 'place', label: 'Place', description: 'A new load pair becomes reachable.' },
  { id: 'done', label: 'Result', description: 'Report the largest reachable total.' },
]

export const code = CODE_TEXT.map((text, index) => ({ line: index + 1, text }))
export const python = PY.join('\n')
export const phases = PHASES

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = PY.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || Array.isArray(data) || typeof data !== 'object') throw new Error('Use an object with items, w1 and w2.')
  const { items, w1, w2 } = data
  if (!Array.isArray(items) || items.length < 1 || items.length > MAX_ITEMS) throw new Error(`items has 1 to ${MAX_ITEMS} weights.`)
  if (!items.every(v => Number.isInteger(v) && v >= 1 && v <= MAX_ITEM)) throw new Error(`Each weight is an integer from 1 to ${MAX_ITEM}.`)
  for (const w of [w1, w2]) if (!Number.isInteger(w) || w < 0 || w > MAX_CAPACITY) throw new Error(`Capacities are integers from 0 to ${MAX_CAPACITY}.`)
  return { items, w1, w2 }
}

function cloneGrid(grid) { return grid.map(row => [...row]) }

export function buildTrace({ items, w1, w2 }) {
  let reach = Array.from({ length: w1 + 1 }, () => Array(w2 + 1).fill(false))
  reach[0][0] = true
  const frames = [{ pythonLine: P('reach[0][0] = True'), phase: 'setup', activeLine: L('reach ← (w1 + 1)'), reach: cloneGrid(reach), item: null, placed: null, message: `Both bags are empty. Capacities are ${w1} and ${w2}.` }]
  items.forEach((x, index) => {
    const next = cloneGrid(reach)
    let added = 0
    frames.push({ pythonLine: P('for x in items'), phase: 'item', activeLine: L('FOR each item x'), reach: cloneGrid(reach), item: x, index, placed: null, message: `Item ${index} weighs ${x}. Try it in bag 1, bag 2, or leave it out.` })
    for (let a = 0; a <= w1; a++) {
      for (let b = 0; b <= w2; b++) {
        if (!reach[a][b]) continue
        if (a + x <= w1 && !next[a + x][b]) { next[a + x][b] = true; added++; frames.push({ pythonLine: P('nxt[a + x][b] = True'), phase: 'place', activeLine: L('IF a + x ≤ w1'), reach: cloneGrid(next), item: x, index, placed: [a + x, b], message: `Bag 1 can reach load ${a + x} with bag 2 at ${b}.` }) }
        if (b + x <= w2 && !next[a][b + x]) { next[a][b + x] = true; added++; frames.push({ pythonLine: P('nxt[a][b + x] = True'), phase: 'place', activeLine: L('IF b + x ≤ w2'), reach: cloneGrid(next), item: x, index, placed: [a, b + x], message: `Bag 2 can reach load ${b + x} with bag 1 at ${a}.` }) }
      }
    }
    if (added === 0) frames.push({ pythonLine: P('reach = nxt'), phase: 'item', activeLine: L('reach ← next'), reach: cloneGrid(next), item: x, index, placed: null, message: `Item ${index} adds no new load pair.` })
    reach = next
  })
  let best = 0
  for (let a = 0; a <= w1; a++) for (let b = 0; b <= w2; b++) if (reach[a][b]) best = Math.max(best, a + b)
  frames.push({ pythonLine: P('return max'), phase: 'done', activeLine: L('RETURN largest'), reach: cloneGrid(reach), item: null, placed: null, best, message: `The largest reachable total is ${best}.` })
  return { input: { items, w1, w2 }, result: best, frames }
}
