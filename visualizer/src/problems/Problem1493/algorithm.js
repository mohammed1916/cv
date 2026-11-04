export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with an empty window, no zeros and a best length of 0.' },
  { id: 'extend', label: 'Extend right', description: 'Add the next value at the right edge of the window.' },
  { id: 'zero', label: 'Count zero', description: 'A zero inside the window counts against the single deletion allowance.' },
  { id: 'shrink', label: 'Shrink left', description: 'While the window holds two or more zeros, move the left edge right.' },
  { id: 'record', label: 'Record length', description: 'A window with at most one zero yields a result of its length minus one.' },
  { id: 'done', label: 'Complete', description: 'Return the longest result seen.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"nums": [1, 1, 0, 1]}.')
  const { nums } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 20 || !nums.every(v => v === 0 || v === 1)) throw new Error('nums is a list of 1 to 20 values, each 0 or 1.')
  return { nums }
}

export function buildTrace({ nums }) {
  const at = n => ({ activeLine: n, pythonLine: n })
  let left = 0
  let zeros = 0
  let best = 0
  const snap = (right, value) => ({ left, right, value, zeros, best })
  const frames = [{ phase: 'start', ...at(2), snapshot: snap(-1, null), message: 'Start with an empty window. Deleting one element means a window with at most one zero works.' }]
  nums.forEach((value, right) => {
    frames.push({ phase: 'extend', ...at(4), snapshot: snap(right, value), message: `Extend the window to index ${right}, which holds ${value}.` })
    if (value === 0) {
      zeros++
      frames.push({ phase: 'zero', ...at(5), snapshot: snap(right, value), message: `Index ${right} is a 0, so the window now has ${zeros} zero(s).` })
    }
    while (zeros > 1) {
      const dropped = nums[left]
      if (dropped === 0) zeros--
      left++
      frames.push({ phase: 'shrink', ...at(9), snapshot: snap(right, value),
        message: dropped === 0 ? `Index ${left - 1} was a 0. The window now has ${zeros} zero(s).` : `Index ${left - 1} was a 1. The window still has ${zeros} zero(s).` })
    }
    best = Math.max(best, right - left)
    frames.push({ phase: 'record', ...at(10), snapshot: snap(right, value),
      message: `Window [${left}, ${right}] has at most one zero. Deleting one element gives ${right - left}. Best: ${best}.` })
  })
  frames.push({ phase: 'done', ...at(11), snapshot: snap(nums.length - 1, null), message: `Return ${best}.` })
  return { input: { nums }, result: best, frames }
}


const pythonLines = [
  'def longest_after_delete(nums):',
  '    left = zeros = best = 0',
  '    for right, value in enumerate(nums):',
  '        if value == 0:',
  '            zeros += 1',
  '        while zeros > 1:',
  '            if nums[left] == 0:',
  '                zeros -= 1',
  '            left += 1',
  '        best = max(best, right - left)',
  '    return best',
]

export const code = [
  "function longestAfterDelete(nums) {",
  "  let left = 0, zeros = 0, best = 0",
  "  for (let right = 0; right < nums.length; right++) {",
  "    const value = nums[right]",
  "    if (value === 0) zeros += 1",
  "    while (zeros > 1) {",
  "      const dropped = nums[left]",
  "      if (dropped === 0) zeros -= 1",
  "      left += 1 }",
  "    best = Math.max(best, right - left) }",
  "  return best }",
].map((text, index) => ({ line: index + 1, text }))
export const python = pythonLines.join('\n')
