export function parseInput(text) {
  const value = JSON.parse(text)
  if (!value || Array.isArray(value) || Object.keys(value).sort().join() !== 'nums,queries') throw new Error('Use an object with exactly the keys "nums" and "queries".')
  const { nums, queries } = value
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 10) throw new Error('nums has 1 to 10 entries.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 9)) throw new Error('nums values are integers from 1 to 9.')
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 10) throw new Error('Use 1 to 10 queries.')
  if (queries.some(q => !Number.isInteger(q) || q < 0 || q >= nums.length)) throw new Error('Each query is an index into nums.')
  return { nums, queries }
}

export function buildTrace({ nums, queries }) {
  const n = nums.length
  const positions = new Map()
  nums.forEach((v, i) => {
    if (!positions.has(v)) positions.set(v, [])
    positions.get(v).push(i)
  })
  const circular = (a, b) => Math.min(Math.abs(a - b), n - Math.abs(a - b))
  const frames = [{ phase: 'start', activeLine: L('set positions to a map'), active: -1, roles: {}, state: {}, message: 'Group the indices by value. The nearest equal element is one of the two neighbours in that group, going around the circle.' }]
  const answers = []
  for (const q of queries) {
    const occ = positions.get(nums[q])
    const roles = {}
    for (const j of occ) roles[j] = 'same value'
    roles[q] = 'query'
    if (occ.length === 1) {
      answers.push(-1)
      frames.push({ phase: 'query', activeLine: L('if list has only one index'), active: q, roles, state: { query: q, value: nums[q], answer: -1 }, message: `Index ${q} is the only ${nums[q]}, so the answer is -1.` })
      continue
    }
    const k = occ.indexOf(q)
    const prev = occ[(k - 1 + occ.length) % occ.length]
    const next = occ[(k + 1) % occ.length]
    const best = Math.min(circular(q, prev), circular(q, next))
    answers.push(best)
    frames.push({ phase: 'query', activeLine: L('otherwise set prev and next'), active: q, roles, state: { query: q, value: nums[q], prev, next, answer: best }, message: `Neighbours of ${q} among the ${nums[q]}s are ${prev} and ${next}. Nearest circular distance ${best}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return answers'), active: -1, roles: {}, state: { answers: answers.join(', ') }, message: `Return [${answers.join(', ')}].` })
  return { input: { nums, queries }, result: answers, items: nums, frames }
}

export const code = `closest equal element distance for each query
  set positions to a map from each value to the sorted list of its indices
  set answers to an empty list
  for each query index i
    set list to the positions of nums[i]
    if list has only one index then
      add -1 to answers
    otherwise set prev and next to the circular neighbours of i in list
      add the smaller circular distance from i to prev or next to answers
  return answers`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def solve_queries(nums, queries):
    n = len(nums)
    positions = {}
    for i, v in enumerate(nums):
        positions.setdefault(v, []).append(i)
    answers = []
    for q in queries:
        occ = positions[nums[q]]
        if len(occ) == 1:
            answers.append(-1)
            continue
        k = occ.index(q)
        size = len(occ)
        best = n
        for j in (occ[(k - 1) % size], occ[(k + 1) % size]):
            d = abs(q - j)
            best = min(best, min(d, n - d))
        answers.append(best)
    return answers
`
