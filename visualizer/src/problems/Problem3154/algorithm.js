export function parseInput(text) {
  const o = JSON.parse(text)
  if (!o || !Number.isInteger(o.k) || o.k < 0 || o.k > 30) throw new Error('Use an object with an integer k from 0 to 30.')
  return { k: o.k }
}

export function buildTrace({ k }) {
  const memo = new Map()
  const frames = []
  const ways = (stair, jump, canDown) => {
    const key = `${stair},${jump},${canDown}`
    if (memo.has(key)) return memo.get(key)
    if (stair > k + 1) {
      memo.set(key, 0)
      return 0
    }
    let total = stair === k ? 1 : 0
    if (canDown && stair > 0) total += ways(stair - 1, jump, false)
    total += ways(stair + 2 ** jump, jump + 1, true)
    memo.set(key, total)
    frames.push({ phase: 'state', activeLine: L('set total to one'), stair, jump, canDown, ways: total, message: `Stair ${stair}, jump ${jump}${canDown ? ', down allowed' : ''}: ${total} ways from here.` })
    return total
  }
  const result = ways(1, 0, true)
  frames.push({ phase: 'done', activeLine: L('return total'), stair: k, jump: 0, canDown: true, ways: result, message: `Ways to reach stair ${k}: ${result}.` })
  return { input: { k }, result, frames, k }
}

export const code = `ways to reach stair k, starting at stair 1 with jump 0 and a down move allowed
  if the stair is above k plus one then return zero
  set total to one if the stair is k, otherwise zero
  if a down move is allowed and the stair is above zero then add ways(stair minus 1, jump, no down) to total
  add ways(stair plus 2 to the power jump, jump plus 1, down allowed) to total
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from functools import lru_cache


def ways_to_reach_stair(k):
    @lru_cache(maxsize=None)
    def ways(stair, jump, can_down):
        if stair > k + 1:
            return 0
        total = 1 if stair == k else 0
        if can_down and stair > 0:
            total += ways(stair - 1, jump, False)
        total += ways(stair + (1 << jump), jump + 1, True)
        return total

    return ways(1, 0, True)
`
