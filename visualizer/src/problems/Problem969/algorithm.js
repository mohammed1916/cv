export function parseInput(text) {
  const arr = JSON.parse(text)
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > 12) throw new Error('Use 1 to 12 values.')
  const sorted = [...arr].sort((a, b) => a - b)
  if (sorted.some((v, i) => v !== i + 1)) throw new Error('The values must be a permutation of 1 to n.')
  return arr
}

export function buildTrace(arr) {
  const a = [...arr]
  const flips = []
  const frames = [{ phase: 'start', activeLine: L('for size in range'), array: [...a], flip: null, message: 'Place the largest unsorted value at the end using at most two prefix reversals.' }]
  const flip = k => {
    for (let i = 0, j = k - 1; i < j; i++, j--) [a[i], a[j]] = [a[j], a[i]]
    flips.push(k)
    frames.push({ phase: 'flip', activeLine: L('reverse(a, 0, k)'), array: [...a], flip: k, message: `Reverse the first ${k} value(s).` })
  }
  for (let size = a.length; size > 1; size--) {
    // The values above `size` are already in place, so the largest remaining value is `size`.
    const at = a.indexOf(size)
    frames.push({ phase: 'find', activeLine: L('index = a.index'), array: [...a], flip: null, message: `${size} is the largest unsorted value and sits at position ${at + 1}.` })
    if (at === size - 1) continue
    if (at !== 0) flip(at + 1)
    flip(size)
  }
  frames.push({ phase: 'done', activeLine: L('return flips'), array: [...a], flip: null, message: `Sorted with ${flips.length} flip(s).` })
  return { input: arr, result: flips, sorted: a, frames }
}

export const code = `def pancakeSort(arr):
    a = list(arr)
    flips = []
    def reverse(k):
        a[:k] = a[:k][::-1]
        flips.append(k)
    for size in range(len(a), 1, -1):
        index = a.index(size)
        if index == size - 1:
            continue
        if index:
            reverse(index + 1)
        reverse(size)
    return flips`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
