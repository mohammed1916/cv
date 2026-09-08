export function parseInput(text) {
  const data = JSON.parse(text), nums = data?.nums, digit = data?.digit
  if (!Array.isArray(nums) || !nums.length || nums.length > 1000 || nums.some(n => !Number.isInteger(n) || n < 1 || n > 1000000)
    || !Number.isInteger(digit) || digit < 0 || digit > 9) throw new Error('Enter {"nums":[12,22],"digit":2}: 1–1000 positive integers up to 1,000,000, and a digit from 0 to 9.')
  return { nums, digit }
}
export function buildTrace({ nums, digit }) {
  let total = 0
  const counts = [], frames = [{ phase: 'start', index: -1, total, local: 0, activeLine: 2, message: 'Count every matching decimal digit, including repeated matches inside the same number.' }]
  nums.forEach((value, index) => {
    let remaining = value, local = 0, position = 0
    frames.push({ phase: 'number', index, remaining, local, total, activeLine: 4, message: `Start nums[${index}]=${value}; reset its local count, retaining total ${total}.` })
    while (remaining > 0) {
      const before = remaining, extracted = before % 10
      if (extracted === digit) { local++; total++ }
      remaining = Math.floor(before / 10)
      frames.push({ phase: 'extract', index, before, extracted, remaining, local, total, position, activeLine: 6,
        message: `${before} % 10 = ${extracted}: ${extracted === digit ? 'match, increment count' : 'no match'}. Remove that digit: ${before} // 10 = ${remaining}.` })
      position++
    }
    counts.push(local)
    frames.push({ phase: 'finish', index, remaining: 0, local, total, activeLine: 5, message: `No digits remain in nums[${index}]. Its contribution is ${local}; total ${total}.` })
  })
  frames.push({ phase: 'done', index: -1, total, local: 0, activeLine: 8, message: `Return ${total} digit occurrences across all ${nums.length} numbers.` })
  return { input: [...nums], digit, counts, result: total, frames }
}
export const code = `def countDigitAppearances(nums, digit):
    total = 0
    for value in nums:
        remaining = value
        while remaining > 0:
            total += (remaining % 10 == digit)
            remaining //= 10
    return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
