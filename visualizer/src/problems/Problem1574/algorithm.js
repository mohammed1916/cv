export const phases = [
  { id: 'start', label: 'Start', description: 'Find the sorted suffix first: the longest non-decreasing tail of the array.' },
  { id: 'suffix', label: 'Sorted suffix', description: 'Walk left from the end while each value is no larger than the one after it.' },
  { id: 'prefix', label: 'Sorted prefix', description: 'Walk right from the start while the array stays non-decreasing.' },
  { id: 'pair', label: 'Join prefix and suffix', description: 'Pair a prefix index with a suffix index whose values are in order, and remove the gap between them.' },
  { id: 'done', label: 'Complete', description: 'The smallest removal found is the answer.' },
]

export function parseInput(text) {
  const arr = JSON.parse(text)
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > 12 || !arr.every(v => Number.isInteger(v) && v >= 0 && v <= 9)) {
    throw new Error('Enter a JSON array of 1 to 12 integers from 0 to 9.')
  }
  return arr
}

export const code = [
  'function shortest_removal(arr):',
  '  n = length of arr',
  '  r = n - 1',
  '  while r > 0 and arr[r-1] <= arr[r]: r = r - 1',
  '  if r == 0: return 0',
  '  l = 0',
  '  while l + 1 < n and arr[l] <= arr[l+1]: l = l + 1',
  '  ans = min(n - 1 - l, r)',
  '  i = 0, j = r',
  '  while i <= l and j < n:',
  '    if arr[i] <= arr[j]:',
  '      ans = min(ans, j - i - 1)',
  '      i = i + 1',
  '    else:',
  '      j = j + 1',
  '  return ans',
].map((text, index) => ({ line: index + 1, text }))

export const python = `def find_length_of_shortest_subarray(arr):
    n = len(arr)
    r = n - 1
    while r > 0 and arr[r - 1] <= arr[r]:
        r -= 1
    if r == 0:
        return 0
    l = 0
    while l + 1 < n and arr[l] <= arr[l + 1]:
        l += 1
    ans = min(n - 1 - l, r)
    i, j = 0, r
    while i <= l and j < n:
        if arr[i] <= arr[j]:
            ans = min(ans, j - i - 1)
            i += 1
        else:
            j += 1
    return ans`

const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export function buildTrace(arr) {
  const n = arr.length
  let r = n - 1
  let l = 0
  let ans = 0
  let i = 0
  let j = 0
  const snap = (extra = {}) => ({ l, r, i, j, ans, ...extra })
  const frames = [{ phase: 'start', activeLine: L('n = length'), pythonLine: P('n = len'), snapshot: snap({ r: n - 1 }), message: `An array of ${n} values. Remove the shortest contiguous block so the rest is non-decreasing.` }]
  while (r > 0 && arr[r - 1] <= arr[r]) r -= 1
  if (r === 0) {
    frames.push({ phase: 'suffix', activeLine: L('if r == 0'), pythonLine: P('if r == 0'), snapshot: snap({ r }), message: 'The whole array is already non-decreasing, so nothing needs to be removed.' })
    frames.push({ phase: 'done', activeLine: L('return 0'), pythonLine: P('return 0'), snapshot: snap({ ans: 0 }), message: 'Return 0.' })
    return { input: arr, result: 0, frames }
  }
  frames.push({ phase: 'suffix', activeLine: L('while r > 0'), pythonLine: P('while r > 0'), snapshot: snap({ r }), message: `The sorted suffix starts at index ${r}. Everything from there on is non-decreasing.` })
  while (l + 1 < n && arr[l] <= arr[l + 1]) l += 1
  frames.push({ phase: 'prefix', activeLine: L('while l + 1 < n'), pythonLine: P('while l + 1 < n'), snapshot: snap({ l }), message: `The sorted prefix ends at index ${l}. Values after it break the order.` })
  ans = Math.min(n - 1 - l, r)
  frames.push({ phase: 'prefix', activeLine: L('ans = min(n'), pythonLine: P('ans = min'), snapshot: snap(), message: `Dropping everything after index ${l} costs ${n - 1 - l}. Dropping everything before index ${r} costs ${r}. Start with the smaller, ${ans}.` })
  i = 0
  j = r
  while (i <= l && j < n) {
    if (arr[i] <= arr[j]) {
      ans = Math.min(ans, j - i - 1)
      frames.push({ phase: 'pair', activeLine: L('if arr[i] <= arr[j]'), pythonLine: P('if arr[i] <= arr[j]'), snapshot: snap(), message: `Keep prefix through index ${i} and suffix from index ${j}: ${arr[i]} fits before ${arr[j]}. Removing the ${j - i - 1} values between them. Best is ${ans}.` })
      i += 1
      frames.push({ phase: 'pair', activeLine: L('i = i + 1'), pythonLine: P('i += 1'), snapshot: snap(), message: `Move the prefix end right to index ${i}.` })
    } else {
      frames.push({ phase: 'pair', activeLine: L('j = j + 1'), pythonLine: P('j += 1'), snapshot: snap(), message: `${arr[i]} is larger than ${arr[j]}, so the kept suffix must start later. Move j right.` })
      j += 1
    }
  }
  frames.push({ phase: 'done', activeLine: L('return ans'), pythonLine: P('return ans'), snapshot: snap(), message: `Return ${ans}, the shortest block to remove.` })
  return { input: arr, result: ans, frames }
}
