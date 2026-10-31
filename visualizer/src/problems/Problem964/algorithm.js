export function parseInput(text) {
  const data = JSON.parse(text), x = data?.x, target = data?.target
  if (!Number.isInteger(x) || x < 2 || x > 100 || !Number.isInteger(target) || target < 1 || target > 200000000) {
    throw new Error('Enter {"x":3,"target":19}: integer x from 2 to 100 and integer target from 1 to 200,000,000.')
  }
  return { x, target }
}

// Each digit of target in base x is covered either by positive copies of x^k, or by
// borrowing: the digit is replaced by one x^(k+1) minus (x - digit) copies of x^k.
// pos is the cheapest cost when no borrow is pending into position k; neg is the cheapest
// cost when one extra x^k must be added at position k (a borrow from the position below).
// A copy of x^k costs k operators for k >= 1 (k multiplications), and a copy of x^0 costs 2
// (x / x). Every copy after the first also needs its own + or - operator, so the total is
// the summed cost minus 1 at the end.
export function buildTrace({ x, target }) {
  const digits = []
  for (let rest = target; rest > 0; rest = Math.floor(rest / x)) digits.push(rest % x)
  let pos = 0, neg = 0, rest = target
  const frames = [{ phase: 'start', activeLine: L('set pos and neg to 0'), pythonLine: 2, position: -1, digit: null, rest, pos, neg, candidates: null, message: `Write ${target} in base ${x}. Digits, least significant first: ${digits.join(', ')}.` }]
  digits.forEach((cur, k) => {
    rest = Math.floor(rest / x)
    const oldPos = pos, oldNeg = neg
    if (k === 0) {
      pos = 2 * cur
      neg = 2 * (x - cur)
      frames.push({ phase: 'digit', activeLine: L('set pos to 2 times cur'), pythonLine: 8, position: k, digit: cur, rest, pos, neg, candidates: null, message: `Position 0, digit ${cur}: plain copies of 1 (x / x) cost ${pos}; borrowing costs ${neg}.` })
      return
    }
    const posPlain = oldPos + cur * k, posBorrow = oldNeg + (cur + 1) * k
    const negPlain = oldPos + (x - cur) * k, negBorrow = oldNeg + (x - cur - 1) * k
    pos = Math.min(posPlain, posBorrow)
    frames.push({ phase: 'digit', activeLine: L('set pos to the smaller of'), pythonLine: 13, position: k, digit: cur, rest, pos, neg: oldNeg, candidates: { posPlain, posBorrow, negPlain, negBorrow }, message: `Position ${k}, digit ${cur}: pos becomes the smaller of ${posPlain} (plain) and ${posBorrow} (borrow in) = ${pos}.` })
    neg = Math.min(negPlain, negBorrow)
    frames.push({ phase: 'digit', activeLine: L('set neg to the smaller of'), pythonLine: 14, position: k, digit: cur, rest, pos, neg, candidates: { posPlain, posBorrow, negPlain, negBorrow }, message: `Position ${k}: neg becomes the smaller of ${negPlain} (plain) and ${negBorrow} (borrow in) = ${neg}.` })
  })
  const k = digits.length
  const result = Math.min(pos, k + neg) - 1
  frames.push({ phase: 'tail', activeLine: L('return the smaller of'), pythonLine: 16, position: k, digit: null, rest: 0, pos, neg, candidates: null, message: `A pending borrow at the top costs one more x^${k}: the cheaper ending is ${pos} or ${k} + ${neg} = ${k + neg}. Remove the operator that the first term does not need.` })
  frames.push({ phase: 'done', activeLine: L('return the smaller of'), pythonLine: 16, position: k, digit: null, rest: 0, pos, neg, candidates: null, message: `Least operators: ${result}.` })
  return { x, target, digits, result, frames }
}

export const code = `least operators to express target with x:
  set pos and neg to 0
  set k to 0
  while target is above 0:
    set cur to target mod x and target to target div x
    if k is 0 then
      set pos to 2 times cur and neg to 2 times (x minus cur)
    otherwise, using the old pos and neg:
      set pos to the smaller of pos + cur times k and neg + (cur plus 1) times k
      set neg to the smaller of pos + (x minus cur) times k and neg + (x minus cur minus 1) times k
    increase k by 1
  return the smaller of pos and (k plus neg), minus 1`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def least_ops_express_target(x, target):
    pos = 0
    neg = 0
    k = 0
    while target > 0:
        target, cur = divmod(target, x)
        if k == 0:
            pos = 2 * cur
            neg = 2 * (x - cur)
        else:
            old_pos = pos
            old_neg = neg
            pos = min(old_pos + cur * k, old_neg + (cur + 1) * k)
            neg = min(old_pos + (x - cur) * k, old_neg + (x - cur - 1) * k)
        k += 1
    return min(pos, k + neg) - 1
`
