export function parseInput(text) {
  const data = JSON.parse(text)
  const { nums, k } = data ?? {}
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 10) throw new Error('Use "nums" as an array of 1 to 10 numbers.')
  if (nums.some(x => !Number.isInteger(x) || x < 1 || x > 50)) throw new Error('Each number is an integer from 1 to 50.')
  if (!Number.isInteger(k) || k < 1 || k > 12) throw new Error('"k" is an integer from 1 to 12.')
  return { nums, k }
}

export function buildTrace({ nums, k }) {
  const values = [...nums]
  let score = 0
  const frames = [{ phase: 'start', activeLine: L('set score to 0'), values: [...values], picked: -1, score, message: 'Every number starts in the heap. Each operation takes the largest one.' }]
  for (let round = 0; round < k; round++) {
    let at = 0
    for (let i = 1; i < values.length; i++) if (values[i] > values[at]) at = i
    const x = values[at]
    score += x
    values[at] = Math.ceil(x / 3)
    frames.push({ phase: 'take', activeLine: L('take the largest'), values: [...values], picked: at, score, message: `Take ${x}, score ${score}, and put back ${values[at]}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return score'), values: [...values], picked: -1, score, message: `Maximal score: ${score}.` })
  return { input: { nums, k }, result: score, frames }
}

export const code = `maximal score after k operations on nums
  set score to 0
  put every number into a max heap
  repeat k times
    take the largest number x out of the heap
    add x to score
    put ceil of x divided by 3 back into the heap
  return score`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `import heapq

def maximal_score(nums, k):
    heap = [-x for x in nums]
    heapq.heapify(heap)
    score = 0
    for _ in range(k):
        x = -heapq.heappop(heap)
        score += x
        heapq.heappush(heap, -((x + 2) // 3))
    return score
`
