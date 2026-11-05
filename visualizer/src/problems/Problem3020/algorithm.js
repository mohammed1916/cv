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
  frames.push({ pythonLine: 2, phase: 'start', activeLine: L('const count = new Map'), base: null, cur: null, length: null, best, climb: [], message: `Counts are ready for ${cnt.size} distinct values.` })
  if (cnt.has(1)) {
    best = cnt.get(1) % 2 === 1 ? cnt.get(1) : cnt.get(1) - 1
    frames.push({ pythonLine: 7, phase: 'ones', activeLine: L('if (count.has(1))'), base: 1, cur: 1, length: best, best, climb: [], message: `Ones can fill any odd count: ${best}.` })
  }
  for (const x of cnt.keys()) {
    if (x === 1) continue
    let cur = x
    let m = 0
    let length = 1
    const climb = [x]
    frames.push({ pythonLine: 13, phase: 'base', activeLine: L('let cur = x'), base: x, cur, length, best, climb: [...climb], message: `Base ${x} alone gives length 1.` })
    while ((cnt.get(cur) ?? 0) >= 2) {
      cur = cur * cur
      m += 1
      climb.push(cur)
      frames.push({ pythonLine: 15, phase: 'climb', activeLine: L('cur = cur * cur'), base: x, cur, length, best, climb: [...climb], message: `Need two copies below; move up to ${cur}.` })
      if ((cnt.get(cur) ?? 0) >= 1) {
        length = 2 * m + 1
        frames.push({ pythonLine: 18, phase: 'top', activeLine: L('length = 2 * m + 1'), base: x, cur, length, best, climb: [...climb], message: `${cur} is present, so length ${length} works.` })
      }
    }
    best = Math.max(best, length)
    frames.push({ pythonLine: 19, phase: 'best', activeLine: L('best = Math.max'), base: x, cur, length, best, climb: [...climb], message: `Best so far is ${best}.` })
  }
  frames.push({ pythonLine: 20, phase: 'done', activeLine: L('return best'), base: null, cur: null, length: null, best, climb: [], message: `The largest valid subset has ${best} elements.` })
  return { input: nums, result: best, frames }
}

export const code = `function maxSubset(nums) {
  const count = new Map()
  for (const v of nums) count.set(v, (count.get(v) ?? 0) + 1)
  let best = 0
  if (count.has(1)) best = count.get(1) % 2 === 1 ? count.get(1) : count.get(1) - 1
  for (const x of count.keys()) {
    if (x === 1) continue
    let cur = x
    let m = 0
    let length = 1
    while ((count.get(cur) ?? 0) >= 2) {
      cur = cur * cur
      m += 1
      if ((count.get(cur) ?? 0) >= 1) length = 2 * m + 1
    }
    best = Math.max(best, length)
  }
  return best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
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
