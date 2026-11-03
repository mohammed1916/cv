// A pair (i, j) with nums[i] < nums[j] counts when nothing strictly between them is smaller than nums[i].
// From each anchor i we scan right, remembering the smallest value passed so far (the blocker).
// Once the blocker drops below the anchor, no later partner for that anchor can count.

const MAX_LENGTH = 16

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 3 || nums.length > MAX_LENGTH) throw new Error('Use an array of 3 to 16 integers.')
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= 1000000000)) throw new Error('Each value is an integer from 1 to 1000000000.')
  return nums
}

export function buildTrace(nums) {
  const frames = []
  let count = 0
  frames.push({
    phase: 'start', activeLine: L('count ← 0'), pythonLine: P('count = 0'),
    i: -1, j: -1, blocker: null, valid: null, count, message: 'No shadow pairs counted yet.',
  })
  for (let i = 0; i < nums.length; i++) {
    let blocker = Infinity
    frames.push({
      phase: 'anchor', activeLine: L('FOR each anchor index'), pythonLine: P('for i in range(len(nums))'),
      i, j: -1, blocker: null, valid: null, count, message: `Anchor at index ${i} with value ${nums[i]}. Nothing has been passed yet.`,
    })
    for (let j = i + 1; j < nums.length; j++) {
      const rising = nums[i] < nums[j]
      const clear = blocker >= nums[i]
      const valid = rising && clear
      if (valid) count++
      frames.push({
        phase: valid ? 'pair' : 'scan', activeLine: L('IF nums[i] < nums[j]'), pythonLine: P('if nums[i] < nums[j] and blocker'),
        i, j, blocker: blocker === Infinity ? null : blocker, valid, count,
        message: valid
          ? `${nums[j]} is larger than ${nums[i]} and nothing passed is smaller. Pair (${i}, ${j}) counts.`
          : rising
            ? `${nums[j]} is larger, but ${blocker} passed earlier is smaller than ${nums[i]}. The pair is blocked.`
            : `${nums[j]} is not larger than ${nums[i]}, so no pair ends here.`,
      })
      blocker = Math.min(blocker, nums[j])
      frames.push({
        phase: 'block', activeLine: L('blocker ← smaller of'), pythonLine: P('blocker = min(blocker, nums[j])'),
        i, j, blocker, valid: null, count, message: `Blocker is now ${blocker}.`,
      })
      if (blocker < nums[i]) {
        frames.push({
          phase: 'stop', activeLine: L('IF blocker < nums[i]'), pythonLine: P('if blocker < nums[i]'),
          i, j, blocker, valid: null, count,
          message: `${blocker} is below anchor ${nums[i]}. Stop scanning this anchor.`,
        })
        break
      }
    }
  }
  frames.push({
    phase: 'done', activeLine: L('RETURN count'), pythonLine: P('return count'),
    i: -1, j: -1, blocker: null, valid: null, count, message: `Shadow pairs counted: ${count}.`,
  })
  return { input: nums, result: count, frames }
}

export const code = `FUNCTION countShadowPairs(nums)
    count ← 0
    FOR each anchor index i
        blocker ← infinity
        FOR each later index j
            IF nums[i] < nums[j] AND blocker ≥ nums[i] THEN count ← count + 1
            blocker ← smaller of blocker and nums[j]
            IF blocker < nums[i] THEN stop this anchor
    RETURN count`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def count_shadow_pairs(nums):
    count = 0
    for i in range(len(nums)):
        blocker = float("inf")
        for j in range(i + 1, len(nums)):
            if nums[i] < nums[j] and blocker >= nums[i]:
                count += 1
            blocker = min(blocker, nums[j])
            if blocker < nums[i]:
                break
    return count


if __name__ == "__main__":
    import json
    import sys
    print(count_shadow_pairs(json.loads(sys.stdin.read())))
`
