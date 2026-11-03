export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with s.')
  const { s } = input
  if (typeof s !== 'string' || s.length < 1 || s.length > 30 || !/^[a-z]+$/.test(s)) throw new Error('s has 1 to 30 lowercase letters.')
  return { s }
}

export const code = `max runs sharing one length of s
  runs = []
  i = 0
  while i < len(s)
    j = i
    extend j while s at j equals s at i
    record the run length j minus i in runs
    i = j
  tally how many runs have each length
  best = 0
  for each length in the tally
    best = max(best, tally of length)
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing pseudocode: ${s}`); return i + 1 }

export const python = `def max_equal_length_runs(s):
    runs = []
    i = 0
    while i < len(s):
        j = i
        while j < len(s) and s[j] == s[i]:
            j += 1
        runs.append(j - i)
        i = j
    tally = {}
    for length in runs:
        tally[length] = tally.get(length, 0) + 1
    best = 0
    for length in tally:
        best = max(best, tally[length])
    return best`
const PY = python.split('\n')
const Q = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing python: ${s}`); return i + 1 }

export function buildTrace({ s }) {
  const frames = []
  const runs = []
  const tally = new Map()
  let best = 0
  const snapshot = (phase, extra) => ({
    phase,
    runs: runs.map(r => ({ ...r })),
    tally: [...tally.entries()].sort((a, b) => a[0] - b[0]),
    best,
    ...extra,
  })
  frames.push(snapshot('start', { pythonLine: Q('runs = []'), activeLine: L('runs = []'), current: -1, message: `Scan ${s.length} characters for maximal runs of equal characters.` }))
  let i = 0
  while (i < s.length) {
    let j = i
    while (j < s.length && s[j] === s[i]) j++
    runs.push({ ch: s[i], start: i, length: j - i })
    frames.push(snapshot('run', { pythonLine: Q('runs.append'), activeLine: L('record the run length'), current: runs.length - 1, message: `Run of ${s[i]} from ${i} to ${j - 1} has length ${j - i}.` }))
    tally.set(j - i, (tally.get(j - i) || 0) + 1)
    frames.push(snapshot('tally', { pythonLine: Q('tally[length] ='), activeLine: L('tally how many runs'), current: runs.length - 1, message: `${tally.get(j - i)} run${tally.get(j - i) === 1 ? '' : 's'} now have length ${j - i}.` }))
    i = j
  }
  for (const [, count] of [...tally.entries()].sort((a, b) => a[0] - b[0])) {
    best = Math.max(best, count)
  }
  frames.push(snapshot('done', { pythonLine: Q('return best'), activeLine: L('return best'), current: -1, message: `Largest group of runs with one length: ${best}.` }))
  return { input: { s }, result: best, frames }
}
