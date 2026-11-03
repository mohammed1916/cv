export const phases = [
  { id: 'start', label: 'Start', description: 'The empty prefix has total 0.' },
  { id: 'prefix', label: 'Prefix', description: 'Work out the best total for the prefix ending at the current position.' },
  { id: 'block', label: 'Last block', description: 'Try a final block of each allowed length and track its maximum.' },
  { id: 'update', label: 'Candidate', description: 'Compare the candidate total with the best so far for this prefix.' },
  { id: 'done', label: 'Answer', description: 'The best total for the whole array.' },
]

const PSEUDO = [
  'max sum after partition(arr, k):',
  '  set n = length of arr, best[0] = 0',
  '  for i from 1 to n:',
  '    set block max = 0',
  '    for length from 1 to min(k, i):',
  '      block max = max(block max, arr[i - length])',
  '      candidate = best[i - length] + length * block max',
  '      best[i] = max(best[i], candidate)',
  '  return best[n]',
]

export const code = PSEUDO.map((text, index) => ({ line: index + 1, text }))

export const python = `def max_sum_after_partition(arr, k):
    n = len(arr)
    best = [0] * (n + 1)
    for i in range(1, n + 1):
        block_max = 0
        for length in range(1, min(k, i) + 1):
            block_max = max(block_max, arr[i - length])
            best[i] = max(best[i], best[i - length] + length * block_max)
    return best[n]
`

export function parseInput(text) {
  let obj
  try { obj = JSON.parse(text) } catch { throw new Error('Use an object such as {"arr":[4,1,7,2],"k":2}.') }
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.arr) || !Number.isInteger(obj.k)) {
    throw new Error('Use an object with an array arr and an integer k.')
  }
  if (obj.arr.length < 1 || obj.arr.length > 12) throw new Error('arr must have 1 to 12 values.')
  if (!obj.arr.every(v => Number.isInteger(v) && v >= 0 && v <= 100)) throw new Error('Each value in arr is an integer from 0 to 100.')
  if (obj.k < 1 || obj.k > obj.arr.length) throw new Error('k must be between 1 and the length of arr.')
  return { arr: obj.arr.slice(), k: obj.k }
}

export function buildTrace(input) {
  const { arr, k } = input
  const n = arr.length
  const best = Array(n + 1).fill(0)
  const frames = [{ phase: 'start', activeLine: 2, pythonLine: 3, message: `Split ${n} values into blocks of length at most ${k}. The empty prefix scores 0.`, snapshot: { best: [...best], i: 0, length: 0, blockStart: null, blockEnd: null, blockMax: null } }]
  for (let i = 1; i <= n; i++) {
    frames.push({ phase: 'prefix', activeLine: 3, pythonLine: 4, message: `Find the best total for the first ${i} value${i === 1 ? '' : 's'}.`, snapshot: { best: [...best], i, length: 0, blockStart: null, blockEnd: null, blockMax: null } })
    let blockMax = 0
    for (let length = 1; length <= Math.min(k, i); length++) {
      blockMax = Math.max(blockMax, arr[i - length])
      frames.push({ phase: 'block', activeLine: 6, pythonLine: 7, message: `Final block is positions ${i - length}..${i - 1} (0-based); its maximum is ${blockMax}.`, snapshot: { best: [...best], i, length, blockStart: i - length, blockEnd: i - 1, blockMax } })
      const previous = best[i - length]
      const candidate = previous + length * blockMax
      const before = best[i]
      const improved = candidate > before
      if (improved) best[i] = candidate
      const message = improved
        ? `${previous} + ${length} × ${blockMax} = ${candidate} is the new best for this prefix.`
        : `${previous} + ${length} × ${blockMax} = ${candidate} does not beat ${before}.`
      frames.push({ phase: 'update', activeLine: 8, pythonLine: 8, message, snapshot: { best: [...best], i, length, blockStart: i - length, blockEnd: i - 1, blockMax, candidate } })
    }
  }
  frames.push({ phase: 'done', activeLine: 9, pythonLine: 9, message: `The best total for all ${n} values is ${best[n]}.`, snapshot: { best: [...best], i: n, length: 0, blockStart: null, blockEnd: null, blockMax: null } })
  return { input, result: best[n], frames }
}
