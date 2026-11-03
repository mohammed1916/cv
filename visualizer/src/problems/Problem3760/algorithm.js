export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with s.')
  const { s } = input
  if (typeof s !== 'string' || s.length < 1 || s.length > 20 || !/^[a-z]+$/.test(s)) throw new Error('s has 1 to 20 lowercase letters.')
  return { s }
}

export function buildTrace({ s }) {
  const started = new Set()
  const starts = []
  const frames = []
  frames.push({ pythonLine: Y('started = set()'), activeLine: L('start an empty set'), phase: 'start', at: -1, starts: [], message: 'No letter starts a piece yet.' })
  for (let i = 0; i < s.length; i++) {
    if (started.has(s[i])) {
      frames.push({ pythonLine: Y('continue'), activeLine: L('if ch is already'), phase: 'repeat', at: i, starts: [...starts], message: `${s[i]} already starts a piece, so index ${i} stays in the piece before it.` })
    } else {
      started.add(s[i])
      starts.push(i)
      frames.push({ pythonLine: Y('started.add'), activeLine: L('otherwise add'), phase: 'cut', at: i, starts: [...starts], message: `${s[i]} is new, so a piece starts at index ${i}.` })
    }
  }
  frames.push({ pythonLine: Y('return len'), activeLine: L('return the size'), phase: 'done', at: -1, starts: [...starts], message: `${started.size} piece${started.size === 1 ? '' : 's'}, one for each distinct letter.` })
  return { input: { s }, result: started.size, starts, frames }
}

export const code = `count the most pieces whose starting letters are all different
  start an empty set of letters that already begin a piece
  for each letter ch in s
    if ch is already in the set then continue
    otherwise add ch and start a new piece at this letter
  return the size of the set`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_substrings_distinct_start(s):
    started = set()
    for ch in s:
        if ch in started:
            continue
        started.add(ch)
    return len(started)
`
const Y = s => python.split('\n').findIndex(line => line.includes(s)) + 1
