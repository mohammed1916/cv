export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums.')
  const { nums } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 10 || !nums.every(v => Number.isInteger(v) && v >= 1 && v <= 99)) throw new Error('nums is 1 to 10 integers from 1 to 99.')
  return { nums }
}

function neighbours(nums, i) {
  const out = []
  for (let j = i + 1; j < nums.length; j++) if (nums[j] < nums[i]) out.push(j)
  for (let j = 0; j < i; j++) if (nums[j] > nums[i]) out.push(j)
  return out
}

export function buildTrace({ nums }) {
  const frames = []
  const ans = []
  for (let start = 0; start < nums.length; start++) {
    const seen = new Set([start])
    const queue = [start]
    let best = nums[start]
    frames.push({ phase: 'start', start, at: start, seen: [...seen], best, message: `Explore jumps from index ${start}.` })
    while (queue.length) {
      const cur = queue.shift()
      for (const j of neighbours(nums, cur)) {
        if (seen.has(j)) continue
        seen.add(j)
        queue.push(j)
        best = Math.max(best, nums[j])
        frames.push({ phase: 'visit', start, at: j, seen: [...seen], best, message: `Reach index ${j} with value ${nums[j]}.` })
      }
    }
    ans.push(best)
    frames.push({ phase: 'record', start, at: start, seen: [...seen], best, message: `The largest value reachable from ${start} is ${best}.` })
  }
  frames.push({ phase: 'done', start: -1, at: -1, seen: [], best: null, message: `Answer: [${ans.join(', ')}].` })
  return { input: { nums }, result: ans, frames }
}

export const code = `for each index i
  reachable = {i} and queue = [i]
  best = nums[i]
  while queue is not empty
    take cur from the queue
    for each j that a jump from cur allows
      if j is new then add it and update best with nums[j]
  record best as ans[i]
return ans`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def max_reachable(nums):
    n = len(nums)
    ans = []
    for i in range(n):
        seen = {i}
        queue = [i]
        best = nums[i]
        while queue:
            cur = queue.pop(0)
            for j in range(n):
                allowed = (j > cur and nums[j] < nums[cur]) or (j < cur and nums[j] > nums[cur])
                if allowed and j not in seen:
                    seen.add(j)
                    queue.append(j)
                    best = max(best, nums[j])
        ans.append(best)
    return ans
`
