export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 10 || !nums.every(v => Number.isInteger(v) && v >= 1 && v <= 20)) throw new Error('Use a JSON array of 2 to 10 integers from 1 to 20.')
  return nums
}

export function buildTrace(nums) {
  const frames = []
  const n = nums.length
  let best = 0
  frames.push({ pythonLine: 3, phase: 'start', activeLine: L('n = length; best = 0'), l: 0, r: n - 1, target: null, res: null, best, message: `Try the three possible scores for the first operation.` })
  const targets = [...new Set([nums[0] + nums[1], nums[n - 2] + nums[n - 1], nums[0] + nums[n - 1]])]
  for (const target of targets) {
    const memo = new Map()
    frames.push({ pythonLine: 5, phase: 'target', activeLine: L('for each possible score'), l: 0, r: n - 1, target, res: null, best, message: `Every operation must score ${target}.` })
    const go = (l, r) => {
      if (r - l + 1 < 2) return 0
      const key = `${l},${r}`
      if (memo.has(key)) {
        frames.push({ pythonLine: 10, phase: 'memo', activeLine: L('if the stored answer exists'), l, r, target, res: memo.get(key), best, message: `Interval ${l} to ${r} is already solved.` })
        return memo.get(key)
      }
      let res = 0
      if (nums[l] + nums[l + 1] === target) {
        res = Math.max(res, 1 + go(l + 2, r))
        frames.push({ pythonLine: 13, phase: 'front', activeLine: L('try removing the two front'), l, r, target, res, best, message: `Remove ${nums[l]} and ${nums[l + 1]} from the front.` })
      }
      if (nums[r] + nums[r - 1] === target) {
        res = Math.max(res, 1 + go(l, r - 2))
        frames.push({ pythonLine: 15, phase: 'back', activeLine: L('try removing the two front'), l, r, target, res, best, message: `Remove ${nums[r - 1]} and ${nums[r]} from the back.` })
      }
      if (nums[l] + nums[r] === target) {
        res = Math.max(res, 1 + go(l + 1, r - 1))
        frames.push({ pythonLine: 17, phase: 'ends', activeLine: L('try removing the two front'), l, r, target, res, best, message: `Remove ${nums[l]} and ${nums[r]} from the two ends.` })
      }
      memo.set(key, res)
      return res
    }
    best = Math.max(best, go(0, n - 1))
    frames.push({ pythonLine: 20, phase: 'best', activeLine: L('best = maximum of best and solve'), l: 0, r: n - 1, target, res: null, best, message: `Best so far is ${best}.` })
  }
  frames.push({ pythonLine: 21, phase: 'done', activeLine: L('return best'), l: null, r: null, target: null, res: null, best, message: `${best} operations share the same score.` })
  return { input: nums, result: best, frames }
}

export const code = `maximum operations where every operation has the same score
  n = length; best = 0
  for each possible score from the first operation
    solve(l, r) = most operations on nums from l to r with that score
      if fewer than two values remain, return 0
      if the stored answer exists, return it
      try removing the two front, the two back, or one from each end when its sum matches
      store and return the largest result
    best = maximum of best and solve(0, n - 1)
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_operations(nums):
    n = len(nums)
    best = 0
    for target in {nums[0] + nums[1], nums[n - 2] + nums[n - 1], nums[0] + nums[n - 1]}:
        memo = {}
        def go(l, r):
            if r - l + 1 < 2:
                return 0
            if (l, r) in memo:
                return memo[(l, r)]
            res = 0
            if nums[l] + nums[l + 1] == target:
                res = max(res, 1 + go(l + 2, r))
            if nums[r] + nums[r - 1] == target:
                res = max(res, 1 + go(l, r - 2))
            if nums[l] + nums[r] == target:
                res = max(res, 1 + go(l + 1, r - 1))
            memo[(l, r)] = res
            return res
        best = max(best, go(0, n - 1))
    return best
`
