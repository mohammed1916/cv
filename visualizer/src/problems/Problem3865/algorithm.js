export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and k.')
  const { nums, k } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 16 || !nums.every(v => Number.isInteger(v) && v >= -9 && v <= 9)) {
    throw new Error('nums has 1 to 16 integers from -9 to 9.')
  }
  if (!Number.isInteger(k) || k < 1 || k > nums.length || nums.length % k !== 0) throw new Error('k must divide the length of nums.')
  return { nums, k }
}

export function buildTrace({ nums, k }) {
  const frames = []
  const size = nums.length / k
  const result = [...nums]
  const snap = extra => ({ arr: result.slice(), ...extra })
  frames.push(snap({ pythonLine: PY('result = list(nums)'), phase: 'start', activeLine: L('result = copy of nums'), block: -1, lo: -1, hi: -1, message: `Split ${nums.length} values into ${k} block${k === 1 ? '' : 's'} of length ${size}.` }))
  frames.push(snap({ pythonLine: PY('size = len(nums)'), phase: 'start', activeLine: L('size = length of nums'), block: -1, lo: -1, hi: -1, message: `Each block has length ${size}.` }))
  for (let b = 0; b < k; b += 1) {
    let lo = b * size
    let hi = lo + size - 1
    frames.push(snap({ pythonLine: PY('for b in range(k)'), phase: 'block', activeLine: L('for each block'), block: b, lo, hi, message: `Block ${b + 1} covers positions ${lo} to ${hi}.` }))
    while (lo < hi) {
      frames.push(snap({ pythonLine: PY('while lo < hi'), phase: 'compare', activeLine: L('while lo is less than hi'), block: b, lo, hi, message: `Swap positions ${lo} and ${hi} inside block ${b + 1}.` }))
      ;[result[lo], result[hi]] = [result[hi], result[lo]]
      frames.push(snap({ pythonLine: PY('result[lo], result[hi]'), phase: 'swap', activeLine: L('swap result at lo and hi'), block: b, lo, hi, message: `Now result[${lo}] = ${result[lo]} and result[${hi}] = ${result[hi]}.` }))
      lo += 1
      hi -= 1
    }
    frames.push(snap({ pythonLine: PY('for b in range(k)'), phase: 'blockDone', activeLine: L('for each block'), block: b, lo: -1, hi: -1, message: `Block ${b + 1} is reversed.` }))
  }
  frames.push(snap({ pythonLine: PY('return result'), phase: 'done', activeLine: L('return result'), block: -1, lo: -1, hi: -1, message: `Result: [${result.join(', ')}].` }))
  return { input: { nums, k }, result: [...result], frames }
}

export const code = `reverse k equal blocks of nums
  size = length of nums divided by k
  result = copy of nums
  for each block b from 0 to k minus 1
    lo = b times size, hi = lo plus size minus 1
    while lo is less than hi
      swap result at lo and hi
      move lo one step right and hi one step left
  return result`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def reverse_k_subarrays(nums, k):
    size = len(nums) // k
    result = list(nums)
    for b in range(k):
        lo = b * size
        hi = lo + size - 1
        while lo < hi:
            result[lo], result[hi] = result[hi], result[lo]
            lo += 1
            hi -= 1
    return result
`

const PY = s => {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}
