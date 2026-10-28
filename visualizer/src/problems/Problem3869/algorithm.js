export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object') throw new Error('Use a JSON object with integers l and r.')
  const { l, r } = obj
  if (!Number.isInteger(l) || !Number.isInteger(r)) throw new Error('l and r must be integers.')
  if (l < 1 || r > 1000000000000000 || l > r) throw new Error('Use integers with 1 <= l <= r <= 10^15.')
  if (r - l > 60) throw new Error('Keep r - l at most 60 for this visualization.')
  return { l, r }
}

// A number is good when its digits are strictly increasing or strictly decreasing; one digit is good.
function isGood(x) {
  const s = String(x)
  if (s.length === 1) return true
  let inc = true
  let dec = true
  for (let i = 0; i + 1 < s.length; i++) {
    if (!(s[i] < s[i + 1])) inc = false
    if (!(s[i] > s[i + 1])) dec = false
  }
  return inc || dec
}

const digitSum = x => String(x).split('').reduce((a, c) => a + Number(c), 0)

export function buildTrace({ l, r }) {
  let count = 0
  const frames = [{ phase: 'start', activeLine: L('set count to 0'), x: null, monotone: null, total: null, count, message: `Check each integer from ${l} to ${r}.` }]
  for (let x = l; x <= r; x++) {
    const monotone = isGood(x)
    const total = digitSum(x)
    const totalGood = isGood(total)
    const fancy = monotone || totalGood
    if (fancy) count += 1
    frames.push({ phase: fancy ? 'count' : 'skip', activeLine: L(fancy ? 'add one to count' : 'if monotone or'), x, monotone, total, totalGood, count,
      message: `${x}: digits ${monotone ? 'are monotone' : 'are not monotone'}, digit sum ${total} ${totalGood ? 'is good' : 'is not good'}, so it is ${fancy ? 'fancy' : 'not fancy'}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return count'), x: null, monotone: null, total: null, count, message: `Fancy numbers in range: ${count}.` })
  return { input: { l, r }, result: count, frames }
}

export const code = `count fancy numbers in [l, r] (l, r):
  set count to 0
  for each x from l to r
    set monotone to true if the digits of x strictly increase or strictly decrease
    set total to the sum of the digits of x
    if monotone or the digit sum total is good then
      add one to count
  return count

a single digit is good, and a number is fancy when it is good or its digit sum is good`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_fancy_numbers(l, r):
    def is_good(x):
        s = str(x)
        if len(s) == 1:
            return True
        inc = all(s[i] < s[i + 1] for i in range(len(s) - 1))
        dec = all(s[i] > s[i + 1] for i in range(len(s) - 1))
        return inc or dec

    def digit_sum(x):
        return sum(int(c) for c in str(x))

    good_set = {s for s in range(1, 200) if is_good(s)}

    # Good numbers have strictly monotone digits, so there are at most 10 digits each.
    monotone = set()
    for mask in range(1, 1 << 10):
        digits = [d for d in range(10) if (mask >> d) & 1]
        monotone.add(int(''.join(str(d) for d in reversed(digits))))
        if digits[0] != 0:
            monotone.add(int(''.join(str(d) for d in digits)))
    monotone.discard(0)

    def good_sum_upto(n):
        # Count integers in [1, n] whose digit sum is good, by digit DP over digit sums.
        if n <= 0:
            return 0
        digits = [int(c) for c in str(n)]
        m = len(digits)
        ways = [[0] * (9 * m + 1) for _ in range(m + 1)]
        ways[0][0] = 1
        for k in range(1, m + 1):
            for s in range(9 * k + 1):
                ways[k][s] = sum(ways[k - 1][s - d] for d in range(10) if s - d >= 0)
        count = 0
        prefix = 0
        for i, di in enumerate(digits):
            rest = m - i - 1
            for d in range(di):
                for s_rest in range(9 * rest + 1):
                    if prefix + d + s_rest in good_set:
                        count += ways[rest][s_rest]
            prefix += di
        if prefix in good_set:
            count += 1
        return count

    def fancy_upto(n):
        if n <= 0:
            return 0
        extra = sum(1 for x in monotone if x <= n and digit_sum(x) not in good_set)
        return good_sum_upto(n) + extra

    return fancy_upto(r) - fancy_upto(l - 1)
`
