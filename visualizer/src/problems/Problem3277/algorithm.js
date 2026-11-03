export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and queries.')
  const { nums, queries } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('nums has 1 to 12 integers in this visualization.')
  if (!nums.every(v => Number.isInteger(v) && v >= 0 && v < 1024)) throw new Error('Each nums value is an integer from 0 to 1023.')
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 8) throw new Error('queries has 1 to 8 pairs in this visualization.')
  for (const q of queries) {
    if (!Array.isArray(q) || q.length !== 2 || !q.every(Number.isInteger)) throw new Error('Each query is a pair [l, r].')
    if (q[0] < 0 || q[1] >= nums.length || q[0] > q[1]) throw new Error('Each query needs 0 <= l <= r < nums.length.')
  }
  return { nums, queries }
}

// score[l][r] is the value left after repeatedly XOR-ing neighbours of nums[l..r].
// It satisfies score(l, r) = score(l, r - 1) XOR score(l + 1, r), so the table is filled by length.
// best[l][r] is the largest score among all subarrays inside nums[l..r].
export function buildTrace({ nums, queries }) {
  const n = nums.length
  const score = Array.from({ length: n }, () => Array(n).fill(0))
  const best = Array.from({ length: n }, () => Array(n).fill(0))
  const frames = []
  for (let i = 0; i < n; i++) {
    score[i][i] = nums[i]
    best[i][i] = nums[i]
    frames.push({ pythonLine: 4, phase: 'single', activeLine: L('score of a single element'), l: i, r: i, value: nums[i], best: nums[i], message: `nums[${i}] alone scores ${nums[i]}.` })
  }
  for (let len = 2; len <= n; len++) {
    for (let l = 0; l + len - 1 < n; l++) {
      const r = l + len - 1
      score[l][r] = score[l][r - 1] ^ score[l + 1][r]
      best[l][r] = Math.max(score[l][r], best[l][r - 1], best[l + 1][r])
      frames.push({ pythonLine: 8, phase: 'combine', activeLine: L('score of the window is'), l, r, value: score[l][r], best: best[l][r], message: `Window ${l}..${r} scores ${score[l][r]}; the best inside it is ${best[l][r]}.` })
    }
  }
  const answer = queries.map(([l, r]) => best[l][r])
  for (const [l, r] of queries) {
    frames.push({ pythonLine: 12, phase: 'query', activeLine: L('record the best for the query'), l, r, value: score[l][r], best: best[l][r], message: `Query ${l}..${r} reads ${best[l][r]} from the table.` })
  }
  frames.push({ pythonLine: 13, phase: 'done', activeLine: L('return answer'), l: -1, r: -1, value: null, best: null, message: `Answers: ${answer.join(', ')}.` })
  return { input: { nums, queries }, result: answer, frames }
}

export const code = `answer each XOR-score query on nums
  for each single element, score is the element and best is the element
  for each window by increasing length
    score[l][r] = score[l][r-1] XOR score[l+1][r]
    best[l][r] = max(score[l][r], best[l][r-1], best[l+1][r])
  for each query [l, r] record best[l][r]
  return the recorded answers`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_xor_score_queries(nums, queries):
    n = len(nums)
    score = [[0] * n for _ in range(n)]
    best = [[0] * n for _ in range(n)]
    for i in range(n):
        score[i][i] = best[i][i] = nums[i]
    for length in range(2, n + 1):
        for l in range(n - length + 1):
            r = l + length - 1
            score[l][r] = score[l][r - 1] ^ score[l + 1][r]
            best[l][r] = max(score[l][r], best[l][r - 1], best[l + 1][r])
    return [best[l][r] for l, r in queries]
`
