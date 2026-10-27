function checkList(list, name) {
  if (!Array.isArray(list) || list.length > 12) throw new Error(`${name} has at most 12 intervals.`)
  list.forEach(([s, e], i) => {
    if (!Number.isInteger(s) || !Number.isInteger(e) || s < 0 || e > 100 || s > e) throw new Error(`${name} intervals are [start, end] with 0 ≤ start ≤ end ≤ 100.`)
    if (i > 0 && s <= list[i - 1][1]) throw new Error(`${name} intervals must be sorted and disjoint.`)
  })
}

export function parseInput(text) {
  const spec = JSON.parse(text)
  checkList(spec.a, 'a')
  checkList(spec.b, 'b')
  return spec
}

export function buildTrace(spec) {
  const { a, b } = spec
  const result = []
  const frames = [{ phase: 'start', activeLine: L('set i and j to 0'), i: 0, j: 0, pair: null, result: [], message: 'Walk both lists together. Two intervals overlap when the larger start is at most the smaller end.' }]
  let i = 0, j = 0
  while (i < a.length && j < b.length) {
    const lo = Math.max(a[i][0], b[j][0]), hi = Math.min(a[i][1], b[j][1])
    if (lo <= hi) {
      result.push([lo, hi])
      frames.push({ phase: 'overlap', activeLine: L('append [lo, hi]'), i, j, pair: [lo, hi], result: result.map(r => [...r]), message: `[${a[i]}] and [${b[j]}] overlap at [${lo}, ${hi}].` })
    } else {
      frames.push({ phase: 'skip', activeLine: L('if lo is at most hi'), i, j, pair: null, result: result.map(r => [...r]), message: `[${a[i]}] and [${b[j]}] do not overlap.` })
    }
    // Advance the interval that ends first; it cannot overlap anything later in the other list.
    if (a[i][1] < b[j][1]) i++
    else j++
  }
  frames.push({ phase: 'done', activeLine: L('return result'), i, j, pair: null, result: result.map(r => [...r]), message: `${result.length} overlap(s) found.` })
  return { input: spec, result, frames }
}

export const code = `intervalIntersection(firstList, secondList) returns the overlaps of two sorted, disjoint lists
  set i and j to 0, and set result to an empty list
  while i is in firstList and j is in secondList
    set lo to the larger start, and hi to the smaller end
    if lo is at most hi, then append [lo, hi] to result
    if firstList[i] ends before secondList[j] ends, then add 1 to i
    otherwise add 1 to j
  return result`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def interval_intersection(a, b):
    i = j = 0
    result = []
    while i < len(a) and j < len(b):
        lo = max(a[i][0], b[j][0])
        hi = min(a[i][1], b[j][1])
        if lo <= hi:
            result.append([lo, hi])
        if a[i][1] < b[j][1]:
            i += 1
        else:
            j += 1
    return result`
