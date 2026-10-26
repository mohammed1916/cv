export function parseInput(text) {
  const nums = JSON.parse(text)
  const err = 'Enter a JSON array of 1-30 integers with 0 <= nums[i] < nums.length (visualization cap of 30).'
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 30 || !nums.every(v => Number.isInteger(v) && v >= 0 && v < nums.length)) throw new Error(err)
  return nums
}
export function buildTrace(nums) {
  const n = nums.length
  const diff = new Array(n + 1).fill(0)
  const frames = [{ phase: 'start', activeLine: 3, i: -1, k: -1, diff: [...diff], score: 0, best: -1, bestK: 0, message: 'Element nums[i] scores 1 whenever its rotated position is at least nums[i]. For each element that is one cyclic range of rotation counts k, so mark range ends in a difference array.' }]
  for (let i = 0; i < n; i++) {
    const v = nums[i]
    const start = (i + 1) % n
    const end = start + (n - v)
    if (end <= n) {
      diff[start] += 1; diff[end] -= 1
    } else {
      diff[start] += 1; diff[n] -= 1; diff[0] += 1; diff[end - n] -= 1
    }
    frames.push({ phase: 'mark', activeLine: end <= n ? 10 : 15, i, k: -1, diff: [...diff], score: 0, best: -1, bestK: 0,
      message: `nums[${i}] = ${v} scores for ${n - v} consecutive k starting at k = ${start}${end <= n ? ` (k = ${start}..${end - 1})` : `, wrapping past ${n - 1} (k = ${start}..${n - 1} and 0..${end - n - 1})`}. Add +1 at the start of the range and -1 just after its end.` })
  }
  let best = -1, bestK = 0, score = 0
  for (let k = 0; k < n; k++) {
    score += diff[k]
    const better = score > best
    if (better) { best = score; bestK = k }
    frames.push({ phase: better ? 'best' : 'sweep', activeLine: better ? 20 : 18, i: -1, k, diff: [...diff], score, best, bestK,
      message: better ? `k = ${k}: running sum ${score} is a new best (strictly greater, so the smallest k wins ties).` : `k = ${k}: running sum ${score} does not beat ${best}.` })
  }
  frames.push({ phase: 'done', activeLine: 21, i: -1, k: n - 1, diff: [...diff], score, best, bestK, message: `Best rotation k = ${bestK} with score ${best}.` })
  return { input: nums, result: bestK, frames }
}
export const code = `def bestRotation(nums):
    n = len(nums)
    diff = [0] * (n + 1)
    for i, v in enumerate(nums):
        start = (i + 1) % n
        length = n - v
        end = start + length
        if end <= n:
            diff[start] += 1
            diff[end] -= 1
        else:
            diff[start] += 1
            diff[n] -= 1
            diff[0] += 1
            diff[end - n] -= 1
    best, bestK, score = -1, 0, 0
    for k in range(n):
        score += diff[k]
        if score > best:
            best, bestK = score, k
    return bestK`.split('\n').map((text, index) => ({ line: index + 1, text }))
