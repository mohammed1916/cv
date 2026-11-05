export function parseInput(text) {
  const time = JSON.parse(text)
  if (typeof time !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new Error('Enter a time as "HH:MM" (00:00 to 23:59).')
  return time
}

const minutesOf = time => Number(time.slice(0, 2)) * 60 + Number(time.slice(3))

export function buildTrace(time) {
  const digits = [...new Set(time.replace(':', ''))].sort()
  const start = minutesOf(time)
  const frames = [{ phase: 'start', pythonLine: 5, activeLine: L('const allowed = '), candidate: null, gap: null, best: null, digits, message: `The clock may only use the digits ${digits.join(', ')}. Try every arrangement of them.` }]
  let best = time, bestGap = 1440
  for (const a of digits) for (const b of digits) for (const c of digits) for (const d of digits) {
    const candidate = `${a}${b}:${c}${d}`
    if (Number(candidate.slice(0, 2)) > 23 || Number(candidate.slice(3)) > 59) continue
    // Forward distance in minutes; the same time again counts as a full day.
    const gap = (minutesOf(candidate) - start + 1440) % 1440 || 1440
    const improved = gap < bestGap
    if (improved) { best = candidate; bestGap = gap }
    frames.push({ phase: 'candidate', pythonLine: 14, activeLine: L('if (gap < bestGap)'), candidate, gap, best, digits, improved, message: improved ? `${candidate} is ${gap} minutes ahead and the closest so far.` : `${candidate} is ${gap} minutes ahead, not closer than ${best}.` })
  }
  frames.push({ phase: 'done', pythonLine: 16, activeLine: L('return best'), candidate: best, gap: bestGap, best, digits, improved: false, message: `The closest valid arrangement is ${best}.` })
  return { input: time, result: best, frames }
}

export const code = `function nextClosestTime(time) {
  const allowed = [...new Set(time.replace(':', ''))].sort()
  const start = Number(time.slice(0, 2)) * 60 + Number(time.slice(3))
  let best = time
  let bestGap = 1440
  for (const a of allowed) for (const b of allowed) for (const c of allowed) for (const d of allowed) {
    const hours = a + b
    const minutes = c + d
    if (Number(hours) > 23 || Number(minutes) > 59) continue
    const cand = Number(hours) * 60 + Number(minutes)
    const gap = (cand - start + 1440) % 1440 || 1440
    if (gap < bestGap) {
      best = \`\${hours}:\${minutes}\`
      bestGap = gap
    }
  }
  return best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from itertools import product


def next_closest_time(time):
    allowed = sorted(set(time) - {':'})
    start = int(time[:2]) * 60 + int(time[3:])
    best, best_gap = time, 1440
    for a, b, c, d in product(allowed, repeat=4):
        hours, minutes = a + b, c + d
        if int(hours) > 23 or int(minutes) > 59:
            continue
        cand = int(hours) * 60 + int(minutes)
        gap = (cand - start) % 1440 or 1440
        if gap < best_gap:
            best, best_gap = f'{hours}:{minutes}', gap
    return best
`
