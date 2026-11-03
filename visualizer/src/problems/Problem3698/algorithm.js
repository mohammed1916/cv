const L = s => code.findIndex(c => c.text.includes(s)) + 1
const PY = s => python.split('\n').findIndex(line => line.includes(s)) + 1

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 20 || !nums.every(v => Number.isInteger(v) && v >= 1 && v <= 100)) throw new Error('Use a JSON array of 2 to 20 integers from 1 to 100.')
  return { nums }
}

const strictlyUp = values => values.every((v, i) => i === 0 || values[i - 1] < v)
const strictlyDown = values => values.every((v, i) => i === 0 || values[i - 1] > v)

export function buildTrace({ nums }) {
  const frames = []
  let best = -1
  for (let cut = 0; cut < nums.length - 1; cut++) {
    const left = nums.slice(0, cut + 1)
    const right = nums.slice(cut + 1)
    const valid = strictlyUp(left) && strictlyDown(right)
    const diff = valid ? Math.abs(left.reduce((a, b) => a + b, 0) - right.reduce((a, b) => a + b, 0)) : null
    if (valid) best = best === -1 ? diff : Math.min(best, diff)
    frames.push({ pythonLine: PY('if all(a < b'), phase: 'cut', activeLine: L('for each cut'), cut, valid, diff, best,
      message: valid ? `Cut after index ${cut}: both parts are valid, difference ${diff}.` : `Cut after index ${cut} is not valid.` })
  }
  frames.push({ pythonLine: PY('return best'), phase: 'done', activeLine: L('return'), cut: -1, valid: null, diff: null, best,
    message: best === -1 ? 'No cut works, so the answer is -1.' : `Smallest difference: ${best}.` })
  return { input: { nums }, result: best, frames }
}

export const code = [
  'split into a strictly increasing left and strictly decreasing right',
  '  best = -1',
  '  for each cut leaving both parts nonempty',
  '    check that the left part strictly increases',
  '    check that the right part strictly decreases',
  '    if both hold, keep the smaller absolute difference of sums',
  '  return best',
].map((text, index) => ({ line: index + 1, text }))

export const python = `def split_min_difference(nums):
    n = len(nums)
    best = -1
    for cut in range(n - 1):
        left = nums[:cut + 1]
        right = nums[cut + 1:]
        if all(a < b for a, b in zip(left, left[1:])) and all(a > b for a, b in zip(right, right[1:])):
            diff = abs(sum(left) - sum(right))
            best = diff if best == -1 else min(best, diff)
    return best
`
