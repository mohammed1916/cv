export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with an empty output list.' },
  { id: 'pair', label: 'Read pair', description: 'The pair is [frequency, value]: the frequency comes first, then the value.' },
  { id: 'emit', label: 'Emit copies', description: 'Append the value to the output once for each copy the frequency asks for.' },
  { id: 'done', label: 'Complete', description: 'Every pair has been expanded, in order.' },
]

export const examples = [
  { label: 'Two pairs', input: '[3,1,2,4]' },
  { label: 'Mixed run lengths', input: '[2,5,1,7,3,9]' },
]

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 100 || nums.length % 2 !== 0) throw new Error('Use a JSON array with an even number of values, from 2 to 100 values, such as [1,2,3,4].')
  for (let i = 0; i < nums.length; i += 2) {
    if (!Number.isInteger(nums[i]) || nums[i] < 1 || nums[i] > 100) throw new Error(`Each frequency must be 1 to 100; ${nums[i]} is not valid.`)
    if (!Number.isInteger(nums[i + 1]) || nums[i + 1] < 1 || nums[i + 1] > 100) throw new Error(`Each value must be 1 to 100; ${nums[i + 1]} is not valid.`)
  }
  return nums
}

export function buildTrace(nums) {
  const out = []
  const snap = (pair, extra = {}) => ({ nums, pair, out: [...out], ...extra })
  const frames = [{ phase: 'start', activeLine: L('const out = []'), pythonLine: P('out = []'), snapshot: snap(null),
    message: `Read ${nums.length / 2} pairs from the list, left to right.` }]
  for (let i = 0; i < nums.length; i += 2) {
    const freq = nums[i]
    const val = nums[i + 1]
    frames.push({ phase: 'pair', activeLine: L('const freq = nums[i]'), pythonLine: P('freq = nums[i]'), snapshot: snap(i, { freq, val }),
      message: `Pair ${i / 2 + 1}: frequency ${freq}, value ${val}.` })
    for (let k = 0; k < freq; k++) {
      out.push(val)
      frames.push({ phase: 'emit', activeLine: L('out.push(val)'), pythonLine: P('out.append(val)'), snapshot: snap(i, { freq, val, copy: k + 1 }),
        message: `Append ${val} (copy ${k + 1} of ${freq}).` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return out'), pythonLine: P('return out'), snapshot: snap(null),
    message: `Return the ${out.length}-value list.`, result: out })
  return { input: nums, result: out, frames }
}

export const code = `function decompressRLElist(nums) {
  const out = []
  for (let i = 0; i < nums.length; i += 2) {
    const freq = nums[i]
    const val = nums[i + 1]
    for (let k = 0; k < freq; k++) out.push(val)
  }
  return out
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def decompress_rle_list(nums):
    out = []
    for i in range(0, len(nums), 2):
        freq = nums[i]
        val = nums[i + 1]
        for k in range(freq):
            out.append(val)
    return out
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
