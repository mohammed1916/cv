export const code = `function countSubarrays(nums, k, m) {
  let count = 0
  for (let l = 0; l < nums.length; l++) {
    const freq = new Map()
    for (let r = l; r < nums.length; r++) {
      freq.set(nums[r], (freq.get(nums[r]) || 0) + 1)
      if (freq.size === k && [...freq.values()].every(c => c >= m)) count++
    }
  }
  return count
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = key => {
  const hit = code.findIndex(c => c.text.includes(key))
  if (hit < 0) throw new Error(`Missing pseudocode line: ${key}`)
  return hit + 1
}
const P = key => {
  const index = python.split('\n').findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing python line: ${key}`)
  return index + 1
}


export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums, k and m.')
  const { nums, k, m } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12 || !nums.every(v => Number.isInteger(v) && v >= 1 && v <= 9)) throw new Error('nums has 1 to 12 integers from 1 to 9.')
  if (!Number.isInteger(k) || k < 1 || k > 9) throw new Error('k is an integer from 1 to 9.')
  if (!Number.isInteger(m) || m < 1 || m > 12) throw new Error('m is an integer from 1 to 12.')
  return { nums, k, m }
}

export function buildTrace({ nums, k, m }) {
  let count = 0
  const frames = [{ l: null, r: null, freq: [], ok: false, count, phase: 'setup', activeLine: L('let count = 0'), message: 'Count is zero.' }]
  for (let l = 0; l < nums.length; l++) {
    const freq = new Map()
    for (let r = l; r < nums.length; r++) {
      freq.set(nums[r], (freq.get(nums[r]) || 0) + 1)
      const ok = freq.size === k && [...freq.values()].every(c => c >= m)
      if (ok) count++
      frames.push({ l, r, freq: [...freq.entries()], ok, count, phase: ok ? 'count' : 'extend', activeLine: L('for (let r'),
        message: `Window ${l} to ${r}: ${freq.size} distinct value${freq.size === 1 ? '' : 's'}; ${ok ? 'valid, counted' : 'not valid'}.` })
    }
  }
  frames.push({ l: null, r: null, freq: [], ok: false, count, phase: 'done', activeLine: L('return count'), message: `Total valid subarrays: ${count}.` })
  const PHASE_PY = {'setup': P('count = 0'), 'extend': P('freq[nums[r]]'), 'count': P('if len(freq)'), 'done': P('return count')}
  frames.forEach(f => { f.pythonLine = PHASE_PY[f.phase] })
  return { input: { nums, k, m }, result: count, frames }
}

export const python = `def count_k_distinct_each_at_least_m(nums, k, m):
    count = 0
    for l in range(len(nums)):
        freq = {}
        for r in range(l, len(nums)):
            freq[nums[r]] = freq.get(nums[r], 0) + 1
            if len(freq) == k and all(c >= m for c in freq.values()):
                count += 1
    return count`
