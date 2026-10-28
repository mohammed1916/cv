export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 20) throw new Error('Use a JSON array of 1 to 20 integers.')
  if (nums.some(v => !Number.isInteger(v) || v < 0 || v > 20)) throw new Error('Values are integers from 0 to 20.')
  return nums
}

export function buildTrace(nums) {
  const waiting = new Set()
  let pairs = 0
  const frames = [{ phase: 'start', activeLine: L('waiting = empty set'), index: -1, waiting: [], pairs: 0, message: 'No values are waiting for a partner yet.' }]
  for (let i = 0; i < nums.length; i++) {
    const v = nums[i]
    if (waiting.has(v)) {
      waiting.delete(v)
      pairs += 1
      frames.push({ phase: 'pair', activeLine: L('pairs = pairs + 1'), index: i, waiting: [...waiting], pairs, message: `${v} finds a waiting partner: one more pair.` })
    } else {
      waiting.add(v)
      frames.push({ phase: 'wait', activeLine: L('add v to waiting'), index: i, waiting: [...waiting], pairs, message: `${v} has no partner yet, so it waits.` })
    }
  }
  const result = [pairs, waiting.size]
  frames.push({ phase: 'done', activeLine: L('return [pairs'), index: -1, waiting: [...waiting], pairs, message: `Pairs: ${pairs}, leftover: ${waiting.size}.` })
  return { input: nums, result, frames }
}

export const code = `pairs and leftover of the array
  waiting = empty set
  pairs = 0
  for each value v in nums
    if v is in waiting then
      remove v from waiting
      pairs = pairs + 1
    otherwise
      add v to waiting
  return [pairs, size of waiting]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def number_of_pairs(nums):
    waiting = set()
    pairs = 0
    for v in nums:
        if v in waiting:
            waiting.remove(v)
            pairs += 1
        else:
            waiting.add(v)
    return [pairs, len(waiting)]
`
