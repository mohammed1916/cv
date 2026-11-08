// Latest time by replacing hidden digits: each ? takes the largest digit that still makes a valid clock time.
const JS_LINES = [
  { text: 'const t = time.split("")', py: 't = list(time)' },
  { text: 'if (t[0] === "?") t[0] = t[1] === "?" || t[1] <= "3" ? "2" : "1"', py: "if t[0] == '?'" },
  { text: 'if (t[1] === "?") t[1] = t[0] === "2" ? "3" : "9"', py: "if t[1] == '?'" },
  { text: 'if (t[3] === "?") t[3] = "5"', py: "if t[3] == '?'" },
  { text: 'if (t[4] === "?") t[4] = "9"', py: "if t[4] == '?'" },
  { text: 'return t.join("")', py: "return ''.join" },
]

export const code = JS_LINES.map(({ text }, i) => ({ line: i + 1, text }))

export const python = `def maximumTime(time):
    t = list(time)
    if t[0] == '?':
        t[0] = '2' if t[1] == '?' or t[1] <= '3' else '1'
    if t[1] == '?':
        t[1] = '3' if t[0] == '2' else '9'
    if t[3] == '?':
        t[3] = '5'
    if t[4] == '?':
        t[4] = '9'
    return ''.join(t)
`

const PY = python.split('\n')
const pyAt = needle => {
  const index = PY.findIndex(line => line.includes(needle))
  if (index < 0) throw new Error(`python line missing: ${needle}`)
  return index + 1
}
export const pythonLineMap = Object.fromEntries(JS_LINES.map((line, i) => [i + 1, pyAt(line.py)]))

export const phases = [
  { id: 'hour-tens', label: 'Hour tens', description: 'Choose 2 when the hour can still be 20 to 23, otherwise 1.' },
  { id: 'hour-units', label: 'Hour units', description: 'Choose the largest hour digit that fits the tens digit.' },
  { id: 'minute-tens', label: 'Minute tens', description: 'Minutes go up to 59.' },
  { id: 'minute-units', label: 'Minute units', description: 'Minutes go up to 59, so the last digit is 9.' },
  { id: 'done', label: 'Result', description: 'The latest valid time.' },
]

export const examples = [
  { label: 'All hidden', input: '"??:??"' },
  { label: 'Hour forced by tens', input: '"1?:2?"' },
  { label: 'Zero tens', input: '"0?:??"' },
  { label: 'Largest time, all fixed', input: '"23:59"' },
  { label: 'Minutes forced by tens', input: '"??:5?"' },
  { label: 'Hour starts with two', input: '"2?:??"' },
]

export const complexity = 'O(1) time and O(1) space: the clock has five characters.'

export function parseInput(text) {
  const time = JSON.parse(text)
  if (typeof time !== 'string' || !/^[0-9?]{2}:[0-9?]{2}$/.test(time)) throw new Error('Use a JSON string of the form HH:MM with digits or ?.')
  const [h, m] = time.split(':')
  const hourOk = [...h].every((c, i) => c === '?' || (i === 0 ? c <= '2' : true))
  if (!hourOk) throw new Error('The first hour digit is 0, 1 or 2.')
  return time
}

export function buildTrace(time) {
  const frames = []
  const t = time.split('')
  const snap = extra => ({ t: [...t], ...extra })
  frames.push({ phase: 'hour-tens', activeLine: 1, index: 0, message: `Start from ${time}.`, snapshot: snap({}) })
  if (t[0] === '?') {
    t[0] = t[1] === '?' || t[1] <= '3' ? '2' : '1'
    frames.push({ phase: 'hour-tens', activeLine: 2, index: 0, message: `Hour tens becomes ${t[0]}.`, snapshot: snap({}) })
  }
  if (t[1] === '?') {
    t[1] = t[0] === '2' ? '3' : '9'
    frames.push({ phase: 'hour-units', activeLine: 3, index: 1, message: `Hour units becomes ${t[1]}.`, snapshot: snap({}) })
  }
  if (t[3] === '?') {
    t[3] = '5'
    frames.push({ phase: 'minute-tens', activeLine: 4, index: 3, message: 'Minute tens becomes 5.', snapshot: snap({}) })
  }
  if (t[4] === '?') {
    t[4] = '9'
    frames.push({ phase: 'minute-units', activeLine: 5, index: 4, message: 'Minute units becomes 9.', snapshot: snap({}) })
  }
  const result = t.join('')
  frames.push({ phase: 'done', activeLine: 6, index: -1, result, message: `Latest time: ${result}.`, snapshot: snap({ result }) })
  return { input: time, result, frames }
}
