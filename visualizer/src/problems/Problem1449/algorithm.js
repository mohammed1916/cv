export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.cost) || !Number.isInteger(obj.target)) {
    throw new Error('Use {"cost": [nine integers], "target": integer}.')
  }
  if (obj.cost.length !== 9) throw new Error('cost needs exactly 9 values, one for each digit 1 to 9.')
  if (obj.cost.some(c => !Number.isInteger(c) || c < 1 || c > 9)) throw new Error('Each cost is an integer from 1 to 9.')
  if (obj.target < 1 || obj.target > 15) throw new Error('target is an integer from 1 to 15.')
  return { cost: obj.cost, target: obj.target }
}

export function buildTrace(input) {
  const { cost, target } = input
  const NONE = -1
  const length = Array(target + 1).fill(NONE)
  length[0] = 0
  const frames = [{ phase: 'start', activeLine: L('set length[0]'), total: 0, rem: null, digit: null, length: length.slice(), digits: '', message: 'length[t] is the most digits that cost exactly t, or -1 if no digits do.' }]
  for (let t = 1; t <= target; t++) {
    for (let d = 1; d <= 9; d++) {
      const c = cost[d - 1]
      if (c <= t && length[t - c] !== NONE) length[t] = Math.max(length[t], length[t - c] + 1)
    }
    frames.push({ phase: 'fill', activeLine: L('for each total t'), total: t, rem: null, digit: null, length: length.slice(), digits: '', message: length[t] === NONE ? `Cost ${t} cannot be made exactly.` : `Cost ${t} can be made with up to ${length[t]} digits.` })
  }
  if (length[target] === NONE) {
    frames.push({ phase: 'done', activeLine: L('if length[target] is unreachable'), total: target, rem: null, digit: null, length: length.slice(), digits: '0', message: 'The target cannot be paid exactly, so the answer is "0".' })
    return { input, result: '0', frames }
  }
  let rem = target
  let digits = ''
  while (rem > 0) {
    for (let d = 9; d >= 1; d--) {
      const c = cost[d - 1]
      if (c <= rem && length[rem - c] !== NONE && length[rem - c] === length[rem] - 1) {
        digits += String(d)
        rem -= c
        frames.push({ phase: 'build', activeLine: L('pick the largest digit'), total: target, rem, digit: d, length: length.slice(), digits, message: `Choose digit ${d} (cost ${c}); ${rem} remains.` })
        break
      }
    }
  }
  frames.push({ phase: 'done', activeLine: L('return the digits'), total: target, rem: 0, digit: null, length: length.slice(), digits, message: `Largest integer: ${digits}.` })
  return { input, result: digits, frames }
}

export const code = `largest integer whose digit costs add up to target:
  set length[0] to 0 and every other length to unreachable
  for each total t from 1 to target:
    for each digit d from 1 to 9 whose cost fits:
      if length[t - cost[d]] is reachable then
        length[t] = the larger of length[t] and length[t - cost[d]] + 1
  if length[target] is unreachable then
    return "0"
  set rem to target
  while rem is above 0:
    pick the largest digit d whose cost fits and leaves exactly one fewer digit
    append d to the answer, then subtract cost[d] from rem
  return the digits`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def largest_number(cost, target):
    NONE = -1
    length = [NONE] * (target + 1)
    length[0] = 0
    for t in range(1, target + 1):
        for d in range(1, 10):
            c = cost[d - 1]
            if c <= t and length[t - c] != NONE:
                length[t] = max(length[t], length[t - c] + 1)
    if length[target] == NONE:
        return "0"
    digits = []
    rem = target
    while rem > 0:
        for d in range(9, 0, -1):
            c = cost[d - 1]
            if c <= rem and length[rem - c] != NONE and length[rem - c] == length[rem] - 1:
                digits.append(str(d))
                rem -= c
                break
    return "".join(digits)
`
