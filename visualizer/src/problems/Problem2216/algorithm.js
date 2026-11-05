// LeetCode 2216: Minimum Deletions to Make Array Beautiful.
// A beautiful array has even length and nums[i] != nums[i + 1] for every even i. Build the kept array greedily:
// a value joins when the kept length is even (it opens a new pair), or when it differs from the last kept value
// (it closes a pair). A value equal to the last kept one at an odd length must be deleted. If the kept length ends
// odd, the last kept value is also deleted.

const MAX_LEN = 14
const MAX_VALUE = 5

export function parseInput(text) {
  let nums
  try { nums = JSON.parse(text) } catch { throw new Error('Use a JSON array of integers, e.g. [1,1,2,3,5].') }
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > MAX_LEN) throw new Error(`Use 1 to ${MAX_LEN} values. The visualization caps the length there.`)
  if (!nums.every(v => Number.isInteger(v) && v >= 0 && v <= MAX_VALUE)) throw new Error(`Each value is an integer from 0 to ${MAX_VALUE}.`)
  return { nums }
}

export const code = `FUNCTION minDeletion(nums)
    kept ← empty list
    deleted ← 0
    FOR each value x in nums
        IF length(kept) is even OR kept[last] ≠ x THEN
            append x to kept
        ELSE
            deleted ← deleted + 1
    IF length(kept) is odd THEN
        deleted ← deleted + 1
    RETURN deleted`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def min_deletion(nums):
    kept = []
    deleted = 0
    for x in nums:
        if len(kept) % 2 == 0 or kept[-1] != x:
            kept.append(x)
        else:
            deleted += 1
    if len(kept) % 2 == 1:
        deleted += 1
    return deleted
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'scan', label: 'Scan', description: 'Keep a value unless it would sit as the second of an equal pair.' },
  { id: 'parity', label: 'Parity', description: 'If the kept length is odd at the end, drop the last value.' },
  { id: 'done', label: 'Result', description: 'The number of deletions.' },
]

export function buildTrace({ nums }) {
  const kept = []
  let deleted = 0
  const frames = []
  const push = (phase, index, activeLine, pythonLine, message, extra = {}) => frames.push({ phase, index, activeLine, pythonLine, message, nums, kept: kept.slice(), deleted, ...extra })
  push('scan', -1, L('kept ← empty'), P('kept = []'), `Scan ${nums.length} value(s) left to right.`)
  nums.forEach((x, i) => {
    if (kept.length % 2 === 0 || kept[kept.length - 1] !== x) {
      kept.push(x)
      push('scan', i, L('IF length(kept) is even'), P('if len(kept) % 2 == 0'), `${x} is kept (kept length ${kept.length}).`, { keep: true })
    } else {
      deleted += 1
      push('scan', i, L('ELSE'), P('deleted += 1'), `${x} equals the last kept value at an odd position, so it is deleted. Deleted ${deleted}.`, { keep: false })
    }
  })
  if (kept.length % 2 === 1) {
    const dropped = kept.pop()
    deleted += 1
    push('parity', -1, L('IF length(kept) is odd'), P('if len(kept) % 2 == 1'), `The kept length is odd, so ${dropped} is removed too. Deleted ${deleted}.`, { dropped })
  }
  push('done', -1, L('RETURN deleted'), P('return deleted'), `${deleted} deletion(s) make the array beautiful.`, { result: deleted })
  return { input: { nums }, result: deleted, frames }
}
