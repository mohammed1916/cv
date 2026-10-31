export function parseInput(text) {
  const lists = JSON.parse(text)
  if (!Array.isArray(lists) || lists.length < 2 || lists.length > 12) throw new Error('Enter a JSON array of 2–12 sorted lists.')
  for (const list of lists) {
    if (!Array.isArray(list) || list.length < 1 || list.length > 12) throw new Error('Each list needs 1–12 integers.')
    if (list.some((v, i) => !Number.isInteger(v) || Math.abs(v) > 100000 || (i && v < list[i - 1]))) throw new Error('Each list must be sorted non-decreasing integers with |v| ≤ 100,000.')
  }
  return lists
}

// Keep one pointer per list. The range's low end is the smallest current value; the high end is the largest.
export function buildTrace(lists) {
  const pointers = lists.map(() => 0)
  const current = () => lists.map((list, i) => list[pointers[i]])
  let best = null
  const frames = [{ phase: 'start', pointers: [...pointers], values: current(), range: null, best: null, activeLine: L('pointers = a list of 0'), pythonLine: 2, message: 'Start each list at its first value.' }]
  for (;;) {
    const values = current()
    const low = Math.min(...values), high = Math.max(...values)
    const range = [low, high]
    if (!best || high - low < best[1] - best[0] || (high - low === best[1] - best[0] && low < best[0])) best = range
    frames.push({ phase: 'window', pointers: [...pointers], values, range, best: [...best], activeLine: L('if best is nothing'), pythonLine: 7, message: `Window [${low}, ${high}] (width ${high - low}).` })
    const minList = values.indexOf(low)
    if (pointers[minList] + 1 >= lists[minList].length) break
    pointers[minList]++
    frames.push({ phase: 'advance', pointers: [...pointers], values: current(), range: [low, high], best: [...best], activeLine: L('add 1 to pointers[i]'), pythonLine: 12, message: `Advance list ${minList} past ${low}: it was the smallest, so only it can narrow the window.` })
  }
  frames.push({ phase: 'done', pointers: [...pointers], values: current(), range: best, best: [...best], result: best, activeLine: L('return best'), pythonLine: 11, message: `Smallest range: [${best[0]}, ${best[1]}].` })
  return { input: lists, result: best, frames }
}

export const code = `pointers = a list of 0, one pointer per list
best = nothing yet
repeat forever:
  values = the value under each list's pointer
  low = the smallest of values
  high = the largest of values
  if best is nothing, or high - low is narrower than best, or equally narrow with a smaller low:
    best = [low, high]
  i = the list whose value is low (the first one)
  if pointers[i] is already the last index of list i:
    return best
  add 1 to pointers[i]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def smallest_range(nums):
    pointers = [0] * len(nums)
    best = None
    while True:
        values = [nums[i][p] for i, p in enumerate(pointers)]
        low, high = min(values), max(values)
        if best is None or high - low < best[1] - best[0] or (high - low == best[1] - best[0] and low < best[0]):
            best = (low, high)
        i = values.index(low)
        if pointers[i] + 1 >= len(nums[i]):
            return list(best)
        pointers[i] += 1`
