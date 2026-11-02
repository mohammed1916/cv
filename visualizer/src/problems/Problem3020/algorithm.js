export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12 || !nums.every(v => Number.isInteger(v) && v >= 1 && v <= 1000)) throw new Error('Use a JSON array of 1 to 12 integers from 1 to 1000.')
  return nums
}

export function buildTrace(nums) {
  const frames = []
  const cnt = new Map()
  for (const v of nums) cnt.set(v, (cnt.get(v) ?? 0) + 1)
  let best = 0
  frames.push({ pythonLine: 2, phase: 'start', activeLine: L('count each value'), base: null, cur: null, length: null, best, message: `Counts are ready for ${cnt.size} distinct values.` })
  if (cnt.has(1)) {
    best = cnt.get(1) % 2 === 1 ? cnt.get(1) : cnt.get(1) - 1
    frames.push({ pythonLine: 7, phase: 'ones', activeLine: L('if 1 is present'), base: 1, cur: 1, length: best, best, message: `Ones can fill any odd count: ${best}.` })
  }
  for (const x of cnt.keys()) {
    if (x === 1) continue
    let cur = x
    let m = 0
    let length = 1
    frames.push({ pythonLine: 13, phase: 'base', activeLine: L('cur = x and length = 1'), base: x, cur, length, best, message: `Base ${x} alone gives length 1.` })
    while ((cnt.get(cur) ?? 0) >= 2) {
      cur = cur * cur
      m += 1
      frames.push({ pythonLine: 15, phase: 'climb', activeLine: L('cur = cur squared'), base: x, cur, length, best, message: `Need two copies below; move up to ${cur}.` })
      if ((cnt.get(cur) ?? 0) >= 1) {
        length = 2 * m + 1
        frames.push({ pythonLine: 18, phase: 'top', activeLine: L('if cur appears, length'), base: x, cur, length, best, message: `${cur} is present, so length ${length} works.` })
      }
    }
    best = Math.max(best, length)
    frames.push({ pythonLine: 19, phase: 'best', activeLine: L('best = maximum of best and length'), base: x, cur, length, best, message: `Best so far is ${best}.` })
  }
  frames.push({ pythonLine: 20, phase: 'done', activeLine: L('return best'), base: null, cur: null, length: null, best, message: `The largest valid subset has ${best} elements.` })
  return { input: nums, result: best, frames }
}

export const code = `largest subset that forms x, x squared, ... , x squared, x
  count each value
  best = 0
  if 1 is present, odd count of ones (or count minus one) is the candidate
  for each value x other than 1
    cur = x and length = 1
    while cur appears at least twice
      cur = cur squared; the value below is used twice
      if cur appears, length = 2 times the climb count plus 1
    best = maximum of best and length
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_subset(nums):
    cnt = {}
    for v in nums:
        cnt[v] = cnt.get(v, 0) + 1
    best = 0
    if 1 in cnt:
        best = cnt[1] if cnt[1] % 2 == 1 else cnt[1] - 1
    for x in cnt:
        if x == 1:
            continue
        cur = x
        m = 0
        length = 1
        while cnt.get(cur, 0) >= 2:
            cur = cur * cur
            m += 1
            if cnt.get(cur, 0) >= 1:
                length = 2 * m + 1
        best = max(best, length)
    return best
`
