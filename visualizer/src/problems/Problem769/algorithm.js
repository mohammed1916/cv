export function parseInput(text) {
  const arr = JSON.parse(text)
  const ok = Array.isArray(arr) && arr.length >= 1 && arr.length <= 10 && arr.every(x => Number.isInteger(x)) && [...arr].sort((a, b) => a - b).every((v, i) => v === i)
  if (!ok) throw new Error('Enter a JSON permutation of 0..n-1 with 1-10 elements, e.g. [1,0,2,3,4] (LeetCode limit n <= 10).')
  return arr
}
export function buildTrace(arr) {
  const frames = [{ phase: 'start', activeLine: 2, index: -1, prefixMax: -1, cuts: [], count: 0, message: 'Because arr is a permutation of 0..n-1, prefix [0..i] is a finished chunk exactly when its maximum is i.' }]
  let mx = 0, count = 0
  const cuts = []
  arr.forEach((x, i) => {
    mx = Math.max(mx, x)
    frames.push({ phase: 'scan', activeLine: 4, index: i, prefixMax: mx, cuts: [...cuts], count, message: `Prefix max after index ${i} is ${mx}; compare with index ${i}.` })
    if (mx === i) {
      count++
      cuts.push(i)
      frames.push({ phase: 'cut', activeLine: 6, index: i, prefixMax: mx, cuts: [...cuts], count, message: `Max ${mx} equals index ${i}: the prefix holds exactly the values 0..${i}, so cut here. Chunks: ${count}.` })
    }
  })
  frames.push({ phase: 'done', activeLine: 7, index: arr.length - 1, prefixMax: mx, cuts: [...cuts], count, message: `Maximum number of chunks: ${count}.` })
  return { input: [...arr], result: count, frames }
}
export const code = `def maxChunksToSorted(arr):
    mx = ans = 0
    for i, x in enumerate(arr):
        mx = max(mx, x)
        if mx == i:
            ans += 1
    return ans`.split('\n').map((text, index) => ({ line: index + 1, text }))
