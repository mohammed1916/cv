export function parseInput(text) {
  const data = JSON.parse(text)
  const nums = data?.nums, k = data?.k
  if (!Array.isArray(nums) || !nums.length || nums.length > 100000 || nums.some(v => !Number.isInteger(v) || v < 1 || v > 100000)
    || !Number.isInteger(k) || k < 1 || k > nums.length) {
    throw new Error('Enter {"nums":[...],"k":1}: 1–100,000 values in 1–100,000, and 1 ≤ k ≤ nums.length.')
  }
  return { nums, k }
}

// Prefix maximum plus the endpoint that attained it, for reconstructing a witness.
class PrefixMaximum {
  constructor(size) {
    this.scores = new Float64Array(size + 1)
    this.indices = new Int32Array(size + 1).fill(-1)
  }
  add(position, score, index) {
    for (let p = position; p < this.scores.length; p += p & -p) {
      if (score > this.scores[p]) { this.scores[p] = score; this.indices[p] = index }
    }
  }
  query(position) {
    let score = 0, index = -1
    for (let p = position; p > 0; p -= p & -p) {
      if (this.scores[p] > score) { score = this.scores[p]; index = this.indices[p] }
    }
    return { score, index }
  }
}

export function buildTrace({ nums, k }) {
  const n = nums.length
  let limit = 0
  for (const value of nums) limit = Math.max(limit, value)
  const lowerDown = new PrefixMaximum(limit), higherUp = new PrefixMaximum(limit)
  const up = new Float64Array(n), down = new Float64Array(n)
  const prevUp = new Int32Array(n).fill(-1), prevDown = new Int32Array(n).fill(-1)
  let result = 0, bestIndex = -1, bestDirection = 'up'
  const frames = [{ phase: 'start', index: -1, eligible: -1, result: 0, activeLine: 14,
    message: 'Track the best sum ending at each index with the last move rising or falling. A singleton can start either state.' }]
  for (let i = 0; i < n; i++) {
    const j = i - k, eligible = Math.max(-1, j)
    if (j >= 0) {
      lowerDown.add(nums[j], down[j], j)
      higherUp.add(limit - nums[j] + 1, up[j], j)
    }
    frames.push({ phase: 'activate', index: i, eligible, result, activeLine: j >= 0 ? 22 : 19,
      message: j >= 0 ? `Index ${j} becomes eligible. Only endpoints 0..${j} are at least k=${k} positions away.` : `Index ${i}: no earlier endpoint is k=${k} positions away yet.` })
    const lower = lowerDown.query(nums[i] - 1)
    up[i] = nums[i] + lower.score
    prevUp[i] = lower.index
    frames.push({ phase: 'rise', index: i, eligible, result, candidate: lower.index, candidateScore: lower.score,
      score: up[i], activeLine: 24, message: lower.index < 0 ? `No eligible smaller predecessor: start a singleton of sum ${nums[i]}.`
        : `Rise ${nums[lower.index]} → ${nums[i]}: extend falling state at index ${lower.index} (${lower.score}) to sum ${up[i]}.` })
    const higher = higherUp.query(limit - nums[i])
    down[i] = nums[i] + higher.score
    prevDown[i] = higher.index
    if (up[i] > result) { result = up[i]; bestIndex = i; bestDirection = 'up' }
    if (down[i] > result) { result = down[i]; bestIndex = i; bestDirection = 'down' }
    frames.push({ phase: 'fall', index: i, eligible, result, candidate: higher.index, candidateScore: higher.score,
      score: down[i], activeLine: 25, message: higher.index < 0 ? `No eligible larger predecessor: falling state starts at ${nums[i]}. Best sum so far: ${result}.`
        : `Fall ${nums[higher.index]} → ${nums[i]}: extend rising state at index ${higher.index} (${higher.score}) to sum ${down[i]}. Best: ${result}.` })
  }
  const path = []
  let index = bestIndex, direction = bestDirection
  while (index >= 0) {
    path.push(index)
    index = direction === 'up' ? prevUp[index] : prevDown[index]
    direction = direction === 'up' ? 'down' : 'up'
  }
  path.reverse()
  frames.push({ phase: 'done', index: n - 1, eligible: n - 1 - k, result, activeLine: 27,
    message: `Maximum sum ${result}. Reconstructed ${path.length} indices with strict alternating values and every gap at least ${k}.` })
  return { input: [...nums], k, up, down, prevUp, prevDown, result, path, frames }
}

export const code = `def maxAlternatingSum(nums, k):
    U = max(nums)
    lower, higher = [0] * (U + 1), [0] * (U + 1)
    def update(tree, p, value):
        while p <= U:
            tree[p] = max(tree[p], value)
            p += p & -p
    def query(tree, p):
        best = 0
        while p > 0:
            best = max(best, tree[p])
            p -= p & -p
        return best
    up, down = [0] * len(nums), [0] * len(nums)
    answer = 0
    for i, value in enumerate(nums):
        # Only completed states at distance >= k are inserted.
        j = i - k
        if j >= 0:
            update(lower, nums[j], down[j])
            # Reverse value coordinates for strict greater-than queries.
            update(higher, U - nums[j] + 1, up[j])
        # Equal values are excluded from both queries.
        up[i] = value + query(lower, value - 1)
        down[i] = value + query(higher, U - value)
        answer = max(answer, up[i], down[i])
    return answer`.split('\n').map((text, index) => ({ line: index + 1, text }))
