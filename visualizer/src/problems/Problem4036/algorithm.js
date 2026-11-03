const PHASES = [
  { id: 'start', label: 'Count', description: 'Start with x copies of the letter a.' },
  { id: 'take', label: 'Take a block', description: 'Take the largest power of two that still fits and write its letter.' },
  { id: 'done', label: 'Answer', description: 'Every copy is spent; the string is final for this count.' },
]

export const phases = PHASES

const CODE_LINES = [
  'lexicographically largest string for each count x',
  'for each x in nums',
  '  s is empty and rem is x',
  '  while rem is above zero',
  '    k is the largest exponent with 2 to the k at most rem, capped at 25',
  '    append the letter a plus k to s',
  '    subtract 2 to the k from rem',
  '  add s to the answers',
  'return the answers',
]

export const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }))

function L(fragment) {
  const index = code.findIndex(c => c.text.includes(fragment))
  if (index < 0) throw new Error(`Missing pseudocode line: ${fragment}`)
  return index + 1
}

export const python = `def largest_strings(nums):
    answers = []
    for x in nums:
        s = []
        rem = x
        while rem > 0:
            k = min(25, rem.bit_length() - 1)
            s.append(chr(97 + k))
            rem -= 1 << k
        answers.append(''.join(s))
    return answers
`

const PY = python.split('\n')

function P(fragment) {
  const index = PY.findIndex(line => line.includes(fragment))
  if (index < 0) throw new Error(`Missing Python line: ${fragment}`)
  return index + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums.')
  const { nums } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 6) throw new Error('nums has 1 to 6 counts.')
  if (!nums.every(x => Number.isInteger(x) && x >= 1 && x <= 100000000)) throw new Error('Each count is an integer from 1 to 100000000.')
  return { nums }
}

export function buildTrace({ nums }) {
  const frames = []
  const answers = []
  for (const x of nums) {
    let rem = x
    let s = ''
    frames.push({ pythonLine: P('s = []'), phase: 'start', activeLine: L('for each x'), x, rem, s, answers: [...answers], message: `Start with ${x} copies of a.` })
    while (rem > 0) {
      let k = 0
      while (2 ** (k + 1) <= rem) k++
      k = Math.min(25, k)
      const letter = String.fromCharCode(97 + k)
      s += letter
      rem -= 2 ** k
      frames.push({ pythonLine: P('s.append'), phase: 'take', activeLine: L('append the letter'), x, rem, block: k, s, answers: [...answers], message: `Take a block of 2^${k} = ${2 ** k} copies as ${letter}; ${rem} left.` })
    }
    answers.push(s)
    frames.push({ pythonLine: P('answers.append'), phase: 'done', activeLine: L('add s to the answers'), x, rem: 0, s, answers: [...answers], message: `For ${x}, the largest string is ${s}.` })
  }
  frames.push({ pythonLine: P('return answers'), phase: 'done', activeLine: L('return the answers'), x: null, rem: 0, s: null, answers: [...answers], message: `Answers: ${answers.join(', ')}.` })
  return { input: { nums }, result: answers, frames }
}
