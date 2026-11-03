export const code = `best length is zero
for each start index l
  make an empty count table
  for each end index r from l
    add value at r to the count table
    set levels to the sorted distinct frequencies
    if one distinct value, or exactly two levels f and 2f, record length r minus l plus one
return best`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def frequency_balance_subarray(a):
    best = 0
    for l in range(len(a)):
        counts = {}
        for r in range(l, len(a)):
            counts[a[r]] = counts.get(a[r], 0) + 1
            levels = sorted(set(counts.values()))
            single = len(counts) == 1
            paired = len(levels) == 2 and levels[1] == 2 * levels[0]
            if single or paired:
                best = max(best, r - l + 1)
    return best
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export function parseInput(text) {
  const values = JSON.parse(text)
  if (!Array.isArray(values) || values.length < 1 || values.length > 12) throw new Error('Use a JSON array of 1 to 12 integers.')
  if (!values.every(v => Number.isInteger(v) && v >= 1 && v <= 1000000000)) throw new Error('Each value is an integer from 1 to 10^9.')
  return values
}

function levelsOf(counts) {
  return [...new Set(counts.values())].sort((x, y) => x - y)
}

export function buildTrace(a) {
  const frames = []
  let best = 0
  let bestRange = null
  frames.push({ phase: 'start', activeLine: L('best length is zero'), pythonLine: P('best = 0'), l: -1, r: -1, counts: [], levels: [], ok: null, best, bestRange, message: 'No balanced subarray is recorded yet.' })
  for (let l = 0; l < a.length; l++) {
    frames.push({ phase: 'start-index', activeLine: L('for each start index l'), pythonLine: P('for l in range'), l, r: l - 1, counts: [], levels: [], ok: null, best, bestRange, message: `Start a window at index ${l} with an empty count table.` })
    const counts = new Map()
    for (let r = l; r < a.length; r++) {
      counts.set(a[r], (counts.get(a[r]) || 0) + 1)
      const levels = levelsOf(counts)
      const single = counts.size === 1
      const paired = levels.length === 2 && levels[1] === 2 * levels[0]
      const ok = single || paired
      if (ok && r - l + 1 > best) {
        best = r - l + 1
        bestRange = [l, r]
      }
      frames.push({
        phase: ok ? 'record' : 'extend', activeLine: L('add value at r to the count table'), pythonLine: P('counts[a[r]]'),
        l, r, counts: [...counts.entries()], levels, ok, single, best, bestRange,
        message: `Window ${l} to ${r}: ${counts.size} distinct value${counts.size === 1 ? '' : 's'}, frequency levels [${levels.join(', ')}] — ${single ? 'one distinct value, so it qualifies' : paired ? 'levels f and 2f, so it qualifies' : 'does not qualify'}.`,
      })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return best'), pythonLine: P('return best'), l: -1, r: -1, counts: [], levels: [], ok: null, best, bestRange, message: `Longest balanced subarray length is ${best}.` })
  return { input: a, result: best, frames }
}
