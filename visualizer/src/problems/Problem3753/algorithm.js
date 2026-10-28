export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Number.isInteger(obj.num1) || !Number.isInteger(obj.num2)) throw new Error('Use an object with integer num1 and num2.')
  if (obj.num1 < 1 || obj.num2 > 1000000 || obj.num1 > obj.num2) throw new Error('Use 1 <= num1 <= num2 <= 1000000 for the visualization.')
  return { num1: obj.num1, num2: obj.num2 }
}

// Digit DP: W(N) is the total waviness of 0..N. go() returns [completions, waviness] for the suffix.
function W(N, frames, label) {
  if (N < 0) return 0
  const digits = String(N).split('').map(Number)
  const L = digits.length
  const memo = new Map()
  const go = (pos, prev, last, tight, started) => {
    if (pos === L) return [1, 0]
    const key = `${pos}|${prev}|${last}|${tight}|${started}`
    if (memo.has(key)) return memo.get(key)
    const hi = tight ? digits[pos] : 9
    let cnt = 0, total = 0
    for (let d = 0; d <= hi; d++) {
      const nt = tight && d === hi
      if (!started && d === 0) {
        const [c, s] = go(pos + 1, -1, 0, nt, false)
        cnt += c; total += s
        continue
      }
      let sign = 0, turn = 0
      if (started) {
        sign = Math.sign(d - prev)
        if (last !== 0 && sign !== 0 && sign !== last) turn = 1
      }
      const [c, s] = go(pos + 1, d, sign, nt, true)
      cnt += c; total += s + turn * c
    }
    const res = [cnt, total]
    memo.set(key, res)
    return res
  }
  const value = go(0, -1, 0, true, false)[1]
  frames.push({ phase: label, activeLine: L_('set digits to'), bound: N, value, message: `Total waviness of 0 to ${N}: ${value}.` })
  return value
}

export function buildTrace(input) {
  const { num1, num2 } = input
  const frames = [{ phase: 'start', activeLine: L_('return W(num2)'), bound: num2, value: 0, message: `Waviness of [${num1}, ${num2}] equals W(${num2}) minus W(${num1 - 1}).` }]
  const upper = W(num2, frames, 'upper')
  const lower = W(num1 - 1, frames, 'lower')
  const result = upper - lower
  frames.push({ phase: 'done', activeLine: L_('return W(num2) minus'), bound: num2, value: result, message: `Total waviness: ${result}.` })
  return { input, result, frames }
}

export const code = `total waviness over [num1, num2]:
  return W(num2) minus W(num1 - 1)

W(N), the total waviness of 0 through N:
  set digits to the digits of N
  go(position, previous digit, last step sign, tight, started):
    if position is past the last digit then return one completion with no waviness
    for each digit d allowed at this position:
      if not started and d is 0 then keep waiting for the first digit
      otherwise compute the step sign from the previous digit to d
      if the new step turns against the last step then this turn adds the completions
      add the completions and waviness of the rest
  return the waviness total from go(0, none, 0, tight, not started)`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L_ = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def total_waviness_large(num1, num2):
    def W(N):
        if N < 0:
            return 0
        digits = [int(ch) for ch in str(N)]
        L = len(digits)
        memo = {}

        def go(pos, prev, last, tight, started):
            if pos == L:
                return (1, 0)
            key = (pos, prev, last, tight, started)
            if key in memo:
                return memo[key]
            hi = digits[pos] if tight else 9
            cnt = 0
            total = 0
            for d in range(0, hi + 1):
                nt = tight and d == hi
                if not started and d == 0:
                    c, s = go(pos + 1, -1, 0, nt, False)
                    cnt += c
                    total += s
                    continue
                sign = 0
                turn = 0
                if started:
                    sign = (d > prev) - (d < prev)
                    if last != 0 and sign != 0 and sign != last:
                        turn = 1
                c, s = go(pos + 1, d, sign, nt, True)
                cnt += c
                total += s + turn * c
            memo[key] = (cnt, total)
            return memo[key]

        return go(0, -1, 0, True, False)[1]

    return W(num2) - W(num1 - 1)
`
