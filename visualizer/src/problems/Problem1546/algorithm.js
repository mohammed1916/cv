export const phases = [
  { id: 'start', label: 'Start', description: 'Set the running prefix sum to 0 and remember only the prefix 0 so far.' },
  { id: 'extend', label: 'Extend prefix', description: 'Add the current number to the running prefix sum.' },
  { id: 'match', label: 'Check remembered', description: 'Look for an earlier remembered prefix equal to the current prefix minus the target.' },
  { id: 'cut', label: 'Take subarray', description: 'Count this subarray, then forget earlier prefixes so the next subarray starts after this index.' },
  { id: 'remember', label: 'Remember prefix', description: 'No match: remember this prefix so a later subarray can start right after it.' },
  { id: 'done', label: 'Complete', description: 'Return how many disjoint subarrays were taken.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"nums": [1, 2, 3], "target": 3}.')
  const { nums, target } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 30 || !nums.every(v => Number.isInteger(v) && v >= -9 && v <= 9)) throw new Error('nums is a list of 1 to 30 integers from -9 to 9.')
  if (!Number.isInteger(target) || target < -20 || target > 20) throw new Error('target is an integer from -20 to 20.')
  return { nums, target }
}

export const code = `count = 0
prefix = 0
seen = {0}
for value in nums:
    prefix += value
    if prefix - target is in seen:
        count += 1
        seen = {prefix}
    else:
        seen.add(prefix)
return count`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def max_non_overlapping(nums, target):
    count = 0
    prefix = 0
    seen = {0}
    for value in nums:
        prefix += value
        if prefix - target in seen:
            count += 1
            seen = {prefix}
        else:
            seen.add(prefix)
    return count
`
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export function buildTrace({ nums, target }) {
  const frames = []
  let count = 0, prefix = 0
  let seen = new Set([0])
  const snap = extra => ({ prefix, count, seen: [...seen].sort((a, b) => a - b), ...extra })
  frames.push({ phase: 'start', activeLine: L('seen = {0}'), pythonLine: P('seen = {0}'), snapshot: snap({ index: -1 }),
    message: `Target ${target}. Before any number, the prefix sum is 0 and 0 is the only remembered prefix.` })
  nums.forEach((value, i) => {
    prefix += value
    frames.push({ phase: 'extend', activeLine: L('prefix += value'), pythonLine: P('prefix += value'), snapshot: snap({ index: i }),
      message: `Number ${value} at index ${i} makes the prefix sum ${prefix}.` })
    const need = prefix - target
    if (seen.has(need)) {
      frames.push({ phase: 'match', activeLine: L('if prefix - target'), pythonLine: P('if prefix - target'), snapshot: snap({ index: i, need, matched: true }),
        message: `Prefix ${prefix} minus target ${target} is ${need}, and ${need} is remembered. The values after that prefix up to index ${i} sum to ${target}.` })
      count += 1
      seen = new Set([prefix])
      frames.push({ phase: 'cut', activeLine: L('count += 1'), pythonLine: P('count += 1'), snapshot: snap({ index: i, need, matched: true }),
        message: `Take this subarray: count ${count}. Only prefix ${prefix} is remembered, so the next subarray starts after index ${i} and cannot overlap.` })
    } else {
      frames.push({ phase: 'match', activeLine: L('if prefix - target'), pythonLine: P('if prefix - target'), snapshot: snap({ index: i, need, matched: false }),
        message: `Prefix ${prefix} minus target is ${need}, which is not remembered. No subarray ends at index ${i}.` })
      seen.add(prefix)
      frames.push({ phase: 'remember', activeLine: L('seen.add(prefix)'), pythonLine: P('seen.add(prefix)'), snapshot: snap({ index: i, need, matched: false }),
        message: `Remember prefix ${prefix} for a later subarray that starts after it.` })
    }
  })
  frames.push({ phase: 'done', activeLine: L('return count'), pythonLine: P('return count'), snapshot: snap({ index: nums.length }),
    message: `The greedy choice takes the earliest-ending subarray each time, which leaves the most room. Total: ${count}.` })
  return { input: { nums, target }, result: count, frames }
}
