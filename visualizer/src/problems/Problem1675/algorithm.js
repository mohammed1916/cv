export function parseInput(text) {
  const data = JSON.parse(text)
  const { nums } = data ?? {}
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 8) throw new Error('Use "nums" as an array of 2 to 8 numbers.')
  if (nums.some(x => !Number.isInteger(x) || x < 1 || x > 20)) throw new Error('Each number is an integer from 1 to 20.')
  return { nums }
}

export function buildTrace({ nums }) {
  const values = nums.map(x => (x % 2 ? x * 2 : x))
  let best = Infinity
  const frames = [{ phase: 'start', activeLine: L('double every odd number'), values: [...values], picked: -1, best, message: 'Double every odd number, so each value can now only be halved.' }]
  for (;;) {
    let at = 0
    for (let i = 1; i < values.length; i++) if (values[i] > values[at]) at = i
    const top = values[at]
    const low = Math.min(...values)
    best = Math.min(best, top - low)
    frames.push({ phase: 'measure', activeLine: L('record the largest minus the smallest'), values: [...values], picked: at, best, message: `Largest ${top}, smallest ${low}, deviation ${top - low}. Best so far ${best}.` })
    if (top % 2) break
    values[at] = top / 2
    frames.push({ phase: 'halve', activeLine: L('halve the largest'), values: [...values], picked: at, best, message: `Halve ${top} to ${top / 2}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return best'), values: [...values], picked: -1, best, message: `Minimum deviation: ${best}.` })
  return { input: { nums }, result: best, frames }
}

export const code = `minimize the deviation of nums, where deviation is largest minus smallest
  double every odd number, so each value can only be halved from here
  repeat
    find the largest value and record the largest minus the smallest as a candidate
    if the largest value is odd then stop
    halve the largest value
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `import heapq

def minimize_deviation(nums):
    heap = []
    smallest = float('inf')
    for x in nums:
        v = x * 2 if x % 2 else x
        heapq.heappush(heap, -v)
        smallest = min(smallest, v)
    best = float('inf')
    while True:
        top = -heap[0]
        best = min(best, top - smallest)
        if top % 2:
            break
        heapq.heappop(heap)
        heapq.heappush(heap, -(top // 2))
        smallest = min(smallest, top // 2)
    return best
`
