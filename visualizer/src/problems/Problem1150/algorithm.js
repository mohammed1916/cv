// Original teaching model. The sorted arrays are invented for this visualization.
// Two binary searches find the first position of the target and the first position after it.
// Those two boundaries give the count; a majority needs more than half of the length.

export const phases = [
  { id: 'lower', label: 'Start boundary', description: 'Find the first position whose value is not below the target.' },
  { id: 'upper', label: 'End boundary', description: 'Find the first position whose value is above the target.' },
  { id: 'count', label: 'Count', description: 'Subtract the boundaries to get the number of copies.' },
  { id: 'done', label: 'Result', description: 'Compare twice the count with the array length.' },
]

export const code = [
  'def first_index(nums, target, after_equal):',
  '    lo, hi = 0, len(nums)',
  '    while lo < hi:',
  '        mid = (lo + hi) // 2',
  '        if nums[mid] < target or (after_equal and nums[mid] == target):',
  '            lo = mid + 1',
  '        else:',
  '            hi = mid',
  '    return lo',
  'lower = first_index(nums, target, False)',
  'upper = first_index(nums, target, True)',
  'count = upper - lower',
  'return 2 * count > len(nums)',
].map((text, index) => ({ line: index + 1, text }))

const at = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing code line: ${key}`)
  return index + 1
}

export const python = code.map(line => line.text).join('\n')

export const inputLabel = 'Object with a sorted nums array and a target (JSON)'
export const complexity = 'O(log n) time for the two binary searches. The space is O(1).'
export const examples = [
  { label: 'Majority', input: '{"nums":[2,3,3,3,3,7,8],"target":3}' },
  { label: 'Exactly half', input: '{"nums":[1,4,4,6,8,8],"target":4}' },
  { label: 'Absent', input: '{"nums":[1,2,5,9],"target":3}' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input) || !Array.isArray(input.nums) || !Number.isInteger(input.target)) {
    throw new Error('Use {"nums": [sorted integers], "target": integer}.')
  }
  const { nums, target } = input
  if (nums.length < 1 || nums.length > 16) throw new Error('nums needs 1 to 16 values.')
  nums.forEach((value, i) => {
    if (!Number.isInteger(value)) throw new Error('nums must contain whole numbers.')
    if (i > 0 && value < nums[i - 1]) throw new Error('nums must be sorted from smallest to largest.')
  })
  return { nums: [...nums], target }
}

export function buildTrace({ nums, target }) {
  const n = nums.length
  const frames = []
  const snap = extra => ({ nums, target, lo: 0, hi: n, mid: null, boundary: null, ...extra })

  frames.push({
    phase: 'lower', activeLine: at('lo, hi = 0'),
    message: `Length ${n}, target ${target}. A majority needs more than ${n / 2} copies, so first find where the copies start, then where they end.`,
    snapshot: snap(),
  })

  function search(afterEqual, phase) {
    const boundary = afterEqual ? 'end' : 'start'
    let lo = 0, hi = n
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2)
      const goRight = nums[mid] < target || (afterEqual && nums[mid] === target)
      frames.push({
        phase, activeLine: at(goRight ? 'lo = mid + 1' : 'hi = mid'),
        message: goRight
          ? `Position ${mid} holds ${nums[mid]}, which is not past the ${boundary} boundary yet. Search the right half.`
          : `Position ${mid} holds ${nums[mid]}, so the ${boundary} boundary is at ${mid} or earlier. Search the left half.`,
        snapshot: snap({ lo, hi, mid, boundary }),
      })
      if (goRight) lo = mid + 1
      else hi = mid
    }
    frames.push({
      phase, activeLine: at('return lo'),
      message: `The ${boundary} boundary is at index ${lo}.`,
      snapshot: snap({ lo, hi: lo, mid: null, boundary }),
    })
    return lo
  }

  const lower = search(false, 'lower')
  const upper = search(true, 'upper')
  const count = upper - lower
  frames.push({
    phase: 'count', activeLine: at('count = upper'),
    message: `${upper} - ${lower} = ${count} copies of ${target}.`,
    snapshot: snap({ lo: lower, hi: upper, mid: null, boundary: 'count' }),
  })

  const result = 2 * count > n
  frames.push({
    phase: 'done', activeLine: at('return 2 * count'),
    message: `Twice ${count} is ${2 * count}, which ${result ? 'is more than' : 'is not more than'} ${n}. So ${target} ${result ? 'is' : 'is not'} a majority element.`,
    snapshot: snap({ lo: lower, hi: upper, mid: null, boundary: 'count', result }),
  })
  return { input: { nums, target }, result, frames }
}
