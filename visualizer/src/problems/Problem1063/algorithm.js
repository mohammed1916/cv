export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with no open starting positions.' },
  { id: 'scan', label: 'Scan right', description: 'Look at the next right end. Starts whose value is larger than it are closed.' },
  { id: 'close', label: 'Close start', description: 'A start closes here. Its valid subarrays end just before this position.' },
  { id: 'push', label: 'Open start', description: 'The current position opens as a new start, since it is at least as large as the starts still open.' },
  { id: 'done', label: 'Complete', description: 'The total of all closed counts is the answer.' },
]

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.nums)) {
    throw new Error('Use an object with a nums array, for example {"nums":[2,5,1]}.')
  }
  const { nums } = data
  if (nums.length < 1 || nums.length > 40) throw new Error('nums must have 1 to 40 values.')
  if (!nums.every(v => Number.isInteger(v) && v >= 0 && v <= 1000)) throw new Error('Each value must be an integer from 0 to 1000.')
  return { nums }
}

const pseudo = `count_valid(nums):
  stack = empty, total = 0
  for right from 0 to length:
    while stack and (right is the end or stack top value > nums[right]):
      start = pop the stack
      total = total + (right - start)
    if right < length:
      push right onto the stack
  return total`
const py = `def count_valid(nums):
    stack, total = [], 0
    for right in range(len(nums) + 1):
        while stack and (right == len(nums) or nums[stack[-1]] > nums[right]):
            start = stack.pop()
            total += right - start
        if right < len(nums):
            stack.append(right)
    return total`

export const code = pseudo.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = py

const LINE = { start: 2, scan: 4, close: 6, push: 8, done: 9 }

export function buildTrace(input) {
  const { nums } = input
  const n = nums.length
  const frames = []
  const stack = []
  let total = 0
  const closed = []

  const frame = (phase, activeLine, message, right) => frames.push({
    phase, activeLine, message,
    snapshot: { nums, right, stack: [...stack], total, closed: [...closed] },
  })

  frame('start', LINE.start, 'No starts are open and the total is 0. A start is a left end whose subarrays are still valid.', -1)
  for (let right = 0; right <= n; right++) {
    const atEnd = right === n
    frame('scan', LINE.scan, atEnd
      ? 'The array has ended, so every remaining start closes at the end boundary.'
      : `Next right boundary: value ${nums[right]} at position ${right}.`, right)
    while (stack.length && (atEnd || nums[stack[stack.length - 1]] > nums[right])) {
      const start = stack.pop()
      const count = right - start
      total += count
      closed.push({ start, count })
      frame('close', LINE.close, atEnd
        ? `Start ${start} closes at the end. Its ${count} subarrays run to the last position.`
        : `Start ${start} (value ${nums[start]}) closes at ${right}, where ${nums[right]} is smaller. Its ${count} valid subarrays are counted.`, right)
    }
    if (!atEnd) {
      stack.push(right)
      frame('push', LINE.push, `Position ${right} opens as a start. Open starts now hold values in nondecreasing order.`, right)
    }
  }
  frame('done', LINE.done, `All closes added up to ${total} valid subarrays.`, n)
  return { input, result: total, frames }
}
