import { SegTree } from '../../components/shared/segtreeModel.js'

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Enter an object with n, m and ops.')
  const { n, m, ops } = input
  if (!Number.isInteger(n) || n < 1 || n > 4) throw new Error('n is an integer from 1 to 4 (rows).')
  if (!Number.isInteger(m) || m < 1 || m > 6) throw new Error('m is an integer from 1 to 6 (seats per row).')
  if (!Array.isArray(ops) || ops.length < 1 || ops.length > 8) throw new Error('Enter 1 to 8 operations.')
  for (const op of ops) {
    if (!Array.isArray(op) || op.length !== 3 || !Number.isInteger(op[1]) || !Number.isInteger(op[2])) throw new Error('Each operation is ["gather" or "scatter", k, maxRow].')
    if (op[2] < 0 || op[2] > n - 1) throw new Error('maxRow is between 0 and n - 1.')
    if (op[0] === 'gather' && (op[1] < 1 || op[1] > m)) throw new Error('gather needs 1 <= k <= m.')
    else if (op[0] === 'scatter' && (op[1] < 1 || op[1] > n * m)) throw new Error('scatter needs 1 <= k <= n * m.')
    else if (op[0] !== 'gather' && op[0] !== 'scatter') throw new Error('Operation names are "gather" and "scatter".')
  }
  return { n, m, ops }
}

const longestRun = row => {
  let best = 0, cur = 0
  for (const taken of row) { cur = taken ? 0 : cur + 1; best = Math.max(best, cur) }
  return best
}

export function buildTrace({ n, m, ops }) {
  const seats = Array.from({ length: n }, () => Array(m).fill(false))
  const freeTree = new SegTree(n, 'sum-add', Array(n).fill(m))
  const runTree = new SegTree(n, 'max-assign', Array(n).fill(m))
  const answers = []
  const snap = title => ({ ...runTree.snapshot(), title })
  const frames = [{ phase: 'start', op: null, result: null, seats: seats.map(r => r.slice()), seg: snap('Longest free run per row'), activeLine: L('set row runs to m'), message: `${n} rows of ${m} empty seats.` }]
  ops.forEach((op, i) => {
    const [name, k, maxRow] = op
    if (name === 'gather') {
      if (runTree.query(0, maxRow) < k) {
        answers.push([])
        frames.push({ phase: 'reject', op: i, result: [], seats: seats.map(r => r.slice()), seg: snap('Gather fails'), activeLine: L('no row up to maxRow'), message: `gather(${k}, ${maxRow}): no row has ${k} seats in a row, so nothing is booked.` })
        return
      }
      let lo = 0, hi = maxRow
      while (lo < hi) {
        const mid = (lo + hi) >> 1
        if (runTree.query(0, mid) >= k) hi = mid
        else lo = mid + 1
      }
      const row = lo
      let start = 0
      while (!seats[row].slice(start, start + k).every(t => !t)) start++
      for (let c = start; c < start + k; c++) seats[row][c] = true
      freeTree.update(row, row, -k)
      runTree.update(row, row, longestRun(seats[row]))
      answers.push([row, start])
      frames.push({ phase: 'gather', op: i, result: [row, start], seats: seats.map(r => r.slice()), seg: snap(`Gather booked row ${row}`), activeLine: L('append [row, start]'), message: `gather(${k}, ${maxRow}): row ${row}, seats ${start} to ${start + k - 1}.` })
      return
    }
    if (freeTree.query(0, maxRow) < k) {
      answers.push(false)
      frames.push({ phase: 'reject', op: i, result: false, seats: seats.map(r => r.slice()), seg: snap('Scatter fails'), activeLine: L('append false'), message: `scatter(${k}, ${maxRow}): fewer than ${k} free seats, so nothing is booked.` })
      return
    }
    let remaining = k
    for (let r = 0; r <= maxRow && remaining > 0; r++) {
      let taken = 0
      for (let c = 0; c < m && remaining > 0; c++) {
        if (!seats[r][c]) { seats[r][c] = true; taken++; remaining-- }
      }
      if (taken > 0) {
        freeTree.update(r, r, -taken)
        runTree.update(r, r, longestRun(seats[r]))
      }
    }
    answers.push(true)
    frames.push({ phase: 'scatter', op: i, result: true, seats: seats.map(r => r.slice()), seg: snap(`Scatter booked ${k} seats`), activeLine: L('fill from the smallest row'), message: `scatter(${k}, ${maxRow}): the seats are taken from the smallest rows first.` })
  })
  frames.push({ phase: 'done', op: null, result: null, seats: seats.map(r => r.slice()), seg: snap('Final rows'), activeLine: L('return answers'), message: `Answers: ${JSON.stringify(answers)}.` })
  return { input: { n, m, ops }, result: answers, frames }
}

export const code = `seat bookings with a row tree of longest free runs and a row tree of free counts
  set row runs to m for each row, and free counts to m for each row
  set answers to an empty list
  for each operation in order
    if the operation is gather(k, maxRow) then
      if no row up to maxRow has a run of at least k then append []
      otherwise find the first row up to maxRow whose longest run is at least k
        take the leftmost k consecutive free seats in that row, update the trees, append [row, start]
    otherwise scatter(k, maxRow): if fewer than k seats are free up to maxRow then append false
      otherwise fill from the smallest row, update the trees, and append true
  return answers`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def book_my_show(n, m, ops):
    seats = [[False] * m for _ in range(n)]

    def longest(row):
        best = cur = 0
        for taken in row:
            cur = 0 if taken else cur + 1
            best = max(best, cur)
        return best

    answers = []
    for name, k, max_row in ops:
        if name == 'gather':
            row = next((r for r in range(max_row + 1) if longest(seats[r]) >= k), None)
            if row is None:
                answers.append([])
                continue
            start = next(s for s in range(m - k + 1) if not any(seats[row][s:s + k]))
            for c in range(start, start + k):
                seats[row][c] = True
            answers.append([row, start])
        else:
            free = sum(1 for r in range(max_row + 1) for c in range(m) if not seats[r][c])
            if free < k:
                answers.append(False)
                continue
            remaining = k
            for r in range(max_row + 1):
                for c in range(m):
                    if remaining == 0:
                        break
                    if not seats[r][c]:
                        seats[r][c] = True
                        remaining -= 1
            answers.append(True)
    return answers
`
