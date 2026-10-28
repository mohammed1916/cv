export function parseInput(text) {
  const input = JSON.parse(text)
  const nums = input?.nums
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('Use {"nums": [...]} with 1 to 12 numbers.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 100)) throw new Error('Numbers are integers from 1 to 100.')
  return { nums }
}

export function buildTrace(input) {
  const nums = input.nums
  const n = nums.length
  const order = nums.map((_, i) => i).sort((a, b) => nums[a] - nums[b] || a - b)
  const marked = Array(n).fill(false)
  const markedList = []
  let score = 0
  const frames = [{ phase: 'start', activeLine: L('sort the positions by value'), at: null, marked: [], score: 0, message: 'Order the positions by value, then by position.' }]
  for (const i of order) {
    if (marked[i]) {
      frames.push({ phase: 'skip', activeLine: L('if position i is marked'), at: i, marked: [...markedList], score, message: `Position ${i} (value ${nums[i]}) is already marked, so skip it.` })
      continue
    }
    score += nums[i]
    marked[i] = true
    markedList.push(i)
    const neighbours = [i - 1, i + 1].filter(j => j >= 0 && j < n)
    for (const j of neighbours) {
      if (!marked[j]) {
        marked[j] = true
        markedList.push(j)
      }
    }
    frames.push({ phase: 'take', activeLine: L('add nums at i to score'), at: i, marked: [...markedList], score, message: `Take ${nums[i]} at position ${i}, then mark it and its neighbours. Score: ${score}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return score'), at: null, marked: [...markedList], score, message: `Final score: ${score}.` })
  return { input, result: score, frames }
}

export const code = `find the score after repeatedly taking the smallest unmarked value
  set score to zero and mark no positions
  sort the positions by value, then by position
  for each position i in that order
    if position i is marked then skip it
    add nums at i to score
    mark position i and its neighbour on each side
  return score`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def find_score(nums):
    n = len(nums)
    order = sorted(range(n), key=lambda i: (nums[i], i))
    marked = [False] * n
    score = 0
    for i in order:
        if marked[i]:
            continue
        score += nums[i]
        marked[i] = True
        if i - 1 >= 0:
            marked[i - 1] = True
        if i + 1 < n:
            marked[i + 1] = True
    return score
`
