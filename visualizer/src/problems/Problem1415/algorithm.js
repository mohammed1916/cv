export const phases = [
  { id: 'start', label: 'Start', description: 'There are 3 × 2^(n-1) happy strings of length n. Check that the requested rank exists.' },
  { id: 'inspect', label: 'Options and block', description: 'At this position, list the letters allowed after the previous one. Each choice starts a block of equally many completions.' },
  { id: 'update', label: 'Choose a block', description: 'The rank tells which block it falls in; take that letter and keep the offset inside the block.' },
  { id: 'done', label: 'Complete', description: 'The chosen letters form the string at the requested rank.' },
]

export function parseInput(text) {
  const parts = text.trim().split(/\s+/)
  if (parts.length !== 2) throw new Error('Enter the length n and the rank k, separated by a space.')
  const [n, k] = parts.map(Number)
  if (!Number.isInteger(n) || n < 1 || n > 10) throw new Error('Length n must be an integer from 1 to 10.')
  if (!Number.isInteger(k) || k < 1 || k > 200) throw new Error('Rank k must be an integer from 1 to 200.')
  return { n, k }
}

const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export function buildTrace({ n, k }) {
  const total = 3 * 2 ** (n - 1)
  const base = { n, k, total, chars: [], options: null, block: null, offset: null, chosen: null }
  const frames = [{
    phase: 'start', activeLine: L('total = 3'), pythonLine: P('if k > 3'),
    snapshot: base,
    message: `There are ${total} happy strings of length ${n}. Rank ${k} ${k <= total ? 'exists' : 'is beyond the last one'}.`,
  }]
  if (k > total) {
    frames.push({
      phase: 'done', activeLine: L('if k > total'), pythonLine: P('if k > 3'),
      snapshot: base,
      message: 'The rank is larger than the number of happy strings, so the answer is an empty string.',
    })
    return { input: { n, k }, result: '', frames }
  }
  let offset = k - 1
  const chars = []
  for (let i = 0; i < n; i++) {
    const options = ['a', 'b', 'c'].filter(c => chars.length === 0 || c !== chars.at(-1))
    const block = 2 ** (n - 1 - i)
    frames.push({
      phase: 'inspect', activeLine: L('options = letters'), pythonLine: P('options = [c'),
      snapshot: { n, k, total, chars: [...chars], options, block, offset, chosen: null },
      message: `Position ${i + 1}: allowed letters ${options.join(', ')}. Each one starts a block of ${block} strings.`,
    })
    const index = Math.floor(offset / block)
    const choice = options[index]
    chars.push(choice)
    frames.push({
      phase: 'update', activeLine: L('chars.append'), pythonLine: P('chars.append'),
      snapshot: { n, k, total, chars: [...chars], options, block, offset, chosen: choice },
      message: `Offset ${offset} falls in block ${index + 1}, so take ${choice}.`,
    })
    offset %= block
  }
  const result = chars.join('')
  frames.push({
    phase: 'done', activeLine: L('return join'), pythonLine: P('return "".join'),
    snapshot: { n, k, total, chars: [...chars], options: null, block: null, offset, chosen: null },
    message: `Rank ${k} is "${result}".`,
  })
  return { input: { n, k }, result, frames }
}

export const code = `k-th happy string of length n (k is 1-based):
  total = 3 * 2^(n-1)
  if k > total: return ""
  offset = k - 1
  chars = []
  for position i from 0 to n-1:
    options = letters a, b, c except the previous letter
    block = 2^(n-1-i)
    chars.append(options[offset // block])
    offset = offset % block
  return join(chars)`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def get_happy_string(n, k):
    if k > 3 * 2 ** (n - 1):
        return ""
    k -= 1
    chars = []
    for i in range(n):
        options = [c for c in "abc" if not chars or c != chars[-1]]
        block = 2 ** (n - 1 - i)
        chars.append(options[k // block])
        k %= block
    return "".join(chars)
`
