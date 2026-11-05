export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums.')
  const { nums } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 30) throw new Error('nums has 1 to 30 values.')
  if (!nums.every(v => Number.isInteger(v) && v >= 0 && v <= 1000)) throw new Error('Each value is an integer from 0 to 1000.')
  return { nums }
}

export function buildTrace({ nums }) {
  const n = nums.length
  const frames = []
  let total = 0
  frames.push({ pythonLine: P('total = 0'), phase: 'start', activeLine: L('let total'), left: -1, right: -1, inner: null, total, message: 'No bowl subarrays counted yet.' })
  for (let left = 0; left < n; left++) {
    let inner = -Infinity
    frames.push({ pythonLine: P('for left in'), phase: 'left', activeLine: L('for (let left'), left, right: -1, inner: null, total, message: `Anchor the left end at index ${left}, value ${nums[left]}.` })
    frames.push({ pythonLine: P("inner_max = float"), phase: 'left', activeLine: L('let inner'), left, right: -1, inner: null, total, message: 'Reset the interior maximum.' })
    for (let right = left + 2; right < n; right++) {
      inner = Math.max(inner, nums[right - 1])
      frames.push({ pythonLine: P('inner_max = max'), phase: 'extend', activeLine: L('inner = Math.max'), left, right, inner, total, message: `Interior now reaches ${inner} (index ${right - 1} joins).` })
      if (inner >= nums[left]) {
        frames.push({ pythonLine: P('break'), phase: 'stop', activeLine: L('break'), left, right, inner, total, message: `${inner} is at least ${nums[left]}, so no longer right end can form a bowl.` })
        break
      }
      if (nums[right] > inner) {
        total += 1
        frames.push({ pythonLine: P('total += 1'), phase: 'count', activeLine: L('total += 1'), left, right, inner, total, message: `Both ends beat ${inner}: bowl [${left}..${right}] counted.` })
      } else {
        frames.push({ pythonLine: P('if nums[right] > inner_max'), phase: 'skip', activeLine: L('if (nums[right] > inner)'), left, right, inner, total, message: `End ${nums[right]} does not beat ${inner}; no bowl ends here.` })
      }
    }
  }
  frames.push({ pythonLine: P('return total'), phase: 'done', activeLine: L('return total'), left: -1, right: -1, inner: null, total, message: `${total} bowl subarray${total === 1 ? '' : 's'} counted.` })
  return { input: { nums }, result: total, frames }
}

export const code = `function countBowlSubarrays(nums) {
  let total = 0
  for (let left = 0; left < nums.length; left++) {
    let inner = -Infinity
    for (let right = left + 2; right < nums.length; right++) {
      inner = Math.max(inner, nums[right - 1])
      if (inner >= nums[left]) break
      if (nums[right] > inner) total += 1
    }
  }
  return total
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const hit = code.find(c => c.text.includes(s))
  if (!hit) throw new Error(`No JavaScript line contains "${s}".`)
  return hit.line
}

export const python = `def count_bowl_subarrays(nums):
    total = 0
    for left in range(len(nums)):
        inner_max = float('-inf')
        for right in range(left + 2, len(nums)):
            inner_max = max(inner_max, nums[right - 1])
            if inner_max >= nums[left]:
                break
            if nums[right] > inner_max:
                total += 1
    return total
`
const P = s => {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`No Python line contains "${s}".`)
  return index + 1
}
