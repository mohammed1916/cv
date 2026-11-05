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
  const frames = [{ phase: 'start', pythonLine: 3, activeLine: L('const position = new Map'), item: -1, tails: [], lo: null, hi: null, mid: null, p: null, message: 'Map each target value to its position. No runs yet.' }]
  arr.forEach((value, item) => {
    if (!position.has(value)) {
      frames.push({ phase: 'skip', pythonLine: 6, activeLine: L('continue'), item, tails: [...tails], lo: null, hi: null, mid: null, message: `${value} is not in target, so it cannot help.` })
      return
    }
    const p = position.get(value)
    let lo = 0
    let hi = tails.length
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      frames.push({ phase: 'search', pythonLine: 10, activeLine: L('while (lo < hi)'), item, tails: [...tails], lo, hi, mid, p, message: `Search runs for ${value} at position ${p}: testing run ${mid}, which ends at ${tails[mid]}.` })
      if (tails[mid] < p) lo = mid + 1
      else hi = mid
    }
    const grew = lo === tails.length
    tails[lo] = p
    frames.push({ phase: 'place', pythonLine: grew ? 17 : 19, activeLine: L('tails[lo] = p'), item, tails: [...tails], lo: null, hi: null, mid: null, p, message: `${value} sits at target position ${p}; it ends a run of length ${lo + 1}.` })
  })
  const result = target.length - tails.length
  frames.push({ phase: 'done', pythonLine: 20, activeLine: L('return target.length - tails.length'), item: -1, tails: [...tails], message: `${target.length} minus the longest run of ${tails.length} gives ${result}.` })
  return { input: { target, arr }, result, frames }
}

export const code = `function minInsertions(target, arr) {
  const position = new Map(target.map((value, index) => [value, index]))
  const tails = []
  for (const value of arr) {
    if (!position.has(value)) continue
    const p = position.get(value)
    let lo = 0
    let hi = tails.length
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (tails[mid] < p) lo = mid + 1
      else hi = mid
    }
    tails[lo] = p
  }
  return target.length - tails.length
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_insertions(target, arr):
    position = {value: index for index, value in enumerate(target)}
    tails = []
    for value in arr:
        if value not in position:
            continue
        p = position[value]
        lo = 0
        hi = len(tails)
        while lo < hi:
            mid = (lo + hi) // 2
            if tails[mid] < p:
                lo = mid + 1
            else:
                hi = mid
        if lo == len(tails):
            tails.append(p)
        else:
            tails[lo] = p
    return len(target) - len(tails)
`
