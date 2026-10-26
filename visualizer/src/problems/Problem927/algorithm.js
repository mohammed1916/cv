export function parseInput(text) {
  const arr = JSON.parse(text)
  if (!Array.isArray(arr) || arr.length < 3 || arr.length > 100 || arr.some(x => x !== 0 && x !== 1)) throw new Error('Enter a JSON array of 3-100 values, each 0 or 1 (capped at 100 for visualization).')
  return [...arr]
}
const at = (s, nth = 0) => code.map((c, i) => [c, i]).filter(([c]) => c.text.includes(s))[nth][1] + 1
export function buildTrace(arr) {
  const n = arr.length
  const frames = [{ phase: 'start', activeLine: at('n = len(arr)'), starts: [], t: -1, message: 'Each part must be the same binary number (leading zeros allowed), so each part must contain the same number of ones.' }]
  const finish = (result, line, message) => {
    frames.push({ phase: 'done', activeLine: line, starts: [], t: -1, result, message })
    return { input: [...arr], result, frames }
  }
  const ones = arr.reduce((a, b) => a + b, 0)
  frames.push({ phase: 'count', activeLine: at('ones = sum(arr)'), ones, starts: [], t: -1, message: `The array has ${ones} one(s).` })
  if (ones === 0) return finish([0, n - 1], at('return [0, n - 1]'), 'No ones: every part is 0, so cut after index 0 and before index n-1.')
  if (ones % 3) return finish([-1, -1], at('return [-1, -1]'), `${ones} is not divisible by 3, so the ones cannot be shared equally.`)
  const k = ones / 3
  const idx = []
  arr.forEach((x, i) => { if (x) idx.push(i) })
  const a = idx[0], b = idx[k], c = idx[2 * k]
  const tail = n - c
  frames.push({ phase: 'locate', activeLine: at('a, b, c ='), ones, starts: [a, b, c], tail, t: -1, message: `Each part has ${k} one(s). The first one of each part is at ${a}, ${b}, ${c}. Part 3 runs from ${c} to the end, so every part must read ${tail} digits from its first one (that includes the trailing zeros).` })
  for (let t = 0; t < tail; t++) {
    const same = arr[a + t] === arr[b + t] && arr[b + t] === arr[c + t]
    frames.push({ phase: same ? 'compare' : 'mismatch', activeLine: at('if not (arr[a + t]'), ones, starts: [a, b, c], tail, t,
      message: same ? `Offset ${t}: arr[${a + t}], arr[${b + t}], arr[${c + t}] are all ${arr[c + t]}.` : `Offset ${t}: arr[${a + t}]=${arr[a + t]}, arr[${b + t}]=${arr[b + t]}, arr[${c + t}]=${arr[c + t]} differ, so no valid split exists.` })
    if (!same) return finish([-1, -1], at('return [-1, -1]', 1), 'Mismatch found: return [-1, -1].')
  }
  const overlap = a + tail > b || b + tail > c
  frames.push({ phase: 'check', activeLine: at('if a + tail > b'), ones, starts: [a, b, c], tail, t: tail - 1,
    message: overlap ? `Part 1 would end at ${a + tail - 1} and run into the next part's first one at ${b}, or part 2 would reach ${c}: the parts overlap.` : `The windows [${a}, ${a + tail}), [${b}, ${b + tail}), [${c}, ${n}) are disjoint and equal. Cut after ${a + tail - 1} and before ${b + tail}.` })
  if (overlap) return finish([-1, -1], at('return [-1, -1]', 2), 'Overlapping parts: return [-1, -1].')
  return finish([a + tail - 1, b + tail], at('return [a + tail - 1'), `Answer: [${a + tail - 1}, ${b + tail}].`)
}
export const code = `def threeEqualParts(arr):
    n = len(arr)
    ones = sum(arr)
    if ones == 0:
        return [0, n - 1]
    if ones % 3:
        return [-1, -1]
    k = ones // 3
    idx = [i for i, x in enumerate(arr) if x]
    a, b, c = idx[0], idx[k], idx[2 * k]
    tail = n - c
    for t in range(tail):
        if not (arr[a + t] == arr[b + t] == arr[c + t]):
            return [-1, -1]
    if a + tail > b or b + tail > c:
        return [-1, -1]
    return [a + tail - 1, b + tail]`.split('\n').map((text, index) => ({ line: index + 1, text }))
