const MOD = 1000000007n

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and k.')
  const { nums, k } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 8) throw new Error('nums has 1 to 8 values.')
  if (!nums.every(x => Number.isInteger(x) && x >= 0 && x <= 20)) throw new Error('Each value is an integer from 0 to 20.')
  if (!Number.isInteger(k) || k < 0 || k > 20) throw new Error('k is an integer from 0 to 20.')
  return { nums, k }
}

export function buildTrace({ nums, k }) {
  const frames = []
  const heap = [...nums].sort((a, b) => a - b)
  frames.push({ pythonLine: PL('heap = sorted'), phase: 'setup', activeLine: CL('const heap'), at: -1, heap: [...heap], left: k, message: `Sort the values so the smallest is first: ${heap.join(' ')}. Spend ${k} increments.` })
  for (let step = 0; step < k; step++) {
    heap[0] += 1
    frames.push({ pythonLine: PL('heap[0] += 1'), phase: 'increment', activeLine: CL('heap[0] += 1'), at: 0, heap: [...heap], left: k - step - 1, message: `Raise the smallest value to ${heap[0]}.` })
    let i = 0
    while (i + 1 < heap.length && heap[i] > heap[i + 1]) {
      ;[heap[i], heap[i + 1]] = [heap[i + 1], heap[i]]
      i++
      frames.push({ pythonLine: PL('heap[i], heap[i + 1]'), phase: 'sift', activeLine: CL('[heap[i], heap[i + 1]]'), at: i, heap: [...heap], left: k - step - 1, message: `It is now larger than its neighbour, so it moves right to index ${i}.` })
    }
  }
  let product = 1n
  for (const x of heap) product = (product * BigInt(x)) % MOD
  frames.push({ pythonLine: PL('return product'), phase: 'done', activeLine: CL('return Number(product)'), at: -1, heap: [...heap], left: 0, message: `The product of all values modulo 1000000007 is ${product}.` })
  return { input: { nums, k }, result: Number(product), frames }
}

export const code = `const MOD = 1000000007n;

function maximumProduct(nums, k) {
  const heap = [...nums].sort((a, b) => a - b);
  for (let step = 0; step < k; step++) {
    heap[0] += 1;
    let i = 0;
    while (i + 1 < heap.length && heap[i] > heap[i + 1]) {
      [heap[i], heap[i + 1]] = [heap[i + 1], heap[i]];
      i++;
    }
  }
  let product = 1n;
  for (const x of heap) product = (product * BigInt(x)) % MOD;
  return Number(product);
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CL = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export const python = `import heapq

def maximum_product(nums, k):
    MOD = 10**9 + 7
    heap = sorted(nums)
    for _ in range(k):
        heap[0] += 1
        i = 0
        while i + 1 < len(heap) and heap[i] > heap[i + 1]:
            heap[i], heap[i + 1] = heap[i + 1], heap[i]
            i += 1
    product = 1
    for x in heap:
        product = product * x % MOD
    return product
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }
