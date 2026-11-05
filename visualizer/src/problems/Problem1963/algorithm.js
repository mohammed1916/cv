// LeetCode 1963: scan with a count of open brackets. Each unmatched ']' needs one swap with a later '[' and every swap fixes two of them, so the answer is ceil(unmatched / 2).
const SOURCE = [
  "function minSwaps(s) {",
  "  let open = 0, unmatched = 0",
  "  for (const ch of s) {",
  "    if (ch === '[') open++",
  "    else if (open > 0) open--",
  "    else unmatched++",
  "  }",
  "  return Math.floor((unmatched + 1) / 2)",
  "}",
]

export const code = SOURCE.map((text, index) => ({ line: index + 1, text }))

export const python = `def min_swaps(s):
    open_count = 0
    unmatched = 0
    for ch in s:
        if ch == "[":
            open_count += 1
        elif open_count > 0:
            open_count -= 1
        else:
            unmatched += 1
    return (unmatched + 1) // 2
`

const L = text => { const i = SOURCE.findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no code line: ${text}`); return i + 1 }
const P = text => { const i = python.split('\n').findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no python line: ${text}`); return i + 1 }

export const phases = [
  { id: 'scan', label: 'Scan', description: 'Match closing brackets with earlier openers.' },
  { id: 'done', label: 'Result', description: 'Swaps needed.' },
]

export function parseInput(text) {
  const s = String(text).trim()
  if (!/^(\[|\])+$/.test(s) || s.length % 2 !== 0 || s.length > 30) throw new Error('Enter an even-length string of [ and ] (up to 30 characters).')
  const opens = [...s].filter(c => c === '[').length
  if (opens * 2 !== s.length) throw new Error('The string needs equal numbers of [ and ].')
  return { s }
}

export function buildTrace({ s }) {
  const frames = []
  let open = 0, unmatched = 0
  const status = []
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    if (ch === '[') { open++; status.push('open') }
    else if (open > 0) { open--; status.push('matched') }
    else { unmatched++; status.push('unmatched') }
    frames.push({ phase: 'scan', activeLine: L(ch === '[' ? 'open++' : open >= 0 && status[i] === 'matched' ? 'open--' : 'unmatched++'), pythonLine: P(ch === '[' ? 'open_count += 1' : status[i] === 'matched' ? 'open_count -= 1' : 'unmatched += 1'), message: status[i] === 'open' ? `"[" waits for a partner: ${open} open.` : status[i] === 'matched' ? `"]" matches an earlier "[": ${open} still open.` : `"]" has no partner yet: ${unmatched} unmatched so far.`, i, status: [...status], open, unmatched })
  }
  const result = Math.floor((unmatched + 1) / 2)
  frames.push({ phase: 'done', activeLine: L('return Math.floor'), pythonLine: P('return (unmatched'), message: `${unmatched} unmatched ] need ${result} swap(s).`, i: -1, status: [...status], open, unmatched, result })
  return { input: { s }, result, frames }
}
