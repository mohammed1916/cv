const CODE_TEXT = `confusing number n
  set rotated to 0 and rest to n
  while rest is greater than 0
    take the last digit d of rest
    if d cannot be rotated then return false
    set rotated to rotated times 10 plus the rotation of d
    remove the last digit from rest
  return rotated is not equal to n`

export const code = CODE_TEXT.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def confusing_number(n):
    flip = {0: 0, 1: 1, 6: 9, 8: 8, 9: 6}
    rotated = 0
    rest = n
    while rest > 0:
        digit = rest % 10
        if digit not in flip:
            return False
        rotated = rotated * 10 + flip[digit]
        rest //= 10
    return rotated != n


if __name__ == "__main__":
    print(confusing_number(89))
`

const PY_LINES = python.split('\n')
const L = text => {
  const index = code.findIndex(item => item.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = PY_LINES.findIndex(item => item.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

const FLIP = { 0: 0, 1: 1, 6: 9, 8: 8, 9: 6 }
const MAX_DIGITS = 9

export function parseInput(text) {
  const n = JSON.parse(text)
  if (!Number.isInteger(n) || n < 0 || n > 10 ** MAX_DIGITS - 1) throw new Error(`Use an integer from 0 to ${10 ** MAX_DIGITS - 1}.`)
  return n
}

export function buildTrace(n) {
  const digits = String(n)
  const frames = []
  const flipped = new Array(digits.length).fill(null)
  let rotated = 0
  let rest = n
  let processed = 0
  const state = (extra = {}) => ({ digits, flipped: flipped.slice(), processed, rotated, current: -1, verdict: null, ...extra })
  const add = (phase, line, py, message, extra) => frames.push({ phase, activeLine: L(line), pythonLine: P(py), message, ...state(extra) })
  add('start', 'set rotated to 0', 'rotated = 0', `Read ${n} from its last digit. Rotation table: 0→0, 1→1, 6→9, 8→8, 9→6.`, {})
  while (rest > 0) {
    const position = digits.length - 1 - processed
    const digit = rest % 10
    add('digit', 'take the last digit', 'digit = rest % 10', `Last digit of ${rest} is ${digit}.`, { current: position })
    if (!(digit in FLIP)) {
      add('reject', 'return false', 'return False', `${digit} cannot be rotated into a digit, so ${n} is not confusing.`, { current: position, verdict: false })
      return { input: n, result: false, frames }
    }
    flipped[position] = FLIP[digit]
    rotated = rotated * 10 + FLIP[digit]
    rest = Math.floor(rest / 10)
    processed += 1
    add('rotate', 'set rotated to rotated times 10', 'rotated = rotated * 10 + flip[digit]', `${digit} rotates to ${FLIP[digit]}; rotated so far is ${rotated}.`, { current: position })
  }
  const result = rotated !== n
  add('compare', 'return rotated is not equal', 'return rotated != n', `Rotated value ${rotated} ${result ? 'differs from' : 'equals'} ${n}.`, { verdict: result })
  return { input: n, result, frames }
}
