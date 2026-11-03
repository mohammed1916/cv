const MAX_PEAKS = 10

const P = s => {
  const i = python.split('\n').findIndex(line => line.includes(s))
  if (i < 0) throw new Error(`missing python line: ${s}`)
  return i + 1
}
const L = s => {
  const i = code.findIndex(c => c.text.includes(s))
  if (i < 0) throw new Error(`missing pseudocode line: ${s}`)
  return i + 1
}

export function parseInput(text) {
  const peaks = JSON.parse(text)
  if (!Array.isArray(peaks) || peaks.length < 1 || peaks.length > MAX_PEAKS) throw new Error(`Use a list of 1 to ${MAX_PEAKS} [x, y] peaks.`)
  for (const peak of peaks) {
    if (!Array.isArray(peak) || peak.length !== 2 || !peak.every(Number.isInteger)) throw new Error('Each peak is [x, y] with integers.')
    const [x, y] = peak
    if (x < 0 || x > 40 || y < 1 || y > 20) throw new Error('The visualization uses 0 <= x <= 40 and 1 <= y <= 20.')
  }
  return peaks.map(([x, y]) => [x, y])
}

export function buildTrace(peaks) {
  const n = peaks.length
  const left = peaks.map(([x, y]) => x - y)
  const right = peaks.map(([x, y]) => x + y)
  const status = peaks.map(() => 'open')
  const frames = []
  const frame = (extra) => ({ left: [...left], right: [...right], status: [...status], current: -1, other: -1, covered: null, visible: status.filter(s => s === 'visible').length, ...extra })

  frames.push(frame({ phase: 'start', activeLine: L('convert each peak'), pythonLine: P('left = ['), message: 'Each peak (x, y) owns the ground interval [x - y, x + y] of its triangle.' }))
  let visible = 0
  for (let i = 0; i < n; i++) {
    frames.push(frame({ phase: 'pick', current: i, activeLine: L('for each mountain i'), pythonLine: P('for i in range'), message: `Check mountain ${i} at (${peaks[i][0]}, ${peaks[i][1]}), interval [${left[i]}, ${right[i]}].` }))
    let hiddenBy = -1
    for (let j = 0; j < n; j++) {
      if (j === i) continue
      const covers = left[j] <= left[i] && right[i] <= right[j]
      const text = covers
        ? `Mountain ${j} covers mountain ${i}: [${left[j]}, ${right[j]}] contains [${left[i]}, ${right[i]}].`
        : `Mountain ${j} does not cover mountain ${i}: [${left[j]}, ${right[j]}] does not contain [${left[i]}, ${right[i]}].`
      frames.push(frame({ phase: 'compare', current: i, other: j, covered: covers, activeLine: L('if left of j is at most'), pythonLine: P('if left[j]'), message: text }))
      if (covers) {
        hiddenBy = j
        break
      }
    }
    if (hiddenBy >= 0) {
      status[i] = 'hidden'
      frames.push(frame({ phase: 'hidden', current: i, other: hiddenBy, covered: true, activeLine: L('i is hidden and stop'), pythonLine: P('hidden = True'), message: `Mountain ${i} is hidden by mountain ${hiddenBy}, including the boundary or an identical peak.` }))
    } else {
      status[i] = 'visible'
      visible++
      frames.push(frame({ phase: 'visible', current: i, activeLine: L('add one to visible'), pythonLine: P('visible += 1'), message: `No other mountain covers mountain ${i}; visible count is ${visible}.` }))
    }
  }
  frames.push(frame({ phase: 'done', activeLine: L('return visible'), pythonLine: P('return visible'), message: `${visible} mountain${visible === 1 ? '' : 's'} remain visible.` }))
  return { input: peaks, result: visible, frames }
}

export const code = [
  'count the mountains whose peak no other mountain covers',
  'convert each peak to ground interval left = x minus y and right = x plus y',
  'set visible to zero',
  'for each mountain i',
  '  assume i is not hidden',
  '  for each other mountain j',
  '    if left of j is at most left of i and right of i is at most right of j then i is hidden and stop',
  '  if i is still not hidden then add one to visible',
  'return visible',
].map((text, index) => ({ line: index + 1, text }))

export const python = `def count_visible_mountains(peaks):
    left = [x - y for x, y in peaks]
    right = [x + y for x, y in peaks]
    visible = 0
    for i in range(len(peaks)):
        hidden = False
        for j in range(len(peaks)):
            if j == i:
                continue
            if left[j] <= left[i] and right[i] <= right[j]:
                hidden = True
                break
        if not hidden:
            visible += 1
    return visible
`
