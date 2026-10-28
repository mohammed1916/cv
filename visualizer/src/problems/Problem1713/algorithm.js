export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.target) || !Array.isArray(input.arr)) throw new Error('Use {"target": [...], "arr": [...]}.')
  const { target, arr } = input
  if (target.length < 1 || target.length > 8 || new Set(target).size !== target.length) throw new Error('target has 1 to 8 distinct values.')
  if (arr.length < 1 || arr.length > 10) throw new Error('arr has 1 to 10 values.')
  if ([...target, ...arr].some(v => !Number.isInteger(v) || v < 1 || v > 10)) throw new Error('Values are integers from 1 to 10.')
  return { target, arr }
}

export function buildTrace({ target, arr }) {
  const position = new Map(target.map((value, index) => [value, index]))
  // tails[k] is the smallest target position that ends a strictly increasing run of length k + 1.
  const tails = []
  const frames = [{ phase: 'start', activeLine: L('set the position of each target value'), item: -1, tails: [], message: 'Map each target value to its position. No runs yet.' }]
  arr.forEach((value, item) => {
    if (!position.has(value)) {
      frames.push({ phase: 'skip', activeLine: L('skip it'), item, tails: [...tails], message: `${value} is not in target, so it cannot help.` })
      return
    }
    const p = position.get(value)
    let lo = 0
    let hi = tails.length
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (tails[mid] < p) lo = mid + 1
      else hi = mid
    }
    tails[lo] = p
    frames.push({ phase: 'place', activeLine: L('replace that run'), item, tails: [...tails], message: `${value} sits at target position ${p}; it ends a run of length ${lo + 1}.` })
  })
  const result = target.length - tails.length
  frames.push({ phase: 'done', activeLine: L('return the target length'), item: -1, tails: [...tails], message: `${target.length} minus the longest run of ${tails.length} gives ${result}.` })
  return { input: { target, arr }, result, frames }
}

export const code = `minimum insertions so that target contains arr as a subsequence
  set the position of each target value
  start with no runs
  for each value of arr in order
    if the value is not in target then
      skip it
    otherwise
      find the first run whose last position is at least this position
      replace that run's end, or start a new run, with this position
  return the target length minus the number of runs`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_operations(target, arr):
    import bisect
    position = {value: index for index, value in enumerate(target)}
    tails = []
    for value in arr:
        if value not in position:
            continue
        p = position[value]
        lo = bisect.bisect_left(tails, p)
        if lo == len(tails):
            tails.append(p)
        else:
            tails[lo] = p
    return len(target) - len(tails)
`
