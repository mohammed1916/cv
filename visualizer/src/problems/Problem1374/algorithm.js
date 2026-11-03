export const phases = [
  { id: 'start', label: 'Start', description: 'Read the target length n.' },
  { id: 'inspect', label: 'Parity', description: 'An odd n can use one letter. An even n needs a second letter with an odd count.' },
  { id: 'update', label: 'Build', description: 'Append the letters that give the required odd counts.' },
  { id: 'done', label: 'Complete', description: 'Every letter that appears has an odd frequency.' },
]

export function parseInput(text) {
  const value = JSON.parse(text)
  if (!value || !Number.isInteger(value.n) || value.n < 1 || value.n > 500) {
    throw new Error('Enter JSON like {"n":7} with an integer n from 1 to 500.')
  }
  return { n: value.n }
}

const LINE = { start: 1, parity: 2, odd: 3, even: 4, done: 4 }

export function buildTrace(input) {
  const { n } = input
  const frames = []
  let out = ''
  frames.push({
    phase: 'start', activeLine: LINE.start,
    message: `Build a string of length ${n} where every letter that appears has an odd count.`,
    snapshot: { out, n, rule: null },
  })
  frames.push({
    phase: 'inspect', activeLine: n % 2 === 1 ? LINE.parity : LINE.even,
    message: n % 2 === 1
      ? `${n} is odd, so a single letter repeated ${n} times has an odd count.`
      : `${n} is even, so one letter cannot have an odd count alone. Use ${n - 1} copies of a (odd) and one b (odd).`,
    snapshot: { out, n, rule: n % 2 === 1 ? 'single' : 'pair' },
  })
  if (n % 2 === 1) {
    for (let k = 0; k < n; k++) {
      out += 'a'
      frames.push({
        phase: 'update', activeLine: LINE.odd,
        message: `Append a. The string now has ${out.length} of ${n} letters.`,
        snapshot: { out, n, rule: 'single' },
      })
    }
  } else {
    for (let k = 0; k < n - 1; k++) {
      out += 'a'
      frames.push({
        phase: 'update', activeLine: LINE.even,
        message: `Append a. ${n - 1 - k} more a remain before the single b.`,
        snapshot: { out, n, rule: 'pair' },
      })
    }
    out += 'b'
    frames.push({
      phase: 'update', activeLine: LINE.even,
      message: `Append the single b. a has ${n - 1} copies (odd) and b has 1 (odd).`,
      snapshot: { out, n, rule: 'pair' },
    })
  }
  frames.push({
    phase: 'done', activeLine: LINE.done,
    message: `Return ${out}. Each letter present has an odd count.`,
    snapshot: { out, n, rule: null },
  })
  return { input, result: out, frames }
}

export const code = `odd_count_string(n):
  if n is odd:
    return 'a' repeated n times           # one letter, odd count
  return 'a' repeated (n - 1) times + 'b'  # a has n-1 (odd), b has 1`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def odd_count_string(n):
    if n % 2 == 1:
        return 'a' * n
    return 'a' * (n - 1) + 'b'`
