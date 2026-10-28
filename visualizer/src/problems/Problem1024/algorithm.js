export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || Array.isArray(input) || typeof input !== 'object') throw new Error('Use an object with clips and time.')
  const { clips, time } = input
  if (!Array.isArray(clips) || clips.length < 1 || clips.length > 12) throw new Error('clips needs 1 to 12 intervals.')
  if (clips.some(c => !Array.isArray(c) || c.length !== 2 || !c.every(Number.isInteger) || c[0] < 0 || c[0] > c[1] || c[1] > 100)) throw new Error('Each clip is [start, end] with 0 <= start <= end <= 100.')
  if (!Number.isInteger(time) || time < 1 || time > 100) throw new Error('time is an integer from 1 to 100.')
  return { clips, time }
}

export function buildTrace(input) {
  const { clips, time } = input
  let covered = 0
  let used = 0
  const frames = [{ phase: 'start', activeLine: L('set covered to 0'), viaIndex: -1, covered, used, message: `Cover [0, ${time}] starting from 0 with no clips.` }]
  while (covered < time) {
    let reach = covered
    let viaIndex = -1
    clips.forEach(([start, end], index) => {
      if (start <= covered && end > reach) { reach = end; viaIndex = index }
    })
    if (reach === covered) {
      frames.push({ phase: 'stuck', activeLine: L('if reach is still covered'), viaIndex: -1, covered, used, message: `No clip starts at or before ${covered} and reaches past it, so the range cannot be covered.` })
      return { input, result: -1, frames }
    }
    used += 1
    covered = reach
    frames.push({ phase: 'pick', activeLine: L('set covered to reach'), viaIndex, covered, used, message: `Take clip [${clips[viaIndex].join(', ')}]; coverage now reaches ${covered}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return used'), viaIndex: -1, covered, used, message: `Coverage reaches ${covered} with ${used} clips.` })
  return { input, result: used, frames }
}

export const code = `minimum clips to cover from 0 to time:
  set covered to 0 and used to 0
  while covered is less than time
    set reach to covered
    for each clip [start, end]
      if start is at most covered and end is greater than reach then set reach to end
    if reach is still covered then return -1
    set covered to reach
    add one to used
  return used`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def video_stitching(clips, time):
    covered = 0
    used = 0
    while covered < time:
        reach = covered
        for start, end in clips:
            if start <= covered and end > reach:
                reach = end
        if reach == covered:
            return -1
        covered = reach
        used += 1
    return used
`
