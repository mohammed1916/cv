export const phases = [
  { id: 'start', label: 'Sort', description: 'Sort the values. Equal values become neighbours, so duplicates are easy to skip.' },
  { id: 'anchor', label: 'Fix the first value', description: 'Pick a value as the first member and search the values after it for two that sum to its negative.' },
  { id: 'scan', label: 'Move the ends', description: 'With two pointers at the ends of the rest, a small sum moves the left pointer right and a large sum moves the right pointer left.' },
  { id: 'found', label: 'Record a triple', description: 'The three values sum to zero, so this triple is recorded and both pointers move past duplicates.' },
  { id: 'done', label: 'Complete', description: 'Return every distinct triple that sums to zero.' },
]

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 3 || nums.length > 12 || !nums.every(v => Number.isInteger(v) && Math.abs(v) <= 10)) throw new Error('Enter a JSON array of 3 to 12 integers from -10 to 10.')
  return nums
}

export function buildTrace(values) {
  const nums = [...values].sort((a, b) => a - b)
  const n = nums.length
  const triples = []
  const snap = (i, left, right, total, triple = null) => ({ sorted: nums, i, left, right, total, triple, triples: triples.map(t => [...t]) })
  const frames = [{
    phase: 'start', activeLine: L('sort nums ascending'), pythonLine: P('nums.sort()'), snapshot: snap(null, null, null, null),
    message: `Sorted: ${nums.join(', ')}. A triple that sums to zero must start with some value, and its two partners come from the values after it.`,
  }]
  for (let i = 0; i <= n - 3; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) {
      frames.push({
        phase: 'anchor', activeLine: L('if i > 0 and nums[i]'), pythonLine: P('if i > 0 and nums[i] == nums[i - 1]'), snapshot: snap(i, null, null, null),
        message: `Anchor ${nums[i]} repeats the value before it. Every triple with it was already found, so skip it.`,
      })
      continue
    }
    frames.push({
      phase: 'anchor', activeLine: L('left = i + 1'), pythonLine: P('left, right = i + 1'), snapshot: snap(i, i + 1, n - 1, null),
      message: `Anchor ${nums[i]} at index ${i}. Search the values after it for a pair that sums to ${-nums[i]}.`,
    })
    let left = i + 1, right = n - 1
    while (left < right) {
      const total = nums[i] + nums[left] + nums[right]
      if (total < 0) {
        frames.push({
          phase: 'scan', activeLine: L('if total < 0'), pythonLine: P('if total < 0'), snapshot: snap(i, left, right, total),
          message: `${nums[i]} + ${nums[left]} + ${nums[right]} = ${total} is too small. Move the left pointer right to a larger value.`,
        })
        left += 1
      } else if (total > 0) {
        frames.push({
          phase: 'scan', activeLine: L('else if total > 0'), pythonLine: P('elif total > 0'), snapshot: snap(i, left, right, total),
          message: `${nums[i]} + ${nums[left]} + ${nums[right]} = ${total} is too large. Move the right pointer left to a smaller value.`,
        })
        right -= 1
      } else {
        const triple = [nums[i], nums[left], nums[right]]
        triples.push(triple)
        frames.push({
          phase: 'found', activeLine: L('add [nums[i]'), pythonLine: P('triples.append'), snapshot: snap(i, left, right, total, triple),
          message: `${triple.join(' + ')} = 0, so [${triple.join(', ')}] is recorded. Move both pointers and skip repeated values.`,
        })
        left += 1
        right -= 1
        while (left < right && nums[left] === nums[left - 1]) left += 1
        while (left < right && nums[right] === nums[right + 1]) right -= 1
      }
    }
  }
  frames.push({
    phase: 'done', activeLine: L('return triples'), pythonLine: P('return triples'), snapshot: snap(null, null, null, null),
    message: triples.length ? `${triples.length} distinct triple${triples.length === 1 ? '' : 's'} sum to zero.` : 'No three values sum to zero.',
  })
  return { input: values, result: triples, frames }
}

export const code = `three sum (nums):
  sort nums ascending
  triples = []
  for i from 0 to n - 3:
    if i > 0 and nums[i] == nums[i - 1]: continue
    left = i + 1, right = n - 1
    while left < right:
      total = nums[i] + nums[left] + nums[right]
      if total < 0: left = left + 1
      else if total > 0: right = right - 1
      else:
        add [nums[i], nums[left], nums[right]] to triples
        move both pointers, skipping repeated values
  return triples`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def three_sum(nums):
    nums.sort()
    triples = []
    for i in range(len(nums) - 2):
        if i > 0 and nums[i] == nums[i - 1]:
            continue
        left, right = i + 1, len(nums) - 1
        while left < right:
            total = nums[i] + nums[left] + nums[right]
            if total < 0:
                left += 1
            elif total > 0:
                right -= 1
            else:
                triples.append([nums[i], nums[left], nums[right]])
                left += 1
                right -= 1
                while left < right and nums[left] == nums[left - 1]:
                    left += 1
                while left < right and nums[right] == nums[right + 1]:
                    right -= 1
    return triples
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
