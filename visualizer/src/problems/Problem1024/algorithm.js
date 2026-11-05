export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || Array.isArray(input) || typeof input !== 'object') throw new Error('Use an object with clips and time.')
  const { clips, time } = input
  if (!Array.isArray(clips) || clips.length < 1 || clips.length > 12) throw new Error('clips needs 1 to 12 intervals.')
  if (clips.some(c => !Array.isArray(c) || c.length !== 2 || !c.every(Number.isInteger) || c[0] < 0 || c[0] > c[1] || c[1] > 100)) throw new Error('Each clip is [start, end] with 0 <= start <= end <= 100.')
  if (!Number.isInteger(time) || time < 1 || time > 100) throw new Error('time is an integer from 1 to 100.')
  return { clips, time }
}

// Each line of JavaScript is paired with the Python line on the same row.
const LINES = [
  ['function videoStitching(clips, time) {', 'def video_stitching(clips, time):'],
  ['  let covered = 0', '    covered = 0'],
  ['  let used = 0', '    used = 0'],
  ['  while (covered < time) {', '    while covered < time:'],
  ['    let reach = covered', '        reach = covered'],
  ['    for (const [start, end] of clips) {', '        for start, end in clips:'],
  ['      if (start <= covered && end > reach) reach = end', '            if start <= covered and end > reach: reach = end'],
  ['    }', ''],
  ['    if (reach === covered) return -1', '        if reach == covered: return -1'],
  ['    covered = reach', '        covered = reach'],
  ['    used++', '        used += 1'],
  ['  }', ''],
  ['  return used', '    return used'],
  ['}', ''],
]
const codeLines = LINES.map(([js]) => js)
export const code = codeLines.map((text, index) => ({ line: index + 1, text }))
const L = s => codeLines.findIndex(c => c.includes(s)) + 1
export const python = LINES.map(([, py]) => py).join('\n')
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export function buildTrace(input) {
  const { clips, time } = input
  let covered = 0
  let used = 0
  const picked = []
  const frames = [{ phase: 'start', pythonLine: P('covered = 0'), activeLine: L('let covered = 0'), viaIndex: -1, covered, used, picked: [], message: `Cover [0, ${time}] starting from 0 with no clips.` }]
  while (covered < time) {
    let reach = covered
    let viaIndex = -1
    clips.forEach(([start, end], index) => {
      if (start <= covered && end > reach) { reach = end; viaIndex = index }
    })
    if (reach === covered) {
      frames.push({ phase: 'stuck', pythonLine: P('return -1'), activeLine: L('if (reach === covered)'), viaIndex: -1, covered, used, picked: [...picked], message: `No clip starts at or before ${covered} and reaches past it, so the range cannot be covered.` })
      return { input, result: -1, frames }
    }
    used += 1
    covered = reach
    picked.push(viaIndex)
    frames.push({ phase: 'pick', pythonLine: P('covered = reach'), activeLine: L('covered = reach'), viaIndex, covered, used, picked: [...picked], message: `Take clip [${clips[viaIndex].join(', ')}]; coverage now reaches ${covered}.` })
  }
  frames.push({ phase: 'done', pythonLine: P('return used'), activeLine: L('return used'), viaIndex: -1, covered, used, picked: [...picked], message: `Coverage reaches ${covered} with ${used} clips.` })
  return { input, result: used, frames }
}
