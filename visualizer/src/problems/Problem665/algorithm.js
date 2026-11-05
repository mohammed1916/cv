export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 10000 || nums.some(v => !Number.isInteger(v) || Math.abs(v) > 100000)) throw new Error('Enter a JSON array of 1–10,000 integers from −100,000 to 100,000.')
  return nums
}

// Scan left to right. At the first descent a[i-1] > a[i], lower a[i-1] or raise a[i], whichever keeps the
// previous pair ordered. A second descent means one change is not enough.
export function buildTrace(nums) {
  const a = [...nums]
  let changes = 0
  let result = true
  const frames = [{ phase: 'start', a: [...a], index: 0, changes, fixed: null, activeLine: L('const a = [...nums]'), pythonLine: P('a = list(nums)'), message: 'Allow at most one change to make the array non-decreasing.' }]
  for (let i = 1; i < a.length; i++) {
    if (a[i - 1] > a[i]) {
      changes++
      if (changes > 1) {
        result = false
        frames.push({ phase: 'fail', a: [...a], index: i, changes, fixed: null, activeLine: L('return false'), pythonLine: P('return False'), message: `Second descent at ${i} (${a[i - 1]} > ${a[i]}): one change is not enough.` })
        break
      }
      let fixed
      if (i >= 2 && a[i - 2] > a[i]) { a[i] = a[i - 1]; fixed = i }
      else { a[i - 1] = a[i]; fixed = i - 1 }
      frames.push({ phase: 'fix', a: [...a], index: i, changes, fixed, activeLine: L('a[i] = a[i - 1]'), pythonLine: P('a[i] = a[i - 1]'), message: `Descent at ${i}: change position ${fixed} so the pair before it stays ordered.` })
    } else {
      frames.push({ phase: 'scan', a: [...a], index: i, changes, fixed: null, activeLine: L('for (let i = 1'), pythonLine: P('for i in range(1'), message: `${a[i - 1]} ≤ ${a[i]}: in order.` })
    }
  }
  if (result) frames.push({ phase: 'done', a: [...a], index: a.length - 1, changes, fixed: null, result, activeLine: L('return true'), pythonLine: P('return True'), message: 'At most one change was needed.' })
  return { input: nums, result, frames }
}

const SOURCE = `function checkPossibility(nums) {
  const a = [...nums]
  let changes = 0
  for (let i = 1; i < a.length; i++) {
    if (a[i - 1] > a[i]) {
      changes++
      if (changes > 1) return false
      if (i >= 2 && a[i - 2] > a[i]) a[i] = a[i - 1]
      else a[i - 1] = a[i]
    }
  }
  return true
}`
export const code = SOURCE.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def check_possibility(nums):
    a = list(nums)
    changes = 0
    for i in range(1, len(a)):
        if a[i - 1] > a[i]:
            changes += 1
            if changes > 1:
                return False
            if i >= 2 and a[i - 2] > a[i]:
                a[i] = a[i - 1]
            else:
                a[i - 1] = a[i]
    return True`
const P = s => python.split('\n').findIndex(t => t.includes(s)) + 1
