const CODE_TEXT = `function guessNumber(commonSetBits) {
  let answer = 0
  for (let i = 0; i < 30; i++) {
    const reply = commonSetBits(1 << i)
    if (reply === 1) answer |= 1 << i
  }
  return answer
}`
const PYTHON_TEXT = `def guess_number_i(common_set_bits):
    answer = 0
    for i in range(30):
        reply = common_set_bits(1 << i)
        if reply == 1:
            answer |= 1 << i
    return answer`

export const code = CODE_TEXT.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = PYTHON_TEXT
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`No pseudocode line: ${s}`); return i + 1 }
const PY = s => { const i = python.split('\n').findIndex(t => t.includes(s)); if (i < 0) throw new Error(`No python line: ${s}`); return i + 1 }

export function parseInput(text) {
  const n = JSON.parse(text)
  if (!Number.isInteger(n) || n < 1 || n > 2 ** 30 - 1) throw new Error('Use a JSON integer from 1 to 2^30 - 1.')
  return n
}

// The hidden value is only read through the oracle; the trace is built from its replies.
export function buildTrace(hidden) {
  const frames = []
  const oracle = num => {
    let shared = hidden & num
    let bits = 0
    while (shared) { bits += shared & 1; shared >>>= 1 }
    return bits
  }
  let answer = 0
  frames.push({ phase: 'start', activeLine: L('let answer = 0'), pythonLine: PY('answer = 0'), bit: -1, num: 0, reply: null, answer, message: 'Start with an answer of zero. Each oracle call tests one bit.' })
  for (let i = 0; i < 30; i++) {
    const num = 1 << i
    const reply = oracle(num)
    if (reply === 1) {
      answer |= num
      frames.push({ phase: 'set', activeLine: L('answer |= 1 << i'), pythonLine: PY('answer |='), bit: i, num, reply, answer, message: `commonSetBits(${num}) = 1, so bit ${i} of the hidden number is set.` })
    } else {
      frames.push({ phase: 'probe', activeLine: L('if (reply === 1)'), pythonLine: PY('if reply == 1'), bit: i, num, reply, answer, message: `commonSetBits(${num}) = 0, so bit ${i} is clear.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return answer'), pythonLine: PY('return answer'), bit: -1, num: 0, reply: null, answer, message: `The hidden number is ${answer}.` })
  return { input: hidden, result: answer, frames }
}
