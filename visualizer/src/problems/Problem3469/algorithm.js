export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || Array.isArray(input) || !Array.isArray(input.nums)) throw new Error('Use an object such as {"nums": [6,2,8,4]}.')
  const { nums } = input
  if (nums.length < 1 || nums.length > 60) throw new Error('nums needs 1 to 60 entries for the visualization.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 1000000)) throw new Error('Each value is an integer from 1 to 1000000.')
  return { nums }
}

// A state is (next, front): front is the index of the element left over at the front (-1 for none),
// and next is the first unread index. The remaining elements are the front followed by nums[next..].
export function buildTrace({ nums }) {
  const input = { nums }
  const n = nums.length
  const memo = new Map()
  const remainingOf = (next, front) => (front >= 0 ? [front] : []).concat(Array.from({ length: n - next }, (_, k) => next + k))
  const finish = (indices) => Math.max(0, ...indices.map(i => nums[i]))
  const solve = (next, front) => {
    const key = `${next}:${front}`
    if (memo.has(key)) return memo.get(key)
    const seq = remainingOf(next, front)
    let value
    if (seq.length <= 2) value = finish(seq)
    else {
      const three = seq.slice(0, 3)
      const after = Math.max(...three) + 1
      value = Math.min(...three.map(leftover => {
        const removed = three.filter(i => i !== leftover)
        return Math.max(nums[removed[0]], nums[removed[1]]) + solve(after, leftover)
      }))
    }
    memo.set(key, value)
    return value
  }
  const total = solve(0, -1)
  const frames = [{ phase: 'start', activeLine: L('set answer to the cheapest plan'), next: 0, front: -1, cost: 0, message: 'Start with every element in the array and no leftover at the front.' }]
  let next = 0
  let front = -1
  let spent = 0
  while (true) {
    const seq = remainingOf(next, front)
    if (seq.length <= 2) {
      const last = finish(seq)
      spent += last
      frames.push({ phase: 'finish', activeLine: L('remove the rest together'), next, front, cost: spent, message: `Fewer than three remain, so remove them for ${last}. Total ${spent}.` })
      break
    }
    const three = seq.slice(0, 3)
    const after = Math.max(...three) + 1
    let pick = null
    for (const leftover of three) {
      const removed = three.filter(i => i !== leftover)
      const cost = Math.max(nums[removed[0]], nums[removed[1]]) + solve(after, leftover)
      if (pick === null || cost < pick.cost) pick = { leftover, removed, cost }
    }
    const stepCost = Math.max(nums[pick.removed[0]], nums[pick.removed[1]])
    spent += stepCost
    frames.push({ phase: 'remove', activeLine: L('take the cheaper pair'), next, front, cost: spent, message: `Remove ${nums[pick.removed[0]]} and ${nums[pick.removed[1]]} for ${stepCost}. ${nums[pick.leftover]} stays at the front.` })
    next = after
    front = pick.leftover
  }
  frames.push({ phase: 'done', activeLine: L('return answer'), next: n, front: -1, cost: total, message: `Minimum total cost: ${total}.` })
  return { input, result: total, frames }
}

export const code = `minimum cost to remove every element
  set answer to the cheapest plan from the start
  define a state as the leftover front and the next unread index
  if fewer than three remain
    remove the rest together at the cost of their largest value
  otherwise
    for each element among the first three that could stay in front
      remove the other two at the cost of the larger one
      add the cheapest plan for the remaining state
    take the cheaper pair
  return answer`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from functools import lru_cache

def min_cost_to_remove(nums):
    n = len(nums)

    @lru_cache(maxsize=None)
    def solve(next_index, front):
        seq = ([front] if front >= 0 else []) + list(range(next_index, n))
        if len(seq) <= 2:
            return max((nums[i] for i in seq), default=0)
        three = seq[:3]
        after = max(three) + 1
        best = None
        for leftover in three:
            removed = [i for i in three if i != leftover]
            cost = max(nums[removed[0]], nums[removed[1]]) + solve(after, leftover)
            if best is None or cost < best:
                best = cost
        return best

    return solve(0, -1)
`
