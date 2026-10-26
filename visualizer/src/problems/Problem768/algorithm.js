export function parseInput(text) {
  const arr = JSON.parse(text)
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > 200 || arr.some(x => !Number.isInteger(x) || x < 0 || x > 100000000)) throw new Error('Enter a JSON array of 1-200 integers between 0 and 100,000,000 (visualization cap: 200 elements).')
  return arr
}
export function buildTrace(arr) {
  const stack = []
  const frames = [{ phase: 'start', activeLine: 2, index: -1, stack: [], message: 'Each stack entry is the maximum of one chunk. Chunks must be sortable independently.' }]
  arr.forEach((x, index) => {
    if (!stack.length || x >= stack[stack.length - 1]) {
      stack.push(x)
      frames.push({ phase: 'push', activeLine: 5, index, stack: [...stack], message: `${x} is at least the last chunk maximum${stack.length > 1 ? ` (${stack[stack.length - 2]})` : ''}, so it starts a new chunk.` })
    } else {
      const top = stack.pop()
      frames.push({ phase: 'merge', activeLine: 7, index, stack: [...stack], held: top, message: `${x} is smaller than chunk maximum ${top}, so it must join that chunk. Hold ${top} as the merged chunk's maximum.` })
      while (stack.length && stack[stack.length - 1] > x) {
        const dropped = stack.pop()
        frames.push({ phase: 'merge', activeLine: 9, index, stack: [...stack], held: top, message: `Earlier chunk maximum ${dropped} is also greater than ${x}, so that chunk merges in too.` })
      }
      stack.push(top)
      frames.push({ phase: 'merge', activeLine: 10, index, stack: [...stack], message: `Push the held maximum ${top} back as the single merged chunk.` })
    }
  })
  frames.push({ phase: 'done', activeLine: 11, index: arr.length - 1, stack: [...stack], message: `The stack has ${stack.length} chunk maxima, so the answer is ${stack.length}.` })
  return { input: [...arr], result: stack.length, frames }
}
export const code = `def maxChunksToSorted(arr):
    stack = []
    for x in arr:
        if not stack or x >= stack[-1]:
            stack.append(x)
        else:
            top = stack.pop()
            while stack and stack[-1] > x:
                stack.pop()
            stack.append(top)
    return len(stack)`.split('\n').map((text, index) => ({ line: index + 1, text }))
