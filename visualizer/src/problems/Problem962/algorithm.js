// Only positions that are lower than every position before them can start a ramp, so they form a stack.
// A sweep from the right pairs each position j with the leftmost stack entry it can reach.
export const code = String.raw`function maxWidthRamp(nums) {
  const stack = []; // candidate starts, values strictly decreasing from bottom to top
  for (let i = 0; i < nums.length; i++) {
    if (stack.length === 0 || nums[i] < nums[stack[stack.length - 1]]) stack.push(i);
  }
  let best = 0;
  for (let j = nums.length - 1; j >= 0; j--) {
    while (stack.length > 0 && nums[stack[stack.length - 1]] <= nums[j]) {
      best = Math.max(best, j - stack.pop()); // the popped start is the leftmost one this end can reach
    }
  }
  return best;
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`Missing JavaScript line for "${s}"`); return i + 1 }

export const python = String.raw`def max_width_ramp(nums):
    stack = []  # candidate starts, values strictly decreasing from bottom to top
    for i in range(len(nums)):
        if not stack or nums[i] < nums[stack[-1]]:
            stack.append(i)
    best = 0
    for j in range(len(nums) - 1, -1, -1):
        while stack and nums[stack[-1]] <= nums[j]:
            best = max(best, j - stack.pop())  # the popped start is the leftmost one this end can reach
    return best`
const PYL = python.split('\n')
const PY = s => { const i = PYL.findIndex(t => t.includes(s)); if (i < 0) throw new Error(`Missing Python line for "${s}"`); return i + 1 }

export const phases = [
  { id: 'stack', label: 'Build stack', description: 'Keep each position that is lower than every earlier one.' },
  { id: 'sweep', label: 'Sweep right', description: 'Pair each right end with the leftmost start it can reach.' },
  { id: 'done', label: 'Answer', description: 'The widest pair found during the sweep.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  const nums = input && input.nums
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 16) {
    throw new Error('Use nums: a list of 2 to 16 integers.')
  }
  if (nums.some(value => !Number.isInteger(value) || value < 0 || value > 99)) {
    throw new Error('Values must be integers from 0 to 99.')
  }
  return { nums }
}

export function buildTrace({ nums }) {
  const frames = []
  const stack = []
  let best = 0
  let bestPair = null
  const snap = (phase, js, py, message, extra = {}) => frames.push({
    phase, activeLine: L(js), pythonLine: PY(py), message, stack: [...stack], best, bestPair, left: null, right: null, ...extra,
  })
  nums.forEach((value, i) => {
    if (stack.length === 0 || value < nums[stack[stack.length - 1]]) {
      stack.push(i)
      snap('stack', 'stack.push(i)', 'stack.append(i)', `Index ${i} (value ${value}) is lower than every earlier value, so it is a start candidate.`, { right: i })
    } else {
      snap('stack', 'nums[i] < nums[stack', 'if not stack or nums[i]', `Index ${i} (value ${value}) is not lower than the last candidate, so it cannot start a ramp.`, { right: i })
    }
  })
  for (let j = nums.length - 1; j >= 0; j--) {
    snap('sweep', 'for (let j', 'for j in range', `Sweep reaches index ${j} (value ${nums[j]}).`, { right: j })
    while (stack.length > 0 && nums[stack[stack.length - 1]] <= nums[j]) {
      const i = stack.pop()
      if (j - i > best) { best = j - i; bestPair = [i, j] }
      snap('sweep', 'best = Math.max', 'best = max', `Start ${i} (value ${nums[i]}) reaches end ${j}: width ${j - i}. Best is now ${best}.`, { left: i, right: j })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return best'), pythonLine: PY('return best'), message: `The widest ramp has width ${best}.`, stack: [], best, bestPair, left: bestPair ? bestPair[0] : null, right: bestPair ? bestPair[1] : null })
  return { input: { nums }, result: best, frames }
}
