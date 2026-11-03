const CODE_TEXT = `ask commonBits with num = 0 to learn how many one bits n has
set answer to zero
for each bit position i from 0 to 29
  ask commonBits with num = 1 shifted left by i, which flips bit i of n
  if the count of one bits dropped then bit i of the original n was one, so set it in answer
  record the new count of one bits
return answer`

const PYTHON_TEXT = `def recover_number(common_bits):
    ones = 30 - common_bits(0)
    answer = 0
    for i in range(30):
        equal = common_bits(1 << i)
        new_ones = 30 - equal
        if new_ones < ones:
            answer |= 1 << i
        ones = new_ones
    return answer`

export const code = CODE_TEXT.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = PYTHON_TEXT
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`No pseudocode line: ${s}`); return i + 1 }
const PY = s => { const i = python.split('\n').findIndex(t => t.includes(s)); if (i < 0) throw new Error(`No python line: ${s}`); return i + 1 }

const WIDTH = 30

export function parseInput(text) {
  const n = JSON.parse(text)
  if (!Number.isInteger(n) || n < 0 || n > 2 ** WIDTH - 1) throw new Error('Use a JSON integer from 0 to 2^30 - 1.')
  return n
}

function ones(value) {
  let count = 0
  let v = value
  while (v) { count += v & 1; v >>>= 1 }
  return count
}

// The oracle mutates the hidden value; the trace only sees its replies.
export function buildTrace(hidden) {
  let state = hidden
  const frames = []
  const commonBits = num => {
    const equal = WIDTH - ones(state ^ num)
    state ^= num
    return equal
  }
  let known = WIDTH - commonBits(0)
  let answer = 0
  frames.push({ phase: 'start', activeLine: L('ask commonBits with num = 0'), pythonLine: PY('ones = 30 - common_bits(0)'), bit: -1, num: 0, reply: null, ones: known, answer, message: `The first reply shows ${known} one bits in the hidden number.` })
  for (let i = 0; i < WIDTH; i++) {
    const num = 1 << i
    const before = known
    const equal = commonBits(num)
    const after = WIDTH - equal
    const dropped = after < known
    if (dropped) answer |= num
    frames.push({ phase: dropped ? 'set' : 'probe', activeLine: L('if the count of one bits dropped'), pythonLine: PY('if new_ones < ones'), bit: i, num, reply: equal, ones: after, answer, message: dropped ? `The count fell from ${before} to ${after}, so bit ${i} of the original number is one.` : `The count rose from ${before} to ${after}, so bit ${i} of the original number is zero.` })
    known = after
  }
  frames.push({ phase: 'done', activeLine: L('return answer'), pythonLine: PY('return answer'), bit: -1, num: 0, reply: null, ones: known, answer, message: `The original number is ${answer}.` })
  return { input: hidden, result: answer, frames }
}
