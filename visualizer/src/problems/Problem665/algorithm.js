export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 10000 || nums.some(v => !Number.isInteger(v) || Math.abs(v) > 100000)) throw new Error('Enter a JSON array of 1–10,000 integers with |v| ≤ 100,000.')
  return nums
}

// Find the first descent. Lowering the left value works if the value before it is not larger than the right
// value; otherwise the right value must be raised. A second descent means the answer is false.
export function buildTrace(nums) {
  const a = [...nums]
  let changes = 0
  const frames = [{ phase: 'start', index: -1, changes, values: [...a], activeLine: 2, message: 'Scan for descents; at most one is allowed.' }]
  for (let i = 1; i < a.length; i++) {
    if (a[i - 1] <= a[i]) continue
    changes++
    if (changes > 1) {
      frames.push({ phase: 'reject', index: i, changes, values: [...a], activeLine: 6, message: `Second descent at ${i - 1}, ${i}: one change cannot fix both.` })
      break
    }
    if (i < 2 || a[i - 2] <= a[i]) { a[i - 1] = a[i]; frames.push({ phase: 'lower', index: i - 1, changes, values: [...a], activeLine: 8, message: `Lower a[${i - 1}] to ${a[i]}.` }) }
    else { a[i] = a[i - 1]; frames.push({ phase: 'raise', index: i, changes, values: [...a], activeLine: 10, message: `Raise a[${i}] to ${a[i - 1]}.` }) }
  }
  const result = changes <= 1
  frames.push({ phase: 'done', index: a.length - 1, changes, values: [...a], result, activeLine: 12, message: result ? 'At most one change makes the array non-decreasing.' : 'More than one change is needed.' })
  return { input: nums, result, frames }
}

export const code = `copy nums into a working array; set edits to 0
for each index i from 1 to the last index:
  if working[i] is less than working[i - 1], count one edit
  if edits is more than 1, return false
  if i < 2 or working[i] >= working[i - 2], lower working[i - 1] to working[i]
  otherwise raise working[i] to working[i - 1]
return true`.split('\n').map((text, index) => ({ line: index + 1, text }))

// Scan trace: activeLine 1 (setup), 4 (update per index, line 3 check), inspect (second descent rejects, line 4), done (line 7 or 4).
// The rejection frame is the only inspect frame; the done frame is line 4 for false and 7 for true.
export const LINE_MAP = { 1: 1, 4: 3 }

export function familyLine(frame) {
  if (frame.phase === 'done') return frame.result === false ? 4 : 7
  if (frame.phase === 'inspect') return 4
  return LINE_MAP[frame.activeLine] ?? frame.activeLine
}

export const python = `def check_possibility(nums):
    working = list(nums)
    edits = 0
    for i in range(1, len(working)):
        if working[i] < working[i - 1]:
            edits += 1
            if edits > 1:
                return False
            if i < 2 or working[i] >= working[i - 2]:
                working[i - 1] = working[i]
            else:
                working[i] = working[i - 1]
    return True`
