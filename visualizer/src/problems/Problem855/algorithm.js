export function parseInput(text) {
  const v = JSON.parse(text)
  if (!v || typeof v !== 'object' || Array.isArray(v)) throw new Error('Enter {"n": seats, "ops": [["seat"], ["leave", p], ...]}.')
  const { n, ops } = v
  if (!Number.isInteger(n) || n < 1 || n > 40) throw new Error('n must be an integer from 1 to 40 (visualization cap).')
  if (!Array.isArray(ops) || !ops.length || ops.length > 40) throw new Error('ops must contain 1 to 40 operations.')
  const clean = ops.map((op, k) => {
    if (!Array.isArray(op) || (op[0] !== 'seat' && op[0] !== 'leave')) throw new Error(`Operation ${k} must be ["seat"] or ["leave", p].`)
    if (op[0] === 'seat') {
      if (op.length !== 1) throw new Error(`Operation ${k}: seat takes no argument.`)
      return { op: 'seat' }
    }
    if (op.length !== 2 || !Number.isInteger(op[1]) || op[1] < 0 || op[1] >= n) throw new Error(`Operation ${k}: leave needs a seat index in 0..${n - 1}.`)
    return { op: 'leave', p: op[1] }
  })
  // validate by simulating with the same rule (a leaving student must be seated)
  const room = []
  for (const [k, o] of clean.entries()) {
    if (o.op === 'seat') { if (room.length >= n) throw new Error(`Operation ${k}: the room is already full.`); room.push(pickSeat(n, room.slice().sort((a, b) => a - b)).seat); }
    else { const idx = room.indexOf(o.p); if (idx < 0) throw new Error(`Operation ${k}: seat ${o.p} is empty, nobody can leave.`); room.splice(idx, 1) }
  }
  return { n, ops: clean.map(o => (o.op === 'seat' ? ['seat'] : ['leave', o.p])) }
}

function pickSeat(n, students) {
  if (!students.length) return { seat: 0 }
  let best = students[0], seat = 0
  for (let k = 0; k + 1 < students.length; k++) {
    const a = students[k], b = students[k + 1], d = Math.floor((b - a) / 2)
    if (d > best) { best = d; seat = a + d }
  }
  if (n - 1 - students[students.length - 1] > best) seat = n - 1
  return { seat }
}

export function buildTrace({ n, ops }) {
  const frames = []
  const students = []
  const returned = []
  const base = (extra) => ({ students: students.slice(), opIndex: -1, returned: returned.slice(), cand: null, best: null, bestSeat: null, ...extra })
  frames.push(base({ phase: 'start', activeLine: 2, message: `Empty room with ${n} seats (0..${n - 1}). Keep the occupied seats in a sorted list.` }))
  ops.forEach((op, k) => {
    if (op[0] === 'leave') {
      students.splice(students.indexOf(op[1]), 1)
      returned.push(null)
      frames.push(base({ phase: 'leave', activeLine: 5, opIndex: k, message: `Student leaves seat ${op[1]}; remove it from the sorted list. Gaps on both sides merge.` }))
      return
    }
    if (!students.length) {
      students.push(0); returned.push(0)
      frames.push(base({ phase: 'seat', activeLine: 7, opIndex: k, cand: { seat: 0, dist: 0 }, bestSeat: 0, message: 'Empty room: every seat is equally far from nobody, so take seat 0.' }))
      return
    }
    let best = students[0], seat = 0
    frames.push(base({ phase: 'candidate', activeLine: 9, opIndex: k, best, bestSeat: seat, cand: { seat: 0, dist: students[0] }, message: `Seat 0 is ${students[0]} away from the first student. Best so far: seat 0, distance ${best}.` }))
    for (let i = 0; i + 1 < students.length; i++) {
      const a = students[i], b = students[i + 1], d = Math.floor((b - a) / 2)
      const better = d > best
      if (better) { best = d; seat = a + d }
      frames.push(base({ phase: 'candidate', activeLine: better ? 13 : 12, opIndex: k, best, bestSeat: seat, cand: { seat: a + d, dist: d },
        message: `Gap between ${a} and ${b}: the middle seat ${a + d} is ${d} from both. ${better ? 'Strictly better, so it becomes the best.' : 'Not strictly better; ties keep the lower seat.'}` }))
    }
    const last = students[students.length - 1]
    const ed = n - 1 - last
    const better = ed > best
    if (better) { best = ed; seat = n - 1 }
    frames.push(base({ phase: 'candidate', activeLine: 14, opIndex: k, best, bestSeat: seat, cand: { seat: n - 1, dist: ed },
      message: `Last seat ${n - 1} is ${ed} from the final student. ${better ? 'Strictly better, so take it.' : 'Not strictly better.'}` }))
    students.push(seat); students.sort((x, y) => x - y); returned.push(seat)
    frames.push(base({ phase: 'seat', activeLine: 15, opIndex: k, best, bestSeat: seat, cand: { seat, dist: best }, message: `Seat the student at ${seat} (distance ${best} to the nearest neighbour) and insert it in sorted order.` }))
  })
  frames.push(base({ phase: 'done', activeLine: 16, opIndex: ops.length - 1, message: `All operations done. Returned values: ${JSON.stringify(returned)}.` }))
  return { input: { n, ops }, result: returned, frames }
}

export const code = `function examRoom(n, ops)
  set students to an empty sorted list and out to an empty list
  for each operation op in ops, in order
    if op is "leave p" then
      remove seat p from students, append null to out, and go to the next operation
    otherwise, if students is empty then
      choose seat 0 for the new student
    otherwise
      set best to the distance from seat 0 to the first student, and seat to 0
      for each adjacent pair of students a and b, left to right
        let d be (b - a) // 2, the distance from the middle of the gap
        if d is not greater than best then keep the current seat
        otherwise set best to d and seat to a + d
      if seat n - 1 is farther than best from the last student then set seat to n - 1
    for a seat operation, insert seat into students in sorted order and append seat to out
  return out`.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = `import bisect

def exam_room(n, ops):
    students = []
    out = []
    for op in ops:
        if op[0] == 'leave':
            students.remove(op[1])
            out.append(None)
            continue
        if not students:
            seat = 0
        else:
            best, seat = students[0], 0
            for a, b in zip(students, students[1:]):
                d = (b - a) // 2
                if d > best:
                    best, seat = d, a + d
            if n - 1 - students[-1] > best:
                seat = n - 1
        bisect.insort(students, seat)
        out.append(seat)
    return out
`
