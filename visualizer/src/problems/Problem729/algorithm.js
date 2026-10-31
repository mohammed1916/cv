export function parseInput(text) {
  const ops = JSON.parse(text)
  if (!Array.isArray(ops) || ops.length < 1 || ops.length > 1000) throw new Error('Enter 1–1,000 bookings as [start, end] pairs.')
  for (const op of ops) {
    if (!Array.isArray(op) || op.length !== 2 || !Number.isInteger(op[0]) || !Number.isInteger(op[1]) || op[0] < 0 || op[1] > 1000000000 || op[0] >= op[1]) throw new Error('Each booking is [start, end) with 0 ≤ start < end ≤ 1e9.')
  }
  return ops
}

// A new event [s, e) conflicts when it overlaps any booked event; touching ends do not overlap.
export function buildTrace(ops) {
  const booked = []
  const results = []
  const frames = [{ phase: 'start', booked: [], op: null, activeLine: 1, pythonLine: 2, message: 'Empty calendar.' }]
  ops.forEach(([s, e], i) => {
    const clash = booked.find(([bs, be]) => s < be && bs < e) ?? null
    if (!clash) booked.push([s, e])
    results.push(clash === null)
    frames.push({ phase: clash ? 'reject' : 'accept', op: i, booked: booked.map(x => [...x]), attempt: [s, e], clash, result: results.slice(), activeLine: clash ? 4 : 5, pythonLine: clash ? 5 : 8,
      message: clash ? `[${s}, ${e}) overlaps [${clash[0]}, ${clash[1]}): rejected.` : `[${s}, ${e}) is free: booked.` })
  })
  frames.push({ phase: 'done', op: ops.length - 1, booked: booked.map(x => [...x]), result: results, activeLine: 6, pythonLine: 9, message: `Results: [${results.join(', ')}].` })
  return { input: ops, result: results, frames }
}

export const code = `set booked to an empty list of intervals, and results to an empty list
for each booking [s, e] in order
  find a booked interval [bs, be] where s is less than be and bs is less than e
  if such an interval exists, append false to results and reject the booking
  otherwise add [s, e] to booked and append true to results
return results`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def my_calendar(bookings):
    booked, results = [], []
    for s, e in bookings:
        if any(s < be and bs < e for bs, be in booked):
            results.append(False)
        else:
            booked.append((s, e))
            results.append(True)
    return results`
