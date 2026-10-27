export function parseInput(text) {
  const input = JSON.parse(text)
  const { nums, remove_queries: removeQueries } = input ?? {}
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 8) throw new Error('Use 1 to 8 values in nums.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 100)) throw new Error('Each value in nums is an integer from 1 to 100.')
  if (!Array.isArray(removeQueries) || removeQueries.length !== nums.length) throw new Error('remove_queries must list every index once.')
  const seen = new Set(removeQueries)
  if (seen.size !== nums.length || removeQueries.some(q => !Number.isInteger(q) || q < 0 || q >= nums.length)) {
    throw new Error('remove_queries must be a permutation of the indexes 0 to n - 1.')
  }
  return { nums, remove_queries: removeQueries }
}

export function buildTrace({ nums, remove_queries: removeQueries }) {
  const n = nums.length
  const parent = Array.from({ length: n }, (_, i) => i)
  const total = Array(n).fill(0)
  const present = Array(n).fill(false)
  const find = x => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]]
      x = parent[x]
    }
    return x
  }
  const join = (a, b) => {
    const ra = find(a)
    const rb = find(b)
    parent[ra] = rb
    total[rb] += total[ra]
  }
  const answer = Array(n).fill(0)
  const presentList = () => present.map((on, i) => (on ? i : -1)).filter(i => i >= 0)
  const frames = [{ phase: 'start', activeLine: L('start with every position removed'), index: null, best: 0, present: [], answers: [...answer], message: 'Start with everything removed. Putting values back in reverse order answers every query.' }]

  let best = 0
  for (let i = n - 1; i >= 0; i--) {
    answer[i] = best
    frames.push({ phase: 'record', activeLine: L('record the best sum'), index: null, best, present: presentList(), answers: [...answer], message: `After removals 0 to ${i}, the best segment sum is ${best}.` })
    const q = removeQueries[i]
    present[q] = true
    total[q] = nums[q]
    frames.push({ phase: 'add', activeLine: L('put back the removed value'), index: q, best, present: presentList(), answers: [...answer], message: `Put back index ${q} with value ${nums[q]}.` })
    if (q > 0 && present[q - 1]) join(q - 1, q)
    if (q + 1 < n && present[q + 1]) join(q, q + 1)
    best = Math.max(best, total[find(q)])
    frames.push({ phase: 'merge', activeLine: L('update the best sum'), index: q, best, present: presentList(), answers: [...answer], message: `Its segment now sums to ${total[find(q)]}; the best is ${best}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return the answers'), index: null, best, present: presentList(), answers: [...answer], message: `Answers: ${answer.join(', ')}.` })
  return { input: { nums, remove_queries: removeQueries }, result: answer, frames }
}

export const code = `maximum segment sum after removals
  start with every position removed and the best sum at zero
  for each query from last to first
    record the best sum as the answer for this query
    put back the removed value at its position
    join it with a present neighbour on the left and on the right
    update the best sum with the segment that now holds it
  return the answers`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_segment_sums(nums, remove_queries):
    n = len(nums)
    parent = list(range(n))
    total = [0] * n
    present = [False] * n

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    def join(a, b):
        ra = find(a)
        rb = find(b)
        parent[ra] = rb
        total[rb] += total[ra]

    answer = [0] * n
    best = 0
    for i in range(n - 1, -1, -1):
        answer[i] = best
        q = remove_queries[i]
        present[q] = True
        total[q] = nums[q]
        if q > 0 and present[q - 1]:
            join(q - 1, q)
        if q + 1 < n and present[q + 1]:
            join(q, q + 1)
        best = max(best, total[find(q)])
    return answer
`
