export function parseInput(text) {
  const value = JSON.parse(text)
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Use an object with nums and k.')
  const { nums, k } = value
  if (!Array.isArray(nums) || nums.length < 3 || nums.length > 12 || nums.length % 3 !== 0) throw new Error('nums must have 3, 6, 9 or 12 integers.')
  if (nums.some(v => !Number.isInteger(v) || v < 0 || v > 50)) throw new Error('nums values are integers from 0 to 50.')
  if (!Number.isInteger(k) || k < 0 || k > 50) throw new Error('k is an integer from 0 to 50.')
  return { nums, k }
}

export function buildTrace({ nums, k }) {
  const sorted = [...nums].sort((a, b) => a - b)
  const groups = []
  const frames = [{ phase: 'sort', activeLine: L('sort nums'), at: -1, groups: [], message: `Sorted: [${sorted.join(', ')}]. Consecutive triples are the tightest candidates.` }]
  for (let i = 0; i < sorted.length; i += 3) {
    const group = sorted.slice(i, i + 3)
    const spread = group[2] - group[0]
    if (spread > k) {
      frames.push({ phase: 'fail', activeLine: L('if the largest minus'), at: i, groups: groups.map(g => [...g]), message: `Group [${group.join(', ')}] spans ${spread}, above k = ${k}. No valid split exists.` })
      frames.push({ phase: 'done', activeLine: L('return an empty'), at: -1, groups: [], message: 'No valid split, so the answer is an empty array.' })
      return { input: { nums, k }, result: [], frames }
    }
    groups.push(group)
    frames.push({ phase: 'group', activeLine: L('add the group'), at: i, groups: groups.map(g => [...g]), message: `Group [${group.join(', ')}] spans ${spread}, which fits within k.` })
  }
  frames.push({ phase: 'done', activeLine: L('return groups'), at: -1, groups: groups.map(g => [...g]), message: `Found ${groups.length} valid groups.` })
  return { input: { nums, k }, result: groups, frames }
}

export const code = `divide nums into groups of three with max minus min at most k:
  sort nums into ascending order
  set groups to an empty list
  for each start index i = 0, 3, 6, and so on do
    take the three values from i to i plus 2 as a group
    if the largest minus the smallest is greater than k then
      return an empty array
    add the group to groups
  return groups`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def divide_array(nums, k):
    values = sorted(nums)
    groups = []
    for i in range(0, len(values), 3):
        group = values[i:i + 3]
        if group[2] - group[0] > k:
            return []
        groups.append(group)
    return groups
`
