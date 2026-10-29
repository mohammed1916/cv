export function parseInput(text) {
  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('Input must be JSON, for example {"nums":[12,6,1,2,7]}.')
  }
  if (!data || typeof data !== 'object' || !Array.isArray(data.nums)) throw new Error('Use an object with a nums array.')
  const nums = data.nums
  if (nums.length < 3 || nums.length > 30) throw new Error('nums must have 3 to 30 elements for the visualization.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 1000000)) throw new Error('Each value must be an integer from 1 to 1000000.')
  return { nums }
}

export function buildTrace(input) {
  const { nums } = input
  const frames = []
  let answer = 0
  let bestDiff = 0
  let bestPrefix = 0
  const push = (phase, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine, message, cursor: -1, answer, bestDiff, bestPrefix, result: null, ...extra,
  })

  push('setup', 2, 2, 'Start with answer 0.')
  push('setup', 2, 3, 'Start with bestDiff 0. No earlier pair exists yet.')
  push('setup', 2, 4, 'Start with bestPrefix 0. No earlier value exists yet.')
  for (let k = 0; k < nums.length; k++) {
    const x = nums[k]
    push('scan', 3, 5, `Visit index ${k} with value ${x} as the last index.`, { cursor: k })
    const candidate = bestDiff * x
    answer = Math.max(answer, candidate)
    push('answer', 4, 6, `Candidate ${bestDiff} * ${x} = ${candidate}. Answer is now ${answer}.`, { cursor: k })
    const diff = bestPrefix - x
    bestDiff = Math.max(bestDiff, diff)
    push('diff', 5, 7, `Pair difference ${bestPrefix} - ${x} = ${diff}. bestDiff is now ${bestDiff}.`, { cursor: k })
    bestPrefix = Math.max(bestPrefix, x)
    push('prefix', 6, 8, `bestPrefix is now ${bestPrefix}.`, { cursor: k })
  }
  push('done', 7, 9, `Return the answer ${answer}.`, { result: answer })
  return { input, result: answer, frames }
}

export const code = `maximum value of an ordered triplet
  set answer to 0, best difference to 0, best prefix to 0
  for each value x in nums
    update answer with best difference times x
    update best difference with best prefix minus x
    update best prefix with x
  return answer`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def maximumTripletValue(nums):
    answer = 0
    best_diff = 0
    best_prefix = 0
    for x in nums:
        answer = max(answer, best_diff * x)
        best_diff = max(best_diff, best_prefix - x)
        best_prefix = max(best_prefix, x)
    return answer
`
