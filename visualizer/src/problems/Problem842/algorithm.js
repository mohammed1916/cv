export function parseInput(text) {
  const s = JSON.parse(text)
  if (typeof s !== 'string' || !/^[0-9]{1,30}$/.test(s)) throw new Error('Enter a JSON string of 1-30 digits (visualization cap: 30 digits).')
  return s
}
export function buildTrace(num) {
  const LIMIT = 2 ** 31 - 1
  const n = num.length
  const res = []
  const frames = []
  const push = (phase, activeLine, message, extra = {}) => frames.push({ phase, activeLine, message, res: [...res], i: -1, j: -1, ...extra })
  push('start', 3, `Split "${num}" into numbers with no leading zeros, each at most ${LIMIT}, where every number after the first two is the sum of the previous two.`)
  const backtrack = i => {
    if (i === n) {
      const ok = res.length >= 3
      push(ok ? 'push' : 'pop', 6, ok ? `All digits consumed with ${res.length} numbers: a valid sequence.` : `All digits consumed but only ${res.length} numbers (need at least 3): this branch fails.`, { i })
      return ok
    }
    let cur = 0
    for (let j = i; j < n; j++) {
      if (j > i && num[i] === '0') { push('reject', 9, `Segment starting at ${i} begins with '0' and is longer than one digit: leading zero, stop extending.`, { i, j }); break }
      cur = cur * 10 + Number(num[j])
      if (cur > LIMIT) { push('reject', 11, `${cur} exceeds 2^31 - 1; longer segments only grow, so stop extending.`, { i, j, cur }); break }
      if (res.length >= 2) {
        const s = res[res.length - 1] + res[res.length - 2]
        if (cur < s) { push('reject', 14, `${cur} is smaller than ${res[res.length - 2]} + ${res[res.length - 1]} = ${s}; take more digits.`, { i, j, cur }); continue }
        if (cur > s) { push('reject', 15, `${cur} is larger than the required ${s}; longer segments only grow, so stop.`, { i, j, cur }); break }
      }
      res.push(cur)
      push('push', 16, res.length >= 3 ? `${cur} equals the sum of the previous two: accept it and continue from digit ${j + 1}.` : `Tentatively take ${cur} as number ${res.length} (the first two numbers are free choices).`, { i, j, cur })
      if (backtrack(j + 1)) return true
      res.pop()
      push('pop', 18, `Dead end after ${cur}: undo it and try a longer segment.`, { i, j, cur })
    }
    return false
  }
  const found = backtrack(0)
  const result = found ? [...res] : []
  push('done', 21, found ? `Sequence found: [${result.join(', ')}].` : 'Every split was pruned or failed: return [].')
  return { input: num, result, frames }
}
export const code = `def splitIntoFibonacci(num):
    limit = 2 ** 31 - 1
    res = []
    def backtrack(i):
        if i == len(num):
            return len(res) >= 3
        cur = 0
        for j in range(i, len(num)):
            if j > i and num[i] == '0': break
            cur = cur * 10 + int(num[j])
            if cur > limit: break
            if len(res) >= 2:
                s = res[-1] + res[-2]
                if cur < s: continue
                if cur > s: break
            res.append(cur)
            if backtrack(j + 1): return True
            res.pop()
        return False
    backtrack(0)
    return res`.split('\n').map((text, index) => ({ line: index + 1, text }))
