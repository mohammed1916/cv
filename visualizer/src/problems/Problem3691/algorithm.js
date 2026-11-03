// Teaching model derived from general heap and greedy knowledge; not verified against the official statement.
const MAX_LENGTH = 8
const MAX_K = 20

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and k.')
  const { nums, k } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > MAX_LENGTH || !nums.every(v => Number.isInteger(v) && v >= 0)) {
    throw new Error(`nums has 1 to ${MAX_LENGTH} non-negative integers in this visual.`)
  }
  const limit = Math.min(MAX_K, nums.length * (nums.length + 1) / 2)
  if (!Number.isInteger(k) || k < 1 || k > limit) throw new Error(`k is an integer from 1 to ${limit}.`)
  return { nums, k }
}

function spread(nums, l, r) {
  let hi = nums[l], lo = nums[l]
  for (let i = l + 1; i <= r; i++) { hi = Math.max(hi, nums[i]); lo = Math.min(lo, nums[i]) }
  return hi - lo
}

export function buildTrace({ nums, k }) {
  const n = nums.length
  // Each left end l gives a chain of subarrays [l..r]; shrinking r never raises the spread.
  let heap = Array.from({ length: n }, (_, l) => ({ l, r: n - 1, value: spread(nums, l, n - 1) }))
  const better = (a, b) => (a.value !== b.value ? a.value > b.value : a.l < b.l)
  const takeTop = () => {
    let best = 0
    for (let i = 1; i < heap.length; i++) if (better(heap[i], heap[best])) best = i
    return heap.splice(best, 1)[0]
  }
  const snapshot = () => heap.slice().sort((a, b) => (better(a, b) ? -1 : 1)).map(e => ({ ...e }))
  const frames = []
  const chosen = []
  let total = 0
  frames.push({ pythonLine: 8, phase: 'start', activeLine: L('max heap'), chosen: [], candidates: snapshot(), total: 0, at: -1, ok: null, message: `Each left end contributes its widest subarray: ${n} candidate${n === 1 ? '' : 's'}.` })
  for (let step = 0; step < k; step++) {
    const top = takeTop()
    total += top.value
    chosen.push({ ...top })
    frames.push({ pythonLine: 13, phase: 'take', activeLine: L('pop the largest'), chosen: chosen.map(e => ({ ...e })), candidates: snapshot(), total, at: top.l, ok: null, message: `Take [${top.l}..${top.r}] with value ${top.value}; running total ${total}.` })
    if (top.r - 1 >= top.l) {
      const shorter = { l: top.l, r: top.r - 1, value: spread(nums, top.l, top.r - 1) }
      heap.push(shorter)
      frames.push({ pythonLine: 15, phase: 'push', activeLine: L('shrink on the right'), chosen: chosen.map(e => ({ ...e })), candidates: snapshot(), total, at: top.l, ok: null, message: `Push the next shorter subarray [${shorter.l}..${shorter.r}] with value ${shorter.value}.` })
    }
  }
  frames.push({ pythonLine: 16, phase: 'done', activeLine: L('return the total'), chosen: chosen.map(e => ({ ...e })), candidates: snapshot(), total, at: -1, ok: true, message: `Maximum total value for ${k} subarray${k === 1 ? '' : 's'}: ${total}.` })
  return { input: { nums, k }, result: total, frames }
}

export const code = `maximum total value of k distinct subarrays
  for each left index l, the best right end is n minus one
  push (value of [l..n-1], l, n-1) for every l into a max heap
  repeat k times
    pop the largest value and add it to the total
    if the subarray can shrink on the right then push the shorter one
  return the total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `import heapq

def max_total_value(nums, k):
    n = len(nums)
    def value(l, r):
        window = nums[l:r + 1]
        return max(window) - min(window)
    heap = [(-value(l, n - 1), l, n - 1) for l in range(n)]
    heapq.heapify(heap)
    total = 0
    for _ in range(k):
        neg, l, r = heapq.heappop(heap)
        total += -neg
        if r - 1 >= l:
            heapq.heappush(heap, (-value(l, r - 1), l, r - 1))
    return total
`
