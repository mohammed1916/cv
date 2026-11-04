const L = s => {
  const line = code.findIndex(c => c.text.includes(s)) + 1
  if (line < 1) throw new Error(`Missing pseudocode line: ${s}`)
  return line
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and queries.')
  const { nums, queries } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 10 || !nums.every(v => Number.isInteger(v) && v >= 1 && v <= 99)) {
    throw new Error('nums has 1 to 10 integers from 1 to 99.')
  }
  if (!Array.isArray(queries) || queries.length > 8) throw new Error('queries has at most 8 pairs.')
  for (const q of queries) {
    if (!Array.isArray(q) || q.length !== 2 || !Number.isInteger(q[0]) || q[0] < 0 || q[0] > 60 || !Number.isInteger(q[1]) || q[1] < 0 || q[1] > 9) {
      throw new Error('Each query is [time, index] with time from 0 to 60 and index from 0 to 9.')
    }
  }
  return { nums, queries }
}

// The array at second p of the cycle: removals take the front, restores append in original order.
function snapshot(nums, p) {
  const n = nums.length
  const cells = nums.map((v, i) => ({ v, i }))
  return p < n ? cells.slice(p) : cells.slice(0, p - n)
}

export function buildTrace({ nums, queries }) {
  const n = nums.length
  const cycle = 2 * n
  const frames = []
  frames.push({ pythonLine: 3, phase: 'start', activeLine: L('const cycle'), time: 0, cycle, present: snapshot(nums, 0), queryIndex: -1, queryTime: -1, answer: null, message: `Start with nums. One full cycle is ${cycle} seconds.` })
  for (let p = 1; p < cycle; p++) {
    const removing = p < n
    const phase = p === n ? 'empty' : removing ? 'remove' : 'restore'
    const left = snapshot(nums, p).length
    const message = p === n
      ? `Second ${p}: every element has been removed, so the array is empty.`
      : removing
        ? `Second ${p}: the leftmost ${p} element${p === 1 ? ' is' : 's are'} gone, ${left} remain.`
        : `Second ${p}: ${p - n} element${p - n === 1 ? ' is' : 's are'} restored, ${left} now in the array.`
    frames.push({ pythonLine: removing ? 8 : 10, phase, activeLine: L(removing ? 'p < n ?' : 'nums.slice(0, p - n)'), time: p, cycle, present: snapshot(nums, p), queryIndex: -1, queryTime: -1, answer: null, message })
  }
  const answers = []
  for (const [t, i] of queries) {
    const p = t % cycle
    const arr = snapshot(nums, p)
    frames.push({ pythonLine: 6, phase: 'query', activeLine: L('const p = t % cycle'), time: p, cycle, present: arr, queryIndex: i, queryTime: t, answer: null, message: `Query [${t}, ${i}]: ${t} mod ${cycle} = ${p}, so read the array at second ${p}.` })
    const value = i < arr.length ? arr[i].v : -1
    answers.push(value)
    frames.push({ pythonLine: 11, phase: 'query', activeLine: L(i < arr.length ? 'i < arr.length' : ': -1'), time: p, cycle, present: arr, queryIndex: i, queryTime: t, answer: value, message: value === -1 ? `Index ${i} is past the end of a ${arr.length}-element array, so the answer is -1.` : `Index ${i} of that array holds ${value}.` })
  }
  frames.push({ pythonLine: 12, phase: 'done', activeLine: L('return answers'), time: -1, cycle, present: [], queryIndex: -1, queryTime: -1, answer: answers, message: `All ${queries.length} queries are answered.` })
  return { input: { nums, queries }, result: answers, frames }
}

export const code = `function elementsAfterRemoval(nums, queries) {
  const n = nums.length
  const cycle = 2 * n
  const answers = []
  for (const [t, i] of queries) {
    const p = t % cycle
    const arr = p < n ? nums.slice(p) : nums.slice(0, p - n)
    answers.push(i < arr.length ? arr[i] : -1)
  }
  return answers
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def element_at_times(nums, queries):
    n = len(nums)
    cycle = 2 * n
    answers = []
    for t, i in queries:
        p = t % cycle
        if p < n:
            arr = nums[p:]
        else:
            arr = nums[:p - n]
        answers.append(arr[i] if i < len(arr) else -1)
    return answers
`
