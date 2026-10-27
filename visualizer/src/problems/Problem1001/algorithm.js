export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"n": 5, "lamps": [[0, 0]], "queries": [[1, 1]]}.')
  const { n, lamps, queries } = input
  if (!Number.isInteger(n) || n < 1 || n > 8) throw new Error('n must be an integer from 1 to 8.')
  const cell = p => Array.isArray(p) && p.length === 2 && p.every(v => Number.isInteger(v) && v >= 0 && v < n)
  if (!Array.isArray(lamps) || lamps.length > 10 || !lamps.every(cell)) throw new Error('lamps is a list of up to 10 [row, col] cells inside the grid.')
  if (new Set(lamps.map(p => p.join(','))).size !== lamps.length) throw new Error('lamps must be distinct cells.')
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 10 || !queries.every(cell)) throw new Error('queries is a list of 1 to 10 [row, col] cells inside the grid.')
  return { n, lamps, queries }
}

export function buildTrace({ n, lamps, queries }) {
  const rows = new Map()
  const cols = new Map()
  const diag = new Map()
  const anti = new Map()
  const lampSet = new Set()
  const answer = []
  const bump = (map, key, delta) => map.set(key, (map.get(key) ?? 0) + delta)
  const snapshot = () => [...lampSet].map(key => key.split(',').map(Number))
  const frames = [{ phase: 'start', activeLine: L('def gridIllumination'), on: [], query: null, cells: [], answer: [], message: `Grid ${n} by ${n}. Count the lamps on each row, column, diagonal and anti-diagonal.` }]

  for (const [r, c] of lamps) {
    lampSet.add(`${r},${c}`)
    bump(rows, r, 1)
    bump(cols, c, 1)
    bump(diag, r - c, 1)
    bump(anti, r + c, 1)
    frames.push({ phase: 'index', activeLine: L('lampSet.add'), on: snapshot(), query: null, cells: [], answer: [...answer], message: `Lamp (${r},${c}) lights row ${r}, column ${c}, diagonal ${r - c} and anti-diagonal ${r + c}.` })
  }

  for (const [r, c] of queries) {
    const reasons = [['row', rows.get(r) ?? 0], ['column', cols.get(c) ?? 0], ['diagonal', diag.get(r - c) ?? 0], ['anti-diagonal', anti.get(r + c) ?? 0]]
    const hit = reasons.find(([, count]) => count > 0)
    answer.push(hit ? 1 : 0)
    frames.push({ phase: 'query', activeLine: L('ans.append'), on: snapshot(), query: [r, c], cells: [], answer: [...answer], message: hit ? `Query (${r},${c}) is lit by a lamp in its ${hit[0]}, so it records 1.` : `Query (${r},${c}) has no lamp in its row, column, diagonal or anti-diagonal, so it records 0.` })

    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr
        const nc = c + dc
        const key = `${nr},${nc}`
        if (!lampSet.has(key)) continue
        lampSet.delete(key)
        bump(rows, nr, -1)
        bump(cols, nc, -1)
        bump(diag, nr - nc, -1)
        bump(anti, nr + nc, -1)
        frames.push({ phase: 'off', activeLine: L('lampSet.remove'), on: snapshot(), query: [r, c], cells: [[nr, nc]], answer: [...answer], message: `Lamp (${nr},${nc}) is in the 3x3 block around (${r},${c}), so it goes off.` })
      }
    }
  }

  frames.push({ phase: 'done', activeLine: L('return ans'), on: snapshot(), query: null, cells: [], answer: [...answer], message: `Answers: [${answer.join(', ')}].` })
  return { input: { n, lamps, queries }, result: answer, frames }
}

export const code = `def gridIllumination(n, lamps, queries):
    rows, cols, diag, anti = Counter(), Counter(), Counter(), Counter()
    lampSet = set()
    for r, c in lamps:
        lampSet.add((r, c))
        rows[r] += 1
        cols[c] += 1
        diag[r - c] += 1
        anti[r + c] += 1
    ans = []
    for r, c in queries:
        ans.append(1 if rows[r] or cols[c] or diag[r - c] or anti[r + c] else 0)
        for dr in (-1, 0, 1):
            for dc in (-1, 0, 1):
                nr, nc = r + dr, c + dc
                if (nr, nc) in lampSet:
                    lampSet.remove((nr, nc))
                    rows[nr] -= 1
                    cols[nc] -= 1
                    diag[nr - nc] -= 1
                    anti[nr + nc] -= 1
    return ans`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
