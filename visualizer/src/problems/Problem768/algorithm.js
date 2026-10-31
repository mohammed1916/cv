export function parseInput(text) {
  const arr = JSON.parse(text)
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > 200 || arr.some(x => !Number.isInteger(x) || x < 0 || x > 100000000)) throw new Error('Enter a JSON array of 1-200 integers between 0 and 100,000,000 (visualization cap: 200 elements).')
  return arr
}
export function buildTrace(arr) {
  const stack = []
  const frames = [{ phase: 'start', activeLine: L('stack = empty list'), pythonLine: 2, index: -1, stack: [], message: 'Each stack entry is the maximum of one chunk. Chunks must be sortable independently.' }]
  arr.forEach((x, index) => {
    if (!stack.length || x >= stack[stack.length - 1]) {
      stack.push(x)
      frames.push({ phase: 'push', activeLine: L('push x onto stack'), pythonLine: 5, index, stack: [...stack], message: `${x} is at least the last chunk maximum${stack.length > 1 ? ` (${stack[stack.length - 2]})` : ''}, so it starts a new chunk.` })
    } else {
      const top = stack.pop()
      frames.push({ phase: 'merge', activeLine: L('top = pop'), pythonLine: 7, index, stack: [...stack], held: top, message: `${x} is smaller than chunk maximum ${top}, so it must join that chunk. Hold ${top} as the merged chunk's maximum.` })
      while (stack.length && stack[stack.length - 1] > x) {
        const dropped = stack.pop()
        frames.push({ phase: 'merge', activeLine: L('pop the stack'), pythonLine: 9, index, stack: [...stack], held: top, message: `Earlier chunk maximum ${dropped} is also greater than ${x}, so that chunk merges in too.` })
      }
      stack.push(top)
      frames.push({ phase: 'merge', activeLine: L('push top back'), pythonLine: 10, index, stack: [...stack], message: `Push the held maximum ${top} back as the single merged chunk.` })
    }
  })
  frames.push({ phase: 'done', activeLine: L('return the size'), pythonLine: 11, index: arr.length - 1, stack: [...stack], message: `The stack has ${stack.length} chunk maxima, so the answer is ${stack.length}.` })
  return { input: [...arr], result: stack.length, frames }
}
export const code = `function maxChunksToSorted(arr):
  stack = empty list of chunk maxima
  for each x in arr:
    if the stack is empty or x is at least the top of stack then
      push x onto stack
    else
      top = pop the top of stack
      while the stack is not empty and its top is greater than x:
        pop the stack
      push top back onto stack
  return the size of stack`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_chunks_to_sorted(arr):
    stack = []
    for x in arr:
        if not stack or x >= stack[-1]:
            stack.append(x)
        else:
            top = stack.pop()
            while stack and stack[-1] > x:
                stack.pop()
            stack.append(top)
    return len(stack)`
