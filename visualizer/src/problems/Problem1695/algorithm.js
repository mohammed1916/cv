export const phases = [
  { id: 'start', label: 'Start', description: 'The window is empty and the best score is 0.' },
  { id: 'inspect', label: 'Read value', description: 'Look up where the incoming value last appeared.' },
  { id: 'shrink', label: 'Drop repeat', description: 'Remove everything up to the old copy so the window is unique again.' },
  { id: 'extend', label: 'Add value', description: 'Add the incoming value to the window sum.' },
  { id: 'update', label: 'Record best', description: 'Keep the larger of the best score and this window sum.' },
  { id: 'done', label: 'Return', description: 'Return the best sum found over all windows.' },
]

export function parseInput(text) {
  let value
  try { value = JSON.parse(text) } catch { throw new Error('Enter a JSON array such as [4, 2, 4, 5].') }
  if (!Array.isArray(value) || value.length < 1 || value.length > 1000) throw new Error('Use an array of 1 to 1000 numbers.')
  if (!value.every(item => Number.isInteger(item) && item >= 1 && item <= 10000)) throw new Error('Every value must be an integer from 1 to 10000.')
  return value
}

export function buildTrace(nums) {
  const lastSeen = new Map()
  let left = 0, total = 0, best = 0
  const frames = [{ phase: 'start', activeLine: 2, message: 'Empty window: sum 0 and best 0.', snapshot: { left, right: -1, total, best, value: null, seen: -1 } }]
  nums.forEach((value, right) => {
    const seen = lastSeen.get(value) ?? -1
    frames.push({ phase: 'inspect', activeLine: 5, message: seen >= left ? `${value} is already in the window at index ${seen}.` : `${value} is new to the window.`, snapshot: { left, right, total, best, value, seen } })
    if (seen >= left) {
      for (let index = left; index <= seen; index++) total -= nums[index]
      left = seen + 1
      frames.push({ phase: 'shrink', activeLine: 7, message: `Remove indices through ${seen}; the window starts at ${left} and sums to ${total}.`, snapshot: { left, right, total, best, value, seen } })
    }
    lastSeen.set(value, right)
    total += value
    frames.push({ phase: 'extend', activeLine: 8, message: `Add ${value}; the window [${left}..${right}] sums to ${total}.`, snapshot: { left, right, total, best, value, seen } })
    best = Math.max(best, total)
    frames.push({ phase: 'update', activeLine: 9, message: `Best is now ${best}.`, snapshot: { left, right, total, best, value, seen } })
  })
  frames.push({ phase: 'done', activeLine: 10, message: `Return ${best}.`, snapshot: { left, right: nums.length - 1, total, best, value: null, seen: -1 } })
  return { input: nums, result: best, frames }
}

export const python = `def maximum_unique_subarray_sum(nums):
    last = {}
    left = total = best = 0
    for right, value in enumerate(nums):
        seen = last.get(value, -1)
        if seen >= left:
            for index in range(left, seen + 1):
                total -= nums[index]
            left = seen + 1
        last[value] = right
        total += value
        best = max(best, total)
    return best`

export const code = [
  'FUNCTION maxUniqueSum(nums)',
  '    lastSeen = empty map; left = 0; total = 0; best = 0',
  '    FOR right = 0 TO length - 1',
  '        value = nums[right]',
  '        seen = lastSeen[value], or -1 if absent',
  '        IF seen >= left',
  '            subtract nums[left .. seen] from total; left = seen + 1',
  '        lastSeen[value] = right; total = total + value',
  '        best = max(best, total)',
  '    RETURN best',
].map((text, index) => ({ line: index + 1, text }))

// Pseudocode activeLine -> Python line.
export const pythonLineMap = { 1: 1, 2: 2, 3: 4, 4: 4, 5: 5, 6: 6, 7: 8, 8: 10, 9: 12, 10: 13 }
