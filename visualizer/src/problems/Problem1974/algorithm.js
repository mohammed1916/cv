// LeetCode 1974: letters sit on a circle of 26; each letter costs the shorter way around plus one second to type.
const SOURCE = [
  "function minTimeToType(word) {",
  "  let pointer = 0, seconds = 0",
  "  for (const ch of word) {",
  "    const target = ch.charCodeAt(0) - 97",
  "    const gap = Math.abs(target - pointer)",
  "    seconds += Math.min(gap, 26 - gap) + 1",
  "    pointer = target",
  "  }",
  "  return seconds",
  "}",
]

export const code = SOURCE.map((text, index) => ({ line: index + 1, text }))

export const python = `def min_time_to_type(word):
    pointer = 0
    seconds = 0
    for ch in word:
        target = ord(ch) - ord("a")
        gap = abs(target - pointer)
        seconds += min(gap, 26 - gap) + 1
        pointer = target
    return seconds
`

const L = text => { const i = SOURCE.findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no code line: ${text}`); return i + 1 }
const P = text => { const i = python.split('\n').findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no python line: ${text}`); return i + 1 }

export const phases = [
  { id: 'move', label: 'Move and type', description: 'Turn the shorter way to each letter, then type it.' },
  { id: 'done', label: 'Result', description: 'Total seconds.' },
]

export function parseInput(text) {
  const word = String(text).trim()
  if (!/^[a-z]{1,30}$/.test(word)) throw new Error('Enter 1 to 30 lowercase letters.')
  return { word }
}

export function buildTrace({ word }) {
  const frames = []
  let pointer = 0
  let seconds = 0
  for (const ch of word) {
    const target = ch.charCodeAt(0) - 97
    const gap = Math.abs(target - pointer)
    const moves = Math.min(gap, 26 - gap)
    seconds += moves + 1
    frames.push({ phase: 'move', activeLine: L('const gap ='), pythonLine: P('gap = abs'), message: `From ${String.fromCharCode(97 + pointer)} to ${ch}: ${moves} move(s) the shorter way, then 1 typing second.`, pointer, target, letter: ch, moves, seconds })
    pointer = target
  }
  frames.push({ phase: 'done', activeLine: L('return seconds'), pythonLine: P('return seconds'), message: `Total: ${seconds} seconds.`, pointer, target: -1, letter: null, moves: 0, seconds })
  return { input: { word }, result: seconds, frames }
}
