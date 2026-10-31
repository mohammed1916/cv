export function parseInput(text) {
  const data = JSON.parse(text)
  const { n, blacklist, draws } = data ?? {}
  if (!Number.isInteger(n) || n < 1 || n > 1000) throw new Error('n must be an integer from 1 to 1,000.')
  if (!Array.isArray(blacklist) || blacklist.length >= n || new Set(blacklist).size !== blacklist.length || blacklist.some(v => !Number.isInteger(v) || v < 0 || v >= n)) throw new Error('blacklist must hold distinct values in [0, n), fewer than n of them.')
  if (!Array.isArray(draws) || draws.length < 1 || draws.length > 200) throw new Error('draws must be 1–200 numbers, each a random draw in the allowed range.')
  const m = n - blacklist.length
  if (draws.some(r => !Number.isInteger(r) || r < 0 || r >= m)) throw new Error(`Each draw must be an integer from 0 to ${m - 1}.`)
  return { n, blacklist, draws }
}

// Blacklisted values below m = n − |blacklist| are remapped to whitelisted values at or above m, so a single
// draw in [0, m) always maps to an allowed value without rejection sampling.
export function buildTrace({ n, blacklist, draws }) {
  const m = n - blacklist.length
  const black = new Set(blacklist)
  const mapping = new Map()
  const tail = []
  for (let v = m; v < n; v++) if (!black.has(v)) tail.push(v)
  let t = 0
  for (const b of blacklist) if (b < m) mapping.set(b, tail[t++])
  const frames = [{ phase: 'start', pythonLine: 10, draw: null, pick: null, mapping: [...mapping.entries()], activeLine: L('m = n minus'), message: `Map ${blacklist.length} blacklisted value(s) below ${m} to whitelisted values in [${m}, ${n}).` }]
  const results = []
  draws.forEach((r, i) => {
    const pick = mapping.has(r) ? mapping.get(r) : r
    results.push(pick)
    frames.push({ phase: 'draw', pythonLine: 13, index: i, draw: r, pick, mapping: [...mapping.entries()], result: results.slice(), activeLine: mapping.has(r) ? L('if r is a key in mapping') : L('otherwise, pick = r'), message: mapping.has(r) ? `Draw ${r} is blacklisted; use ${pick}.` : `Draw ${r} is allowed.` })
  })
  frames.push({ phase: 'done', pythonLine: 14, draw: null, pick: null, mapping: [...mapping.entries()], result: results, activeLine: L('return results'), message: `Picks: [${results.join(', ')}].` })
  return { input: { n, blacklist, draws }, result: results, mapping, frames }
}

export const code = `pickWithBlacklist(n, blacklist, draws):
  m = n minus the count of blacklist
  black = set of blacklist values
  tail = the values from m to n - 1 that are not in black, in order
  mapping = empty map
  for each b in blacklist below m, map b to the next value taken from tail
  results = empty list
  for each draw r
    if r is a key in mapping, pick = mapping[r]
    otherwise, pick = r
    append pick to results
  return results`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def random_pick_with_blacklist(n, blacklist, draws):
    m = n - len(blacklist)
    black = set(blacklist)
    tail = [v for v in range(m, n) if v not in black]
    mapping = {}
    t = 0
    for b in blacklist:
        if b < m:
            mapping[b] = tail[t]
            t += 1
    results = []
    for r in draws:
        results.append(mapping[r] if r in mapping else r)
    return results`
