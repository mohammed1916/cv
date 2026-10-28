export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data.s !== 'string') throw new Error('Use {"s": "0101..."} with a binary string.')
  if (data.s.length < 1 || data.s.length > 12) throw new Error('s must have 1 to 12 characters for the visualization.')
  if (!/^[01]+$/.test(data.s)) throw new Error('s may contain only 0 and 1.')
  return { s: data.s }
}

const PATTERNS = ['011', '110']

export function buildTrace(input) {
  const { s } = input
  let best = new Map([['0,0', 0]])
  const frames = [{ phase: 'start', activeLine: L('let best be'), i: -1, best: [...best], result: null, message: 'Track how much of 011 and of 110 has been matched, as a pair, with the fewest flips so far.' }]
  for (let i = 0; i < s.length; i++) {
    const next = new Map()
    for (const [key, cost] of best) {
      const [a, b] = key.split(',').map(Number)
      for (const c of ['0', '1']) {
        const flipCost = cost + (c === s[i] ? 0 : 1)
        const na = a + (c === PATTERNS[0][a] ? 1 : 0)
        const nb = b + (c === PATTERNS[1][b] ? 1 : 0)
        if (na === 3 || nb === 3) continue
        const nk = `${na},${nb}`
        if (!next.has(nk) || flipCost < next.get(nk)) next.set(nk, flipCost)
      }
    }
    best = next
    frames.push({ phase: 'scan', activeLine: L('for each character ch'), i, best: [...best], result: null, message: `Position ${i} is ${s[i]}. ${best.size} progress pairs remain, and the cheapest costs ${Math.min(...best.values())}.` })
  }
  const result = Math.min(...best.values())
  frames.push({ phase: 'done', activeLine: L('return the smallest cost'), i: s.length, best: [...best], result, message: `Fewest flips to make the string coherent: ${result}.` })
  return { input, result, frames }
}

export const code = `minimum flips to make the binary string coherent
  let best be a table from matcher states to the fewest flips, starting with state (0, 0) at cost 0
  for each character ch of s in order
    let next be an empty table
    for each state with its cost
      for each new character c in 0 and 1
        let cost be the old cost plus 1 if c differs from ch
        advance the progress for 011 and for 110 when c matches the next letter
        if neither progress is complete then
          keep the smaller cost for the new state in next
    set best to next
  return the smallest cost in best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimum_flips_to_make_coherent(s):
    patterns = ['011', '110']
    best = {(0, 0): 0}
    for ch in s:
        nxt = {}
        for (a, b), cost in best.items():
            for c in '01':
                flip_cost = cost + (1 if c != ch else 0)
                na = a + (1 if c == patterns[0][a] else 0)
                nb = b + (1 if c == patterns[1][b] else 0)
                if na == 3 or nb == 3:
                    continue
                if (na, nb) not in nxt or flip_cost < nxt[(na, nb)]:
                    nxt[(na, nb)] = flip_cost
        best = nxt
    return min(best.values())
`
