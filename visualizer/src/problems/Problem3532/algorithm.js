export function parseInput(text) {
  const input = JSON.parse(text)
  const { n, nums, max_diff: maxDiff, queries } = input ?? {}
  if (!Number.isInteger(n) || n < 1 || n > 12) throw new Error('n is an integer from 1 to 12.')
  if (!Array.isArray(nums) || nums.length !== n) throw new Error('nums must have exactly n values.')
  if (nums.some(v => !Number.isInteger(v) || v < 0 || v > 100)) throw new Error('Each value in nums is an integer from 0 to 100.')
  if (nums.some((v, i) => i > 0 && v < nums[i - 1])) throw new Error('nums must be sorted in non-decreasing order.')
  if (!Number.isInteger(maxDiff) || maxDiff < 0 || maxDiff > 100) throw new Error('max_diff is an integer from 0 to 100.')
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 10) throw new Error('Use 1 to 10 queries.')
  for (const pair of queries) {
    if (!Array.isArray(pair) || pair.length !== 2 || !pair.every(i => Number.isInteger(i) && i >= 0 && i < n)) {
      throw new Error('Each query is a pair of node indexes from 0 to n - 1.')
    }
  }
  return { n, nums, max_diff: maxDiff, queries }
}

export function buildTrace({ n, nums, max_diff: maxDiff, queries }) {
  const comp = Array(n).fill(0)
  const frames = [{ phase: 'start', activeLine: L('set the piece label of node 0'), comp: [...comp], query: null, answer: null, message: 'Nodes are sorted, so a node joins the piece of its left neighbour when the gap is at most max_diff.' }]
  for (let i = 1; i < n; i++) {
    const gap = nums[i] - nums[i - 1]
    comp[i] = gap <= maxDiff ? comp[i - 1] : comp[i - 1] + 1
    frames.push({ phase: 'link', activeLine: L('if the gap is at most max_diff'), comp: [...comp], query: [i - 1, i], answer: null, message: gap <= maxDiff ? `Gap ${gap} is within ${maxDiff}: node ${i} joins piece ${comp[i]}.` : `Gap ${gap} is too large: node ${i} starts piece ${comp[i]}.` })
  }
  const answers = []
  for (const [u, v] of queries) {
    const answer = comp[u] === comp[v]
    answers.push(answer)
    frames.push({ phase: 'query', activeLine: L('answer is true when'), comp: [...comp], query: [u, v], answer, message: `Nodes ${u} and ${v} are in pieces ${comp[u]} and ${comp[v]}: ${answer ? 'connected' : 'not connected'}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return the answers'), comp: [...comp], query: null, answer: null, message: `Answers: ${answers.join(', ')}.` })
  return { input: { n, nums, max_diff: maxDiff, queries }, result: answers, frames }
}

export const code = `path existence queries in a graph
  set the piece label of node 0 to 0
  for each node i from 1 to n minus 1 in order
    if the gap is at most max_diff then
      give node i the same piece label as node i minus 1
    otherwise
      give node i the next piece label
  for each query [u, v]
    the answer is true when u and v have the same piece label
  return the answers`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def path_existence(n, nums, max_diff, queries):
    comp = [0] * n
    for i in range(1, n):
        if nums[i] - nums[i - 1] <= max_diff:
            comp[i] = comp[i - 1]
        else:
            comp[i] = comp[i - 1] + 1
    answer = []
    for u, v in queries:
        answer.append(comp[u] == comp[v])
    return answer
`
