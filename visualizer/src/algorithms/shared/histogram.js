export const HISTOGRAM_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def largestRectangleArea(self, heights):' },
  { line: 3, text: '        stack = []  # (start, height)' },
  { line: 4, text: '        best = 0' },
  { line: 5, text: '        for i, h in enumerate(heights):' },
  { line: 6, text: '            start = i' },
  { line: 7, text: '            while stack and stack[-1][1] > h:' },
  { line: 8, text: '                idx, ht = stack.pop()' },
  { line: 9, text: '                best = max(best, ht * (i - idx))' },
  { line: 10, text: '                start = idx' },
  { line: 11, text: '            stack.append((start, h))' },
  { line: 12, text: '        for i, h in stack:' },
  { line: 13, text: '            best = max(best, h * (len(heights) - i))' },
  { line: 14, text: '        return best' },
]

export function histogramSteps(heights) {
  const steps = []
  const stack = []
  let best = 0
  steps.push({ phase: 'init', activeLine: 4, heights, i: -1, stack: [...stack], best, area: 0, rect: null, message: 'Initialize stack and best area.' })
  for (let i = 0; i < heights.length; i++) {
    const h = heights[i]
    let start = i
    steps.push({ phase: 'iterate', activeLine: 6, heights, i, h, stack: [...stack], best, area: 0, rect: null, message: `Index ${i}, height ${h}.` })
    while (stack.length && stack[stack.length - 1].h > h) {
      const top = stack.pop()
      const area = top.h * (i - top.start)
      best = Math.max(best, area)
      start = top.start
      steps.push({
        phase: 'pop',
        activeLine: 9,
        heights,
        i,
        h,
        stack: [...stack],
        best,
        area,
        rect: { start: top.start, end: i - 1, height: top.h },
        message: `Pop height ${top.h}, width ${i - top.start}, area ${area}.`,
      })
    }
    stack.push({ start, h })
    steps.push({ phase: 'push', activeLine: 11, heights, i, h, stack: [...stack], best, area: 0, rect: null, message: `Push bar (${start}, ${h}).` })
  }
  for (const item of stack) {
    const area = item.h * (heights.length - item.start)
    best = Math.max(best, area)
    steps.push({
      phase: 'finalize',
      activeLine: 13,
      heights,
      i: heights.length - 1,
      h: item.h,
      stack: [...stack],
      best,
      area,
      rect: { start: item.start, end: heights.length - 1, height: item.h },
      message: `Finalize bar ${item.h}: area=${area}.`,
    })
  }
  steps.push({ phase: 'done', activeLine: 14, heights, i: heights.length - 1, stack: [...stack], best, area: 0, rect: null, message: `Largest rectangle area = ${best}.` })
  return steps.map(step => structuredClone(step))
}
