const LOWER = /^[a-z]+$/
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || typeof input.caption !== 'string') throw new Error('Use an object with a caption string.')
  const { caption } = input
  if (caption.length < 1 || caption.length > 12 || !LOWER.test(caption)) throw new Error('caption has 1 to 12 lowercase letters.')
  return { caption }
}

// State after a prefix: last letter index (26 = none) and run length capped at 3.
export function buildTrace({ caption }) {
  const n = caption.length
  const frames = []
  const cost = (i, d) => Math.abs(d - (caption.charCodeAt(i) - 97))
  const memo = Array.from({ length: n + 1 }, () => Array.from({ length: 27 }, () => Array(4).fill(null)))
  for (let c = 0; c <= 26; c++) for (let k = 0; k <= 3; k++) memo[n][c][k] = k === 3 ? { cost: 0, text: '', choice: -1 } : null
  for (let i = n - 1; i >= 0; i--) {
    for (let c = 0; c <= 26; c++) for (let k = 0; k <= 3; k++) {
      let best = null
      for (let d = 0; d < 26; d++) {
        if (k > 0 && k < 3 && d !== c) continue
        const nextRun = d === c && k > 0 ? Math.min(k + 1, 3) : 1
        const rest = memo[i + 1][d][nextRun]
        if (!rest) continue
        const total = rest.cost + cost(i, d)
        const text = ALPHABET[d] + rest.text
        if (!best || total < best.cost || (total === best.cost && text < best.text)) best = { cost: total, text, choice: d }
      }
      memo[i][c][k] = best
    }
    frames.push({ pythonLine: 5, phase: 'fill', activeLine: L('for i from the last'), at: i, text: '', message: `Index ${i}: cheapest finish stored for every (last letter, run) state.` })
  }
  const result = n < 3 ? '' : memo[0][26][0].text
  if (n < 3) {
    frames.push({ pythonLine: 2, phase: 'done', activeLine: L('shorter than 3 letters'), at: -1, text: '', message: 'Fewer than 3 letters can never form runs of 3, so there is no good caption.' })
    return { input: { caption }, frames, result }
  }
  let c = 26, k = 0, built = ''
  for (let i = 0; i < n; i++) {
    const choice = memo[i][c][k].choice
    built += ALPHABET[choice]
    k = choice === c && k > 0 ? Math.min(k + 1, 3) : 1
    c = choice
    frames.push({ pythonLine: 9, phase: 'walk', activeLine: L('take the stored choice'), at: i, text: built, message: `Position ${i} becomes ${ALPHABET[choice]}.` })
  }
  frames.push({ pythonLine: 11, phase: 'done', activeLine: L('return the caption'), at: -1, text: built, message: `Cheapest good caption costs ${memo[0][26][0].cost} operations.` })
  return { input: { caption }, frames, result }
}

export const code = `if the caption is shorter than 3 letters, return ""
for i from the last index down to 0
  for each (last letter, run) state
    for each next letter d
      skip d if the current run is short and d differs
      cost = steps from caption[i] to d plus the best finish
    keep the cheapest finish, then the smallest text
walk from the start and take the stored choice at each index
return the caption`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_cost_good_caption(caption):
    n = len(caption)
    if n < 3:
        return ""
    memo = {}

    def best(i, last, run):
        if i == n:
            return (0, "") if run == 3 else None
        key = (i, last, run)
        if key in memo:
            return memo[key]
        choice = None
        for d in "abcdefghijklmnopqrstuvwxyz":
            if run and run < 3 and d != last:
                continue
            nxt = best(i + 1, d, min(run + 1, 3) if d == last else 1)
            if nxt is None:
                continue
            cand = (abs(ord(d) - ord(caption[i])) + nxt[0], d + nxt[1])
            if choice is None or cand < choice:
                choice = cand
        memo[key] = choice
        return choice

    return best(0, "", 0)[1]
`
