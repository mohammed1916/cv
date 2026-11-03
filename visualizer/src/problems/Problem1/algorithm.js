export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with an empty map from each value already seen to its index.' },
  { id: 'check', label: 'Check complement', description: 'Work out the value that would complete the target and look it up in the map.' },
  { id: 'found', label: 'Pair found', description: 'The stored earlier index and the current index form the answer.' },
  { id: 'store', label: 'Store value', description: 'Record the current value and its index for later elements.' },
  { id: 'done', label: 'Complete', description: 'Return the pair, or report that no pair reaches the target.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"nums": [2, 7, 11], "target": 9}.')
  const { nums, target } = input
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 20 || !nums.every(v => Number.isInteger(v) && Math.abs(v) <= 1000)) throw new Error('nums is a list of 2 to 20 integers from -1000 to 1000.')
  if (!Number.isInteger(target) || Math.abs(target) > 2000) throw new Error('target is an integer from -2000 to 2000.')
  return { nums, target }
}

export function buildTrace({ nums, target }) {
  const seen = new Map()
  const snap = (current, need, pair) => ({ current, need, seen: [...seen].map(([value, index]) => ({ value, index })), pair })
  const frames = [{ phase: 'start', activeLine: L('seen = {}'), pythonLine: P('seen = {}'), snapshot: snap(null, null, null), message: `Target ${target}. Scan left to right; each value asks whether an earlier value completes it.` }]
  let result = null
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i]
    const hit = seen.has(need)
    frames.push({ phase: 'check', activeLine: L('if needed in seen'), pythonLine: P('if needed in seen'), snapshot: snap(i, need, null), message: `Index ${i} holds ${nums[i]}, so it needs ${need}. ${hit ? `${need} is stored at index ${seen.get(need)}.` : `${need} has not appeared yet.`}` })
    if (hit) {
      result = [seen.get(need), i]
      frames.push({ phase: 'found', activeLine: L('return [seen[needed], i]'), pythonLine: P('return [seen[needed], i]'), snapshot: snap(i, need, result), message: `Indices ${result[0]} and ${i} sum to ${target}, so the pair is returned.` })
      break
    }
    seen.set(nums[i], i)
    frames.push({ phase: 'store', activeLine: L('seen[value] = i'), pythonLine: P('seen[value] = i'), snapshot: snap(i, need, null), message: `Store ${nums[i]} at index ${i} for the elements that follow.` })
  }
  frames.push({ phase: 'done', activeLine: L('return None'), pythonLine: P('return None'), snapshot: snap(null, null, result), message: result ? `Return [${result.join(', ')}].` : 'No pair reaches the target, so the answer is none.' })
  return { input: { nums, target }, result, frames }
}

export const code = `two sum (nums, target):
  set seen to an empty map
  for each index i with value v in nums:
    set needed to target - v
    if needed in seen:
      return [seen[needed], i]
    store v in seen with index i
  return none`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export const python = `def two_sum(nums, target):
    seen = {}
    for i, value in enumerate(nums):
        needed = target - value
        if needed in seen:
            return [seen[needed], i]
        seen[value] = i
    return None
`
