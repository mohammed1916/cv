// Pair (i, j) with nums[i] < nums[j] counts when no value between them lies strictly between the two endpoints.
// From each anchor i we keep the smallest value above nums[i] seen so far (the ceiling).
// The pair is clear exactly when that ceiling is at least nums[j]; values equal to an endpoint never block.

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
    i: -1, j: -1, ceiling: null, valid: null, count, message: 'No shadow pairs counted yet.',
  })
  for (let i = 0; i < nums.length; i++) {
    let ceiling = Infinity
    frames.push({
      phase: 'anchor', activeLine: L('FOR each anchor index'), pythonLine: P('for i in range(len(nums))'),
      i, j: -1, ceiling: null, valid: null, count, message: `Anchor at index ${i} with value ${nums[i]}.`,
    })
    for (let j = i + 1; j < nums.length; j++) {
      const b = nums[j]
      const rising = nums[i] < b
      const valid = rising && ceiling >= b
      if (valid) count++
      frames.push({
        phase: valid ? 'pair' : rising ? 'blocked' : 'scan', activeLine: L('IF nums[i] < nums[j] AND ceiling'),
        pythonLine: P('if nums[i] < nums[j] and ceiling'),
        i, j, ceiling: ceiling === Infinity ? null : ceiling, valid, count,
        message: valid
          ? `${b} is above ${nums[i]} and no value sits strictly between. Pair (${i}, ${j}) counts.`
          : rising
            ? `A value strictly between ${nums[i]} and ${b} was passed (ceiling ${ceiling}). Pair (${i}, ${j}) is blocked.`
            : `${b} is not above ${nums[i]}, so it cannot be the right end of a pair.`,
      })
      if (rising) {
        ceiling = Math.min(ceiling, b)
        frames.push({
          phase: 'ceiling', activeLine: L('ceiling ← smaller of'), pythonLine: P('ceiling = min(ceiling, nums[j])'),
          i, j, ceiling, valid: null, count, message: `Ceiling is now ${ceiling}.`,
        })
      }
    }
  }
  frames.push({
    phase: 'done', activeLine: L('RETURN count'), pythonLine: P('return count'),
    i: -1, j: -1, ceiling: null, valid: null, count, message: `Shadow pairs counted: ${count}.`,
  })
  return { input: nums, result: count, frames }
}

export const code = `FUNCTION countShadowPairsII(nums)
    count ← 0
    FOR each anchor index i
        ceiling ← infinity
        FOR each later index j
            IF nums[i] < nums[j] AND ceiling ≥ nums[j] THEN count ← count + 1
            IF nums[i] < nums[j] THEN ceiling ← smaller of ceiling and nums[j]
    RETURN count`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def count_shadow_pairs_ii(nums):
    count = 0
    for i in range(len(nums)):
        ceiling = float("inf")
        for j in range(i + 1, len(nums)):
            if nums[i] < nums[j] and ceiling >= nums[j]:
                count += 1
            if nums[i] < nums[j]:
                ceiling = min(ceiling, nums[j])
    return count


if __name__ == "__main__":
    import json
    import sys
    print(count_shadow_pairs_ii(json.loads(sys.stdin.read())))
`
