const MOD = 1000000007

export function parseInput(text) {
  const o = JSON.parse(text)
  if (!o || typeof o !== 'object') throw new Error('Use an object with start_pos, end_pos and k.')
  const { start_pos: start, end_pos: end, k } = o
  for (const [name, v] of [['start_pos', start], ['end_pos', end], ['k', k]]) {
    if (!Number.isInteger(v) || v < 1 || v > 40) throw new Error(`${name} must be an integer from 1 to 40.`)
  }
  return { start_pos: start, end_pos: end, k }
}

export function buildTrace({ start_pos: start, end_pos: end, k }) {
  const width = 2 * k + 1
  let ways = new Array(width).fill(0)
  ways[k] = 1
  const frames = [{ phase: 'start', activeLine: L('set ways[0] to one'), step: 0, row: ways.slice(), message: 'Before any step, one sequence sits at displacement zero.' }]
  for (let s = 1; s <= k; s++) {
    const next = new Array(width).fill(0)
    for (let i = 0; i < width; i++) {
      if (!ways[i]) continue
      if (i + 1 < width) next[i + 1] = (next[i + 1] + ways[i]) % MOD
      if (i - 1 >= 0) next[i - 1] = (next[i - 1] + ways[i]) % MOD
    }
    ways = next
    frames.push({ phase: 'step', activeLine: L('for each step from one'), step: s, row: ways.slice(), message: `After step ${s}, every displacement has its count of sequences.` })
  }
  const d = end - start
  const result = Math.abs(d) > k ? 0 : ways[d + k]
  frames.push({ phase: 'done', activeLine: L('return ways['), step: k, row: ways.slice(), message: `Ways to be ${d} away after ${k} steps: ${result}.` })
  return { input: { start_pos: start, end_pos: end, k }, result, frames, width }
}

export const code = `count ways to move from start to end in exactly k unit steps
  let ways[d] be the number of step sequences that end d away from the start
  set ways[0] to one
  for each step from one to k
    let next be all zeros
    for each displacement d with ways greater than zero
      add ways[d] to next[d plus one] and to next[d minus one]
    replace ways with next
  return ways[end minus start], or zero if that displacement is out of reach`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def number_of_ways(start_pos, end_pos, k):
    MOD = 10 ** 9 + 7
    width = 2 * k + 1
    ways = [0] * width
    ways[k] = 1
    for _ in range(k):
        nxt = [0] * width
        for i, count in enumerate(ways):
            if count == 0:
                continue
            if i + 1 < width:
                nxt[i + 1] = (nxt[i + 1] + count) % MOD
            if i - 1 >= 0:
                nxt[i - 1] = (nxt[i - 1] + count) % MOD
        ways = nxt
    d = end_pos - start_pos
    if abs(d) > k:
        return 0
    return ways[d + k]
`
