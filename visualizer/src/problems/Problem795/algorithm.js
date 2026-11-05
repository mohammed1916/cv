export function parseInput(text) {
  const data = JSON.parse(text)
  const { nums, left, right } = data ?? {}
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 200 || nums.some(v => !Number.isInteger(v) || v < 0 || v > 100)) throw new Error('nums must be 1–200 integers from 0 to 100.')
  if (!Number.isInteger(left) || !Number.isInteger(right) || left < 0 || right > 100 || left > right) throw new Error('left and right must be integers with 0 ≤ left ≤ right ≤ 100.')
  return { nums, left, right }
}

const JS_LINES = [
  'function numSubarrayBoundedMax(nums, left, right) {',
  '  let count = 0, lastBad = -1, lastGood = -1 // lastBad: last value above right; lastGood: last value in [left, right]',
  '  for (let i = 0; i < nums.length; i++) {',
  '    if (nums[i] > right) lastBad = i // no subarray ending here can contain it',
  '    if (nums[i] >= left) lastGood = i',
  '    count += lastGood - lastBad // subarrays ending at i that start after lastBad and include a good value',
  '  }',
  '  return count',
  '}',
]
const PY_LINES = [
  'def num_subarray_bounded_max(nums, left, right):',
  '    count = 0',
  '    last_bad = last_good = -1',
  '    for i, value in enumerate(nums):',
  '        if value > right:',
  '            last_bad = i',
  '        if value >= left:',
  '            last_good = i',
  '        count += last_good - last_bad',
  '    return count',
]
const L = s => JS_LINES.findIndex(t => t.includes(s)) + 1
const P = s => PY_LINES.findIndex(t => t.includes(s)) + 1

export const code = JS_LINES.map((text, index) => ({ line: index + 1, text }))
export const python = PY_LINES.join('\n')

// A subarray ending at i has a maximum in [left, right] exactly when it avoids values above right and contains a value in range.
export function buildTrace({ nums, left, right }) {
  let count = 0, lastBad = -1, lastGood = -1
  const frames = [{ phase: 'start', i: -1, lastBad, lastGood, count, added: 0, activeLine: L('let count = 0'), pythonLine: P('count = 0'), message: `Count subarrays whose maximum lies in [${left}, ${right}].` }]
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] > right) lastBad = i
    if (nums[i] >= left) lastGood = i
    const added = lastGood - lastBad
    count += added
    frames.push({ phase: nums[i] > right ? 'bad' : nums[i] >= left ? 'good' : 'small', i, lastBad, lastGood, count, added, activeLine: L('count += lastGood'), pythonLine: P('count += last_good'),
      message: nums[i] > right ? `${nums[i]} is above ${right}: subarrays through it are too big, so the bad marker moves to ${i}.`
        : nums[i] >= left ? `${nums[i]} is in range: subarrays ending here that avoid the bad marker are counted, ${added} new.`
          : `${nums[i]} is below ${left}: it cannot be the maximum alone, but it can join a good subarray; ${added} new.` })
  }
  frames.push({ phase: 'done', i: nums.length - 1, lastBad, lastGood, count, added: 0, result: count, activeLine: L('return count'), pythonLine: P('return count'), message: `${count} subarrays have a maximum in [${left}, ${right}].` })
  return { input: { nums, left, right }, result: count, frames }
}
