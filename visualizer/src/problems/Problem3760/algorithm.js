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
  frames.push({ pythonLine: P('started = set()'), activeLine: L('const started'), phase: 'start', at: -1, starts: [], message: 'No letter starts a piece yet.' })
  for (let i = 0; i < s.length; i++) {
    if (started.has(s[i])) {
      frames.push({ pythonLine: P('continue'), activeLine: L('if (started.has'), phase: 'repeat', at: i, starts: [...starts], message: `${s[i]} already starts a piece, so index ${i} stays in the piece before it.` })
    } else {
      started.add(s[i])
      starts.push(i)
      frames.push({ pythonLine: P('started.add'), activeLine: L('started.add'), phase: 'cut', at: i, starts: [...starts], message: `${s[i]} is new, so a piece starts at index ${i}.` })
    }
  }
  frames.push({ pythonLine: P('return len'), activeLine: L('return started.size'), phase: 'done', at: -1, starts: [...starts], message: `${started.size} piece${started.size === 1 ? '' : 's'}, one for each distinct letter.` })
  return { input: { s }, result: started.size, starts, frames }
}

export const code = `function maxSubstringsDistinctStart(s) {
  const started = new Set()
  for (const ch of s) {
    if (started.has(ch)) continue
    started.add(ch)
  }
  return started.size
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const hit = code.find(c => c.text.includes(s))
  if (!hit) throw new Error(`No JavaScript line contains "${s}".`)
  return hit.line
}
const P = s => {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`No Python line contains "${s}".`)
  return index + 1
}

export const python = `def max_substrings_distinct_start(s):
    started = set()
    for ch in s:
        if ch in started:
            continue
        started.add(ch)
    return len(started)
`
