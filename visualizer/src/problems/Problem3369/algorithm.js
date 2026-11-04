const NAMES = ['addNumber', 'removeFirstAddedNumber', 'getMean', 'getMedian', 'getMode']

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with calls.')
  const { calls } = input
  if (!Array.isArray(calls) || calls.length < 1 || calls.length > 30) throw new Error('calls has 1 to 30 entries.')
  let size = 0
  calls.forEach((call, index) => {
    if (!Array.isArray(call) || !NAMES.includes(call[0])) throw new Error(`Call ${index} must name one of ${NAMES.join(', ')}.`)
    if (call[0] === 'addNumber') {
      if (call.length !== 2 || !Number.isInteger(call[1]) || call[1] < 1 || call[1] > 1e9) throw new Error(`Call ${index}: addNumber takes one integer from 1 to 1000000000.`)
      size++
      return
    }
    if (call.length !== 1) throw new Error(`Call ${index}: ${call[0]} takes no argument.`)
    if (size === 0) throw new Error(`Call ${index}: ${call[0]} needs at least one number in the tracker.`)
    if (call[0] === 'removeFirstAddedNumber') size--
  })
  return { calls }
}

const upperBound = (list, value) => {
  let lo = 0, hi = list.length
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (list[mid] <= value) lo = mid + 1
    else hi = mid
  }
  return lo
}
const rankedOrder = (a, b) => b.count - a.count || a.value - b.value

export function buildTrace({ calls }) {
  const frames = []
  const queue = []
  const sorted = []
  const count = new Map()
  let ranked = []
  let total = 0
  const ops = calls.map(([name, ...args]) => ({ name, args }))
  const result = []
  const push = (phase, lineKey, pyKey, message, extra = {}) => frames.push({
    phase, activeLine: L(lineKey), pythonLine: P(pyKey), message,
    queue: [...queue], sorted: [...sorted], ranked: ranked.map(r => ({ ...r })), total,
    ops: ops.map(o => ({ ...o })), op: -1, touched: {}, ...extra,
  })
  push('start', 'keep a queue', 'def __init__', 'Empty tracker. Every call below updates these four structures together.')
  calls.forEach(([name, value], op) => {
    if (name === 'addNumber') {
      queue.push(value)
      push('add', 'on add: append', 'self.queue.append(number)', `Add ${value} to the back of the queue so its age is remembered.`, { op, touched: { queue: queue.length - 1 } })
      total += value
      push('add', 'on add: add to the total', 'self.total += number', `Running total rises by ${value} to ${total}.`, { op, touched: { queue: queue.length - 1, total: true } })
      const at = upperBound(sorted, value)
      sorted.splice(at, 0, value)
      push('add', 'on add: insert into the sorted', 'self.sorted.add(number)', `Insert ${value} into sorted order at position ${at}.`, { op, touched: { sorted: at } })
      const next = (count.get(value) ?? 0) + 1
      count.set(value, next)
      ranked = ranked.filter(r => r.value !== value)
      ranked.push({ value, count: next })
      ranked.sort(rankedOrder)
      push('add', 'on add: raise', 'self.ranked.add((-(old + 1), number))', `${value} now appears ${next} time${next === 1 ? '' : 's'}; re-rank it. Top of the ranking is ${ranked[0].value}.`, { op, touched: { rankedValue: value } })
      result.push(null)
      ops[op].returned = null
    } else if (name === 'removeFirstAddedNumber') {
      const number = queue[0]
      push('remove', 'on remove: pop', 'number = self.queue.popleft()', `The oldest number is ${number}, at the front of the queue. Only that one may leave.`, { op, touched: { queue: 0, leaving: true } })
      queue.shift()
      total -= number
      push('remove', 'on remove: subtract', 'self.total -= number', `Running total falls by ${number} to ${total}.`, { op, touched: { total: true } })
      const at = sorted.indexOf(number)
      push('remove', 'on remove: delete it from the sorted', 'self.sorted.remove(number)', `Find one ${number} in sorted order at position ${at}.`, { op, touched: { sorted: at, leavingSorted: true } })
      sorted.splice(at, 1)
      const next = count.get(number) - 1
      ranked = ranked.filter(r => r.value !== number)
      if (next > 0) {
        count.set(number, next)
        ranked.push({ value: number, count: next })
        ranked.sort(rankedOrder)
      } else count.delete(number)
      push('remove', 'on remove: lower', next > 0 ? 'self.ranked.add((-(old - 1), number))' : 'self.count[number] = old - 1',
        next > 0 ? `${number} now appears ${next} time${next === 1 ? '' : 's'}; re-rank it.` : `${number} is gone entirely, so it leaves the ranking.`, { op, touched: { rankedValue: number } })
      result.push(null)
      ops[op].returned = null
    } else if (name === 'getMean') {
      const mean = Math.floor(total / queue.length)
      ops[op].returned = mean
      result.push(mean)
      push('mean', 'mean is', 'return self.total // len(self.queue)', `Floor of ${total} ÷ ${queue.length} is ${mean}.`, { op, touched: { total: true, meanOf: queue.length } })
    } else if (name === 'getMedian') {
      const at = queue.length >> 1
      ops[op].returned = sorted[at]
      result.push(sorted[at])
      push('median', 'median is', 'return self.sorted[len(self.queue) // 2]',
        `${queue.length} numbers, so position ${queue.length} // 2 = ${at} holds ${sorted[at]}${queue.length % 2 === 0 ? ' (the larger of the two middle values)' : ''}.`, { op, touched: { median: at } })
    } else {
      const top = ranked[0]
      const tied = ranked.filter(r => r.count === top.count).length
      ops[op].returned = top.value
      result.push(top.value)
      push('mode', 'mode is', 'return self.ranked[0][1]',
        tied > 1 ? `${tied} values tie at ${top.count} appearances; the ranking puts the smallest, ${top.value}, first.` : `${top.value} leads with ${top.count} appearance${top.count === 1 ? '' : 's'}.`, { op, touched: { rankedValue: top.value } })
    }
  })
  push('done', 'report the answer', 'return self.ranked[0][1]', `All ${calls.length} calls finished.`, { op: calls.length - 1 })
  frames[frames.length - 1].pythonLine = frames.length > 1 ? frames[frames.length - 2].pythonLine : P('def __init__')
  return { input: { calls }, result, frames }
}

export const phases = [
  { id: 'start', label: 'Start', description: 'All structures empty.' },
  { id: 'add', label: 'Add', description: 'One add updates the queue, total, sorted order and ranking.' },
  { id: 'remove', label: 'Remove', description: 'The queue names the oldest number; the others then forget one copy of it.' },
  { id: 'mean', label: 'Mean', description: 'Total divided by count, floored.' },
  { id: 'median', label: 'Median', description: 'The sorted position count // 2.' },
  { id: 'mode', label: 'Mode', description: 'First entry in the ranking by count, then value.' },
  { id: 'done', label: 'Done', description: 'Every call has run.' },
]

export const code = `keep a queue in arrival order, a running total, a sorted list and a ranking by (highest count, smallest value)
on add: append the number to the queue
on add: add to the total
on add: insert into the sorted list
on add: raise its count and re-rank it
on remove: pop the queue front, which is the oldest number
on remove: subtract it from the total
on remove: delete it from the sorted list
on remove: lower its count and re-rank it, dropping it at zero
mean is the total divided by the count, floored
median is the sorted entry at position count // 2
mode is the first entry in the ranking
report the answer of each query`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `from collections import deque, defaultdict
from sortedcontainers import SortedList


class StatisticsTracker:
    def __init__(self):
        self.queue = deque()
        self.total = 0
        self.count = defaultdict(int)
        self.sorted = SortedList()
        self.ranked = SortedList()

    def addNumber(self, number):
        self.queue.append(number)
        self.total += number
        self.sorted.add(number)
        old = self.count[number]
        if old:
            self.ranked.remove((-old, number))
        self.count[number] = old + 1
        self.ranked.add((-(old + 1), number))

    def removeFirstAddedNumber(self):
        number = self.queue.popleft()
        self.total -= number
        self.sorted.remove(number)
        old = self.count[number]
        self.ranked.remove((-old, number))
        self.count[number] = old - 1
        if old > 1:
            self.ranked.add((-(old - 1), number))

    def getMean(self):
        return self.total // len(self.queue)

    def getMedian(self):
        return self.sorted[len(self.queue) // 2]

    def getMode(self):
        return self.ranked[0][1]
`

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Pseudocode line missing: ${s}`)
  return index + 1
}
const P = s => {
  const index = python.split('\n').findIndex(t => t.includes(s))
  if (index < 0) throw new Error(`Python line missing: ${s}`)
  return index + 1
}
