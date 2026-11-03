export const phases = [
  { id: 'start', label: 'Sort', description: 'Sort the values so two pointers can move monotonically.' },
  { id: 'fix', label: 'Fix first value', description: 'Choose one value and place a pointer just after it and one at the end.' },
  { id: 'inspect', label: 'Sum triple', description: 'Add the three values and compare the sum with the target.' },
  { id: 'exact', label: 'Exact match', description: 'A sum equal to the target cannot be beaten, so stop.' },
  { id: 'update', label: 'Closer sum', description: 'Keep the sum whose distance to the target is smallest.' },
  { id: 'move', label: 'Move pointer', description: 'A sum below the target needs a larger value; a sum above needs a smaller one.' },
  { id: 'done', label: 'Return', description: 'Return the closest sum found.' },
]

export const complexity = 'O(n^2) time after sorting: one fixed value and a two-pointer sweep for each. O(1) extra space beyond the sorted copy.'

export const examples = [
  { label: 'Spread', input: '{"nums":[-4,2,7,1,9],"target":5}' },
  { label: 'Exact', input: '{"nums":[3,-1,8,2,6],"target":9}' },
  { label: 'Negatives', input: '{"nums":[-9,-3,4,10],"target":-1}' },
]

export function parseInput(text) {
  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('Enter JSON like {"nums":[...],"target":n}.')
  }
  const nums = data?.nums
  const target = data?.target
  if (!Array.isArray(nums) || nums.length < 3 || nums.length > 30 || !nums.every(v => Number.isInteger(v) && Math.abs(v) <= 1000)) {
    throw new Error('nums must be 3 to 30 integers from -1000 to 1000.')
  }
  if (!Number.isInteger(target) || Math.abs(target) > 10000) throw new Error('target must be an integer from -10000 to 10000.')
  return { nums: [...nums], target }
}

export function buildTrace({ nums, target }) {
  const a = [...nums].sort((x, y) => x - y)
  const n = a.length
  let best = a[0] + a[1] + a[2]
  const frames = []
  const snap = extra => ({ sorted: [...a], best, target, i: null, lo: null, hi: null, total: null, ...extra })
  const finish = (result, activeLine, message) => {
    frames.push({ phase: 'done', activeLine, message, snapshot: snap({ result }) })
    return { input: { nums, target }, result, frames }
  }
  frames.push({ phase: 'start', activeLine: 2, message: `Sorted: ${a.join(', ')}. Start with ${a[0]} + ${a[1]} + ${a[2]} = ${best} as the best sum.`, snapshot: snap() })
  for (let i = 0; i < n - 2; i++) {
    let lo = i + 1
    let hi = n - 1
    frames.push({ phase: 'fix', activeLine: 3, message: `Fix a[${i}] = ${a[i]}. Pointers start at ${a[lo]} and ${a[hi]}.`, snapshot: snap({ i, lo, hi }) })
    while (lo < hi) {
      const total = a[i] + a[lo] + a[hi]
      frames.push({ phase: 'inspect', activeLine: 6, message: `${a[i]} + ${a[lo]} + ${a[hi]} = ${total}. Distance to target ${Math.abs(total - target)}.`, snapshot: snap({ i, lo, hi, total }) })
      if (total === target) {
        frames.push({ phase: 'exact', activeLine: 7, message: `The sum equals ${target}, so nothing can be closer.`, snapshot: snap({ i, lo, hi, total }) })
        return finish(total, 10, `Return ${total}.`)
      }
      if (Math.abs(total - target) < Math.abs(best - target)) {
        best = total
        frames.push({ phase: 'update', activeLine: 8, message: `New closest sum: ${total}.`, snapshot: snap({ i, lo, hi, total }) })
      }
      if (total < target) lo++
      else hi--
      frames.push({ phase: 'move', activeLine: 9, message: total < target ? `${total} is below ${target}: move lo right.` : `${total} is above ${target}: move hi left.`, snapshot: snap({ i, lo, hi, total }) })
    }
  }
  return finish(best, 10, `Return the closest sum ${best}.`)
}

export const python = `def threeSumClosest(nums, target):
    nums.sort()
    best = nums[0] + nums[1] + nums[2]
    for i in range(len(nums) - 2):
        lo, hi = i + 1, len(nums) - 1
        while lo < hi:
            total = nums[i] + nums[lo] + nums[hi]
            if total == target:
                return total
            if abs(total - target) < abs(best - target):
                best = total
            if total < target:
                lo += 1
            else:
                hi -= 1
    return best`

export const code = [
  'FUNCTION threeSumClosest(nums, target)',
  '    sort nums; best = nums[0] + nums[1] + nums[2]',
  '    FOR i from 0 to n - 3',
  '        lo = i + 1; hi = n - 1',
  '        WHILE lo < hi',
  '            total = nums[i] + nums[lo] + nums[hi]',
  '            IF total == target RETURN total',
  '            IF |total - target| < |best - target| THEN best = total',
  '            IF total < target THEN lo += 1 ELSE hi -= 1',
  '    RETURN best',
].map((text, index) => ({ line: index + 1, text }))

// Pseudocode line -> Python line.
export const pythonLineMap = { 1: 1, 2: 2, 3: 4, 4: 5, 5: 6, 6: 7, 7: 8, 8: 10, 9: 12, 10: 16 }
