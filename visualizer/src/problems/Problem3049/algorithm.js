import { TracedHeap } from '../../components/shared/heapModel.js'

export const phases = [
  { id: 'start', label: 'Start', description: 'Find the first second each positive index can be reset.' },
  { id: 'probe', label: 'Candidate', description: 'Binary search picks a deadline t to test.' },
  { id: 'scan', label: 'Scan', description: 'Walk the seconds backward from t.' },
  { id: 'free', label: 'Free', description: 'This second is not a useful reset, so it is free for other work.' },
  { id: 'reset', label: 'Try reset', description: 'Earliest reset of an index: try using it.' },
  { id: 'claim', label: 'Reserve', description: 'A later free second is reserved to mark the reset index.' },
  { id: 'undo', label: 'Undo', description: 'No later free second: give up the smallest reset.' },
  { id: 'verdict', label: 'Verdict', description: 'Do the free seconds cover the remaining work?' },
  { id: 'narrow', label: 'Narrow', description: 'Halve the range of deadlines.' },
  { id: 'done', label: 'Result', description: 'Report the earliest deadline, with a schedule that meets it.' },
]

const MAX_N = 8
const MAX_M = 16

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and changeIndices.')
  const { nums, changeIndices } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > MAX_N) throw new Error(`nums has 1 to ${MAX_N} entries here.`)
  if (!nums.every(v => Number.isInteger(v) && v >= 0 && v <= 1e9)) throw new Error('Each entry of nums is an integer from 0 to 10^9.')
  if (!Array.isArray(changeIndices) || changeIndices.length < 1 || changeIndices.length > MAX_M) throw new Error(`changeIndices has 1 to ${MAX_M} entries here.`)
  if (!changeIndices.every(i => Number.isInteger(i) && i >= 1 && i <= nums.length)) throw new Error('Each entry of changeIndices is an index from 1 to the length of nums.')
  return { nums, changeIndices }
}

export const code = `earliest deadline that lets every index be marked
  note the first second each positive index can be reset
  set total to the sum of nums plus n, the cost with no resets
  set low to 1 and high to m + 1
  while low is below high
    let t be the midpoint and test whether t is enough
      empty the heap of chosen resets and set free to 0
      for s from t down to 1
        if s is not the first reset chance of its index
          add 1 to free
        otherwise push the index's value on the heap
          if free is positive, reserve one free second for its mark
          otherwise pop the smallest reset and add 1 to free
      t is enough when total minus the saved work fits in free
    if t is enough, set high to t, else set low to t + 1
  return -1 if low passed m, otherwise low`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Pseudocode line missing: ${s}`)
  return index + 1
}

export const python = `import heapq

def earliest_second(nums, change_indices):
    n, m = len(nums), len(change_indices)
    first = {}
    for s, i in enumerate(change_indices, 1):
        if nums[i - 1] > 0:
            first.setdefault(i, s)
    total = sum(nums) + n

    def can_finish(t):
        heap = []
        free = 0
        for s in range(t, 0, -1):
            i = change_indices[s - 1]
            if first.get(i) != s:
                free += 1
                continue
            heapq.heappush(heap, nums[i - 1])
            if free > 0:
                free -= 1
            else:
                heapq.heappop(heap)
                free += 1
        saved = sum(x + 1 for x in heap)
        return total - saved <= free

    low, high = 1, m + 1
    while low < high:
        mid = (low + high) // 2
        if can_finish(mid):
            high = mid
        else:
            low = mid + 1
    return -1 if low > m else low
`

/** A concrete legal schedule for deadline t, given the resets the check kept. Other work goes first, marks of reset indices last. */
export function buildPlan(nums, changeIndices, t, resetIndices) {
  const current = nums.slice()
  const chosen = new Set(resetIndices)
  const seenReset = new Set()
  const marked = new Set()
  const others = nums.map((_, i) => i + 1).filter(i => !chosen.has(i))
  const ready = []
  const plan = []
  for (let s = 1; s <= t; s++) {
    const i = changeIndices[s - 1]
    if (chosen.has(i) && !seenReset.has(i)) {
      seenReset.add(i)
      current[i - 1] = 0
      ready.push(i)
      plan.push({ second: s, action: 'reset', index: i })
      continue
    }
    const pending = others.find(j => !marked.has(j))
    if (pending !== undefined) {
      if (current[pending - 1] > 0) {
        current[pending - 1]--
        plan.push({ second: s, action: 'decrement', index: pending })
      } else {
        marked.add(pending)
        plan.push({ second: s, action: 'mark', index: pending })
      }
    } else if (ready.length) {
      const j = ready.shift()
      marked.add(j)
      plan.push({ second: s, action: 'mark', index: j })
    } else {
      plan.push({ second: s, action: 'idle', index: null })
    }
  }
  return plan
}

export function buildTrace({ nums, changeIndices }) {
  const n = nums.length
  const m = changeIndices.length
  const first = new Map()
  changeIndices.forEach((i, at) => { if (nums[i - 1] > 0 && !first.has(i)) first.set(i, at + 1) })
  const total = nums.reduce((sum, v) => sum + v, 0) + n
  const firstList = [...first.entries()].sort((a, b) => a[0] - b[0])
  const makeHeap = () => new TracedHeap((a, b) => a[0] - b[0] || a[1] - b[1], { format: ([v, i]) => `${v}@${i}` })

  const frames = []
  let low = 1
  let high = m + 1
  const base = () => ({ low, high, probe: null, verdict: null, t: null, s: null, roles: Array(m).fill('idle'), heap: { items: [], ops: [] }, free: 0, saved: 0, needed: total, kept: [], plan: null })
  const push = (phase, activeLine, pythonLine, message, state) => frames.push({ phase, activeLine, pythonLine, message, firstList, total, ...base(), ...state })

  function check(t, emit) {
    const heap = makeHeap()
    let free = 0
    const roles = Array.from({ length: m }, (_, at) => (at < t ? 'todo' : 'later'))
    const snap = s => {
      const items = heap.data.map(heap.format)
      const saved = heap.data.reduce((sum, [v]) => sum + v + 1, 0)
      return { t, probe: null, s, roles: roles.slice(), heap: { items, ops: heap.takeOps() }, free, saved, needed: total - saved, kept: heap.data.map(([, i]) => i) }
    }
    emit?.('probe', L('let t be'), 30, `Test deadline t = ${t}: scan seconds ${t} down to 1, so that free always counts seconds after the one being looked at.`, snap(null))
    for (let s = t; s >= 1; s--) {
      const i = changeIndices[s - 1]
      emit?.('scan', L('for s from'), 15, `Second ${s} can reset only index ${i}.`, snap(s))
      if (first.get(i) !== s) {
        roles[s - 1] = 'free'
        free++
        const why = nums[i - 1] === 0 ? `Index ${i} already holds 0, so a reset gives nothing` : `Index ${i} can be reset sooner, at second ${first.get(i)}, leaving more time for its mark`
        emit?.('free', L('add 1 to free'), 17, `${why}. Second ${s} is free, so free = ${free}.`, snap(s))
        continue
      }
      heap.push([nums[i - 1], i])
      roles[s - 1] = 'reset'
      emit?.('reset', L('otherwise push'), 19, `Second ${s} is the first chance to reset index ${i}. A reset replaces ${nums[i - 1]} decrements, so try it and put ${nums[i - 1]} on the heap.`, snap(s))
      if (free > 0) {
        free--
        emit?.('claim', L('if free is positive'), 21, `The mark for index ${i} must come after this reset, so reserve one later free second. free = ${free}.`, snap(s))
      } else {
        const [value, dropped] = heap.pop()
        roles[first.get(dropped) - 1] = 'undone'
        free++
        emit?.('undo', L('otherwise pop'), 23, dropped === i
          ? `No later second is free to mark index ${i}, and its ${value} is the smallest saving, so index ${i} goes back to decrements. Second ${s} is free, so free = ${free}.`
          : `No later second is free to mark index ${i}. Give up the smallest saving instead: index ${dropped} with ${value} returns to decrements, its reset at second ${first.get(dropped)} and its reserved mark are released. Index ${i} takes the mark, leaving free = ${free}.`, snap(s))
      }
    }
    const state = snap(null)
    return { ok: state.needed <= free, state, free, kept: state.kept }
  }

  push('start', L('set total'), 9, firstList.length
    ? `With no resets at all, the work is ${total} seconds: every decrement and one mark per index. The earliest reset chances are shown below each index.`
    : `With no resets at all, the work is ${total} seconds: every decrement and one mark per index. No positive index can ever be reset.`, {})
  push('start', L('set low to 1'), 28, `Search the deadlines 1 to ${m}. High starts at ${m + 1}, one past the end, which stands for impossible.`, {})
  while (low < high) {
    const mid = Math.floor((low + high) / 2)
    const { ok, state, free } = check(mid, (phase, line, py, message, st) => push(phase, line, py, message, st))
    push('verdict', L('t is enough when'), 26, ok
      ? `${state.needed} seconds of decrements and marks remain and ${free} are free, so deadline ${mid} works.`
      : `${state.needed} seconds of decrements and marks remain but only ${free} are free, so deadline ${mid} is too soon.`, { ...state, probe: mid, verdict: ok })
    if (ok) high = mid
    else low = mid + 1
    push('narrow', L('if t is enough'), ok ? 32 : 34, ok
      ? `More time never hurts, so everything later works too. Look for something earlier: high = ${mid}.`
      : `Less time cannot help, so everything earlier fails too. Look later: low = ${mid + 1}.`, { ...state, probe: mid, verdict: ok, heap: { items: state.heap.items, ops: [] } })
  }
  const result = low > m ? -1 : low
  let plan = null
  if (result !== -1) plan = buildPlan(nums, changeIndices, result, check(result).kept)
  push('done', L('return -1'), 35, result === -1
    ? `Even all ${m} seconds are not enough, so return -1.`
    : `The earliest workable deadline is second ${result}. The schedule below shows one way to meet it.`, { plan })
  return { input: { nums, changeIndices }, result, frames }
}
