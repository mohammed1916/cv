export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.maxHeights) || input.maxHeights.length < 1 || input.maxHeights.length > 12) throw new Error('maxHeights holds 1 to 12 integers in this visualization (the full problem allows 10^5).')
  if (!input.maxHeights.every(v => Number.isInteger(v) && v >= 1 && v <= 20)) throw new Error('Each maximum height is an integer from 1 to 20 here (the full problem allows 10^9).')
  return { maxHeights: input.maxHeights }
}

export const code = `function maximumSumOfHeights(maxHeights)
  n <- length of maxHeights
  left <- array of n zeros, stack <- empty
  for i from 0 to n - 1
    while stack is not empty and maxHeights[top] is at least maxHeights[i], pop
    prev <- top of stack, or -1 if empty
    left[i] <- (prev >= 0 ? left[prev] : 0) + maxHeights[i] * (i - prev)
    push i
  right <- array of n zeros, stack <- empty
  for i from n - 1 down to 0
    while stack is not empty and maxHeights[top] is at least maxHeights[i], pop
    next <- top of stack, or n if empty
    right[i] <- (next < n ? right[next] : 0) + maxHeights[i] * (next - i)
    push i
  best <- the largest left[i] + right[i] - maxHeights[i]
  RETURN best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CL = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export const python = `def maximum_sum_of_heights(max_heights):
    n = len(max_heights)
    left = [0] * n
    stack = []
    for i in range(n):
        while stack and max_heights[stack[-1]] >= max_heights[i]:
            stack.pop()
        prev = stack[-1] if stack else -1
        left[i] = (left[prev] if prev >= 0 else 0) + max_heights[i] * (i - prev)
        stack.append(i)
    right = [0] * n
    stack = []
    for i in range(n - 1, -1, -1):
        while stack and max_heights[stack[-1]] >= max_heights[i]:
            stack.pop()
        nxt = stack[-1] if stack else n
        right[i] = (right[nxt] if nxt < n else 0) + max_heights[i] * (nxt - i)
        stack.append(i)
    best = 0
    for i in range(n):
        best = max(best, left[i] + right[i] - max_heights[i])
    return best
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

// The peak at i keeps maxHeights[i]; towers between a smaller neighbour and i are capped to maxHeights[i].
export function buildTrace({ maxHeights }) {
  const n = maxHeights.length
  const frames = []
  const left = Array(n).fill(0)
  const right = Array(n).fill(0)
  const snap = (fields) => frames.push({ maxHeights, left: [...left], right: [...right], l: -1, r: -1, peak: -1, best: null, result: null, ...fields })
  snap({ phase: 'setup', activeLine: CL('left <- array of n zeros'), pythonLine: PL('left = [0] * n'), message: 'Build left sums: the best mountain up to each peak.' })
  let stack = []
  for (let i = 0; i < n; i++) {
    while (stack.length && maxHeights[stack[stack.length - 1]] >= maxHeights[i]) stack.pop()
    const prev = stack.length ? stack[stack.length - 1] : -1
    left[i] = (prev >= 0 ? left[prev] : 0) + maxHeights[i] * (i - prev)
    snap({ phase: 'left', activeLine: CL('left[i] <- (prev'), pythonLine: PL('left[i] = (left[prev]'), l: prev, r: i, peak: i, message: `Towers ${prev + 1} to ${i} are capped at ${maxHeights[i]}; left sum at ${i} is ${left[i]}.` })
    stack.push(i)
  }
  stack = []
  for (let i = n - 1; i >= 0; i--) {
    while (stack.length && maxHeights[stack[stack.length - 1]] >= maxHeights[i]) stack.pop()
    const next = stack.length ? stack[stack.length - 1] : n
    right[i] = (next < n ? right[next] : 0) + maxHeights[i] * (next - i)
    snap({ phase: 'right', activeLine: CL('right[i] <- (next'), pythonLine: PL('right[i] = (right[nxt]'), l: i, r: next, peak: i, message: `Towers ${i} to ${next - 1} are capped at ${maxHeights[i]}; right sum at ${i} is ${right[i]}.` })
    stack.push(i)
  }
  let best = 0, bestPeak = -1
  for (let i = 0; i < n; i++) {
    const total = left[i] + right[i] - maxHeights[i]
    if (total > best) { best = total; bestPeak = i }
    snap({ phase: 'best', activeLine: CL('best <- the largest'), pythonLine: PL('best = max(best, left[i]'), l: -1, r: -1, peak: i, best, message: `Peak ${i} gives a total of ${total}; best so far is ${best}.` })
  }
  snap({ phase: 'done', activeLine: CL('RETURN best'), pythonLine: PL('return best'), l: -1, r: -1, peak: bestPeak, best, result: best, message: `The tallest total mountain is ${best}.` })
  return { input: { maxHeights }, result: best, frames }
}
