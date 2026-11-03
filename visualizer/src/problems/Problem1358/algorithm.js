// Teaching model written for this visualizer. The sample strings and wording are original.
export const phases = [
  { id: 'update', label: 'Record', description: 'Remember the latest position of the letter just read.' },
  { id: 'count', label: 'Count', description: 'Every start at or before the earliest latest-position gives a valid substring ending here.' },
  { id: 'done', label: 'Result', description: 'The running total is the answer.' },
]

const CODE = [
  'count substrings(s):',
  '  last = {a: -1, b: -1, c: -1}',
  '  total = 0',
  '  for i from 0 to length - 1:',
  '    last[s[i]] = i',
  '    if every letter has been seen:',
  '      total += 1 + min(last)',
  '  return total',
]
const PYTHON = `def count_abc_substrings(s):
    last = {'a': -1, 'b': -1, 'c': -1}
    total = 0
    for i, ch in enumerate(s):
        last[ch] = i
        if min(last.values()) >= 0:
            total += 1 + min(last.values())
    return total`
const PY = PYTHON.split('\n')
const at = (lines, text) => {
  const index = lines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing solver line: ${text}`)
  return index + 1
}
const L = text => at(CODE, text)
const P = text => at(PY, text)

export const code = CODE.map((text, index) => ({ line: index + 1, text }))
export const python = PYTHON

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input.s !== 'string') throw new Error('Enter a JSON object with a string field s.')
  if (input.s.length < 1 || input.s.length > 30) throw new Error('Use 1 to 30 characters.')
  if (!/^[abc]+$/.test(input.s)) throw new Error('Use only the letters a, b and c.')
  return { s: input.s }
}

export function buildTrace({ s }) {
  const last = { a: -1, b: -1, c: -1 }
  let total = 0
  const frames = []
  const snap = (index, extra = {}) => ({ s, index, last: { ...last }, total, ...extra })

  for (let i = 0; i < s.length; i++) {
    last[s[i]] = i
    const earliest = Math.min(last.a, last.b, last.c)
    frames.push({
      phase: 'update', activeLine: L('last[s[i]] = i'), pythonLine: P('last[ch] = i'),
      message: `Position ${i} holds ${s[i]}, so its latest position is ${i}. ${earliest >= 0 ? '' : 'Not every letter has appeared yet, so no substring ends here.'}`,
      snapshot: snap(i),
    })
    if (earliest >= 0) {
      total += 1 + earliest
      frames.push({
        phase: 'count', activeLine: L('total += 1 + min'), pythonLine: P('total += 1 + min'),
        message: `All three letters are present. Starts 0 through ${earliest} each give a valid substring ending at ${i}, which is ${earliest + 1} new substrings.`,
        snapshot: snap(i, { added: earliest + 1 }),
      })
    }
  }
  frames.push({
    phase: 'done', activeLine: L('return total'), pythonLine: P('return total'),
    message: `Every end position has been counted, so the total is ${total}.`,
    snapshot: snap(s.length - 1),
  })
  return { input: { s }, result: total, frames }
}
