const MOD = 1000000007

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('Use a JSON array of 1 to 12 integers.')
  if (!nums.every(x => Number.isInteger(x) && x >= -100 && x <= 100)) throw new Error('Each value is an integer from -100 to 100.')
  return nums
}

// Code panel: real JavaScript. Python below mirrors it line for line.
export const code = [
  "function sumConsecutiveSubarrays(nums) {",
  "  const MOD = 1000000007;",
  "  let total = nums.reduce((sum, x) => sum + x, 0);",
  "  let upCount = 0, upSum = 0;",
  "  let downCount = 0, downSum = 0;",
  "  for (let i = 1; i < nums.length; i++) {",
  "    const diff = nums[i] - nums[i - 1];",
  "    if (diff === 1) {",
  "      upSum = upSum + upCount * nums[i] + nums[i - 1] + nums[i];",
  "      upCount += 1;",
  "    } else {",
  "      upCount = 0;",
  "      upSum = 0;",
  "    }",
  "    if (diff === -1) {",
  "      downSum = downSum + downCount * nums[i] + nums[i - 1] + nums[i];",
  "      downCount += 1;",
  "    } else {",
  "      downCount = 0;",
  "      downSum = 0;",
  "    }",
  "    total += upSum + downSum;",
  "  }",
  "  return ((total % MOD) + MOD) % MOD;",
  "}",
].map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const PY = s => python.split('\n').findIndex(line => line.includes(s)) + 1

export const python = `def sum_consecutive_subarrays(nums):
    MOD = 1000000007
    total = sum(nums)
    up_count = up_sum = 0
    down_count = down_sum = 0
    for i in range(1, len(nums)):
        diff = nums[i] - nums[i - 1]
        if diff == 1:
            up_sum = up_sum + up_count * nums[i] + nums[i - 1] + nums[i]
            up_count += 1
        else:
            up_count, up_sum = 0, 0
        if diff == -1:
            down_sum = down_sum + down_count * nums[i] + nums[i - 1] + nums[i]
            down_count += 1
        else:
            down_count, down_sum = 0, 0
        total += up_sum + down_sum
    return total % MOD


if __name__ == "__main__":
    import json
    import sys
    print(sum_consecutive_subarrays(json.loads(sys.stdin.read())))
`


export function buildTrace(nums) {
  const frames = []
  let total = nums.reduce((sum, x) => sum + x, 0)
  let upCount = 0
  let upSum = 0
  let downCount = 0
  let downSum = 0
  frames.push({
    phase: 'start', activeLine: L('let total = nums.reduce'), pythonLine: PY('total = sum(nums)'),
    i: -1, diff: null, upCount, upSum, downCount, downSum, total,
    message: `Every single element counts once: the running total starts at ${total}.`,
  })
  for (let i = 1; i < nums.length; i++) {
    const diff = nums[i] - nums[i - 1]
    if (diff === 1) {
      upSum = upSum + upCount * nums[i] + nums[i - 1] + nums[i]
      upCount += 1
    } else {
      upCount = 0
      upSum = 0
    }
    if (diff === -1) {
      downSum = downSum + downCount * nums[i] + nums[i - 1] + nums[i]
      downCount += 1
    } else {
      downCount = 0
      downSum = 0
    }
    frames.push({
      phase: 'diff', activeLine: L('if (diff === 1)'), pythonLine: PY('if diff == 1'),
      i, diff, upCount, upSum, downCount, downSum, total,
      message: diff === 1
        ? `nums[${i}] − nums[${i - 1}] = +1, so the rising run extends.`
        : diff === -1
          ? `nums[${i}] − nums[${i - 1}] = −1, so the falling run extends.`
          : `The step is ${diff}, so neither run continues through position ${i}.`,
    })
    total += upSum + downSum
    frames.push({
      phase: 'add', activeLine: L('total += upSum + downSum'), pythonLine: PY('total += up_sum + down_sum'),
      i, diff, upCount, upSum, downCount, downSum, total,
      message: `Add the runs that end at ${i}: ${upSum + downSum} more, total ${total}.`,
    })
  }
  const result = ((total % MOD) + MOD) % MOD
  frames.push({
    phase: 'done', activeLine: L('return ((total'), pythonLine: PY('return total % MOD'),
    i: nums.length, diff: null, upCount, upSum, downCount, downSum, total,
    message: `The total is ${result} modulo ${MOD}.`,
  })
  return { input: nums, result, frames }
}
