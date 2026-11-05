export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 50000 || nums.some(v => !Number.isInteger(v) || v < 0 || v > 49999)) throw new Error('Enter a JSON array of 1–50,000 integers from 0 to 49,999.')
  return nums
}

// The degree is the largest frequency. Among values reaching it, the shortest span from first to last
// occurrence is the answer: the subarray that holds all copies of one value.
export function buildTrace(nums) {
  const info = new Map()
  const frames = [{ phase: 'start', index: null, info: [], degree: null, best: null, activeLine: L('const info = new Map()'), pythonLine: P('info = {}'), message: 'Record the count, first index and last index of every value.' }]
  nums.forEach((v, i) => {
    const entry = info.get(v)
    if (entry) { entry.count++; entry.last = i } else info.set(v, { value: v, count: 1, first: i, last: i })
    frames.push({ phase: 'record', index: i, info: [...info.values()].map(e => ({ ...e })), degree: null, best: null, activeLine: L('info.set(v'), pythonLine: P('info[v]'), message: `Index ${i} holds ${v}: its count is now ${info.get(v).count}.` })
  })
  const degree = Math.max(...[...info.values()].map(e => e.count))
  let best = Infinity
  for (const e of info.values()) {
    if (e.count === degree) best = Math.min(best, e.last - e.first + 1)
  }
  frames.push({ phase: 'done', index: null, info: [...info.values()].map(e => ({ ...e })), degree, best, result: best, activeLine: L('return best'), pythonLine: P('return best'), message: `Degree ${degree}; shortest span ${best}.` })
  return { input: nums, result: best, frames }
}

const SOURCE = `function findShortestSubArray(nums) {
  const info = new Map()
  nums.forEach((v, i) => {
    const entry = info.get(v)
    if (entry) {
      entry.count++
      entry.last = i
    } else {
      info.set(v, { count: 1, first: i, last: i })
    }
  })
  const degree = Math.max(...[...info.values()].map(e => e.count))
  let best = Infinity
  for (const e of info.values()) {
    if (e.count === degree) best = Math.min(best, e.last - e.first + 1)
  }
  return best
}`
export const code = SOURCE.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def find_shortest_sub_array(nums):
    info = {}
    for i, v in enumerate(nums):
        if v in info:
            info[v][0] += 1
            info[v][2] = i
        else:
            info[v] = [1, i, i]
    degree = max(entry[0] for entry in info.values())
    best = min(entry[2] - entry[1] + 1 for entry in info.values() if entry[0] == degree)
    return best`
const P = s => python.split('\n').findIndex(t => t.includes(s)) + 1
