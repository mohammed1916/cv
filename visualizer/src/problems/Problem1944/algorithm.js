// LeetCode 1944: scan from the right with a stack of heights that could still be seen. Each popped person is seen once; the first person left on the stack is seen too.
const SOURCE = [
  "function canSeePersonsCount(heights) {",
  "  const n = heights.length",
  "  const answer = new Array(n).fill(0)",
  "  const stack = []",
  "  for (let i = n - 1; i >= 0; i--) {",
  "    while (stack.length && heights[stack[stack.length - 1]] < heights[i]) {",
  "      stack.pop()",
  "      answer[i]++",
  "    }",
  "    if (stack.length) answer[i]++",
  "    stack.push(i)",
  "  }",
  "  return answer",
  "}",
]

export const code = SOURCE.map((text, index) => ({ line: index + 1, text }))

export const python = `def can_see_persons_count(heights):
    n = len(heights)
    answer = [0] * n
    stack = []
    for i in range(n - 1, -1, -1):
        while stack and heights[stack[-1]] < heights[i]:
            stack.pop()
            answer[i] += 1
        if stack:
            answer[i] += 1
        stack.append(i)
    return answer
`

const L = text => { const i = SOURCE.findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no code line: ${text}`); return i + 1 }
const P = text => { const i = python.split('\n').findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no python line: ${text}`); return i + 1 }

export const phases = [
  { id: 'pop', label: 'Pop shorter', description: 'Pop people shorter than the current one; each is visible.' },
  { id: 'see', label: 'Next taller', description: 'The remaining top of the stack is visible too.' },
  { id: 'done', label: 'Result', description: 'Visible counts for everyone.' },
]

export function parseInput(text) {
  let heights
  try { heights = JSON.parse(text) } catch { throw new Error('Enter a JSON array of distinct heights, for example [10,6,8,5,11].') }
  if (!Array.isArray(heights) || heights.length < 1 || heights.length > 12) throw new Error('Use 1 to 12 people for the visualization.')
  if (!heights.every(v => Number.isInteger(v) && v >= 1 && v <= 100000) || new Set(heights).size !== heights.length) throw new Error('Heights are distinct integers from 1 to 100000.')
  return { heights }
}

export function buildTrace({ heights }) {
  const n = heights.length
  const answer = new Array(n).fill(0)
  const stack = []
  const frames = []
  for (let i = n - 1; i >= 0; i--) {
    while (stack.length && heights[stack[stack.length - 1]] < heights[i]) {
      const popped = stack.pop()
      answer[i]++
      frames.push({ phase: 'pop', activeLine: L('stack.pop()'), pythonLine: P('stack.pop()'), message: `Person ${i} (height ${heights[i]}) sees person ${popped} (height ${heights[popped]}).`, i, popped, stack: [...stack], answer: [...answer] })
    }
    if (stack.length) {
      answer[i]++
      frames.push({ phase: 'see', activeLine: L('if (stack.length) answer[i]++'), pythonLine: P('if stack:'), message: `Person ${i} also sees the taller person ${stack[stack.length - 1]} at the top.`, i, popped: null, stack: [...stack], answer: [...answer] })
    }
    stack.push(i)
    frames.push({ phase: 'see', activeLine: L('stack.push(i)'), pythonLine: P('stack.append(i)'), message: `Push person ${i}; it may be seen by people to its left.`, i, popped: null, stack: [...stack], answer: [...answer] })
  }
  frames.push({ phase: 'done', activeLine: L('return answer'), pythonLine: P('return answer'), message: 'Every person has a visible count.', i: -1, popped: null, stack: [...stack], answer: [...answer] })
  return { input: { heights }, result: answer, frames }
}
