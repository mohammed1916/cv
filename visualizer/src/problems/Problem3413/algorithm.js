const MAX_POSITION = 60
const MAX_BAGS = 8

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.bags) || !Number.isInteger(data.k)) throw new Error('Use an object like {"bags":[[1,3,2]],"k":2}.')
  if (data.bags.length < 1 || data.bags.length > MAX_BAGS) throw new Error(`Use 1 to ${MAX_BAGS} bags.`)
  if (data.k < 1 || data.k > MAX_POSITION) throw new Error(`k must be between 1 and ${MAX_POSITION}.`)
  const bags = data.bags.map(bag => {
    if (!Array.isArray(bag) || bag.length !== 3 || !bag.every(Number.isInteger)) throw new Error('Each bag is [start, end, coins] with integers.')
    const [l, r, c] = bag
    if (l < 1 || r > MAX_POSITION || l > r || c < 1 || c > 20) throw new Error(`Positions run from 1 to ${MAX_POSITION} with start <= end, and coins are 1 to 20.`)
    return [l, r, c]
  })
  const sorted = [...bags].sort((a, b) => a[0] - b[0])
  for (let i = 1; i < sorted.length; i++) if (sorted[i][0] <= sorted[i - 1][1]) throw new Error('Bags must not overlap.')
  return { bags, k: data.k }
}

export function buildTrace({ bags, k }) {
  const starts = [...new Set(bags.flatMap(([l, r]) => [l - k, l - k + 1, l, r - k + 1, r + 1]))].sort((a, b) => a - b)
  const frames = [{ phase: 'collect', activeLine: L('add start - k'), start: null, end: null, coins: 0, best: 0, message: `Collected ${starts.length} candidate window starts from the bag edges.` }]
  let best = 0
  for (const s of starts) {
    const end = s + k - 1
    const coins = bags.reduce((total, [l, r, c]) => {
      const overlap = Math.min(r, end) - Math.max(l, s) + 1
      return overlap > 0 ? total + overlap * c : total
    }, 0)
    if (coins > best) best = coins
    frames.push({ phase: 'candidate', activeLine: L('total the coins'), start: s, end, coins, best, message: `Window ${s} to ${end} holds ${coins} coins. Best so far: ${best}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return best'), start: null, end: null, coins: null, best, message: `Most coins from ${k} consecutive bags: ${best}.` })
  return { input: { bags, k }, result: best, starts, frames }
}

export const code = `most coins from k consecutive bags:
  set candidates to an empty list
  for each bag [start, end, coins]:
    add start - k, start - k + 1, start, end - k + 1 and end + 1 to candidates
  remove duplicates from candidates and sort them
  set best to 0
  for each candidate window start s:
    the window covers positions s through s + k - 1
    total the coins of every bag that overlaps the window
    if the total is more than best then set best to the total
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def maximum_coins(bags, k):
    candidates = set()
    for start, end, coins in bags:
        candidates.update([start - k, start - k + 1, start, end - k + 1, end + 1])
    best = 0
    for s in sorted(candidates):
        total = 0
        for start, end, coins in bags:
            overlap = min(end, s + k - 1) - max(start, s) + 1
            if overlap > 0:
                total += overlap * coins
        best = max(best, total)
    return best
`
