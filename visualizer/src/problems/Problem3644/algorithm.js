// Teaching model (knowledge-derived): try candidate k values from large to small and
// explore every arrangement reachable by trades where the bitwise AND of the traded pair equals k.
const lineOf = (lines, text) => lines.findIndex(line => line.includes(text)) + 1

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input) || !Array.isArray(input.nums)) throw new Error('Use an object with nums.')
  const { nums } = input
  const n = nums.length
  if (n < 1 || n > 7) throw new Error('nums has 1 to 7 values for the visualization.')
  if (!nums.every(Number.isInteger) || [...nums].sort((a, b) => a - b).some((v, i) => v !== i)) {
    throw new Error('nums must be a permutation of 0 to n minus 1.')
  }
  return { nums }
}

// Breadth-first search over arrangements; a trade is allowed when the bitwise AND of its pair is k.
function sortsWith(nums, k) {
  const goal = nums.map((_, i) => i).join(',')
  const seen = new Set([nums.join(',')])
  const queue = [nums]
  while (queue.length) {
    const current = queue.shift()
    if (current.join(',') === goal) return { ok: true, explored: seen.size }
    for (let i = 0; i < current.length; i++) {
      for (let j = i + 1; j < current.length; j++) {
        if ((current[i] & current[j]) !== k) continue
        const next = current.slice()
        ;[next[i], next[j]] = [next[j], next[i]]
        const key = next.join(',')
        if (!seen.has(key)) { seen.add(key); queue.push(next) }
      }
    }
  }
  return { ok: false, explored: seen.size }
}

export function buildTrace({ nums }) {
  const n = nums.length
  const sorted = nums.every((v, i) => v === i)
  const frames = []
  frames.push({ pythonLine: PL('if all('), phase: 'start', activeLine: L('already in order'), arrangement: nums, k: null, message: sorted ? 'The permutation is already sorted.' : 'Try candidate k values from the largest down.' })
  if (sorted) {
    frames.push({ pythonLine: PL('return 0'), phase: 'done', activeLine: L('already in order'), arrangement: nums, k: 0, answer: 0, message: 'Already sorted, so the answer is 0.' })
    return { input: { nums }, result: 0, frames }
  }
  let answer = null
  for (let k = n - 1; k >= 0 && answer === null; k--) {
    const { ok, explored } = sortsWith(nums, k)
    frames.push({ pythonLine: PL('for k in range'), phase: 'try', activeLine: L('for each candidate k'), arrangement: nums, k, explored, ok,
      message: `k = ${k}: ${ok ? 'the arrangement reaches sorted order' : 'sorting is unreachable'} (${explored} arrangements explored).` })
    if (ok) answer = k
  }
  const result = answer ?? 0
  frames.push({ pythonLine: PL('return k'), phase: 'done', activeLine: L('return k'), arrangement: nums, k: result, answer: result, message: answer === null ? 'No candidate sorts the array; reported 0.' : `The largest working k is ${result}.` })
  return { input: { nums }, result, frames }
}

export const code = `maximum k that lets swaps sort the permutation
  when nums is already in order then return 0
  for each candidate k from n minus 1 down to 0
    explore every arrangement reachable by trades whose pair ANDs to k
    if the search reaches the sorted array then return k
  return 0`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from collections import deque

def max_k_to_sort(nums):
    n = len(nums)
    if all(v == i for i, v in enumerate(nums)):
        return 0
    goal = tuple(range(n))
    for k in range(n - 1, -1, -1):
        seen = {tuple(nums)}
        queue = deque([tuple(nums)])
        while queue:
            cur = queue.popleft()
            if cur == goal:
                return k
            for i in range(n):
                for j in range(i + 1, n):
                    if cur[i] & cur[j] == k:
                        nxt = list(cur)
                        nxt[i], nxt[j] = nxt[j], nxt[i]
                        nxt = tuple(nxt)
                        if nxt not in seen:
                            seen.add(nxt)
                            queue.append(nxt)
    return 0`
const PY_LINES = python.split('\n')
function PL(text) { return lineOf(PY_LINES, text) }
