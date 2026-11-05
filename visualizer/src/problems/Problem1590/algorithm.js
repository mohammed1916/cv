export const phases = [
  { id: 'start', label: 'Start', description: 'The whole array has sum S. If S mod p is 0, nothing needs removing.' },
  { id: 'scan', label: 'Prefix remainder', description: 'Track the prefix sum mod p. Removing a subarray with remainder r leaves the rest divisible by p.' },
  { id: 'candidate', label: 'Shorter removal', description: 'An earlier prefix with the needed remainder starts a subarray; keep the shortest one seen.' },
  { id: 'skip', label: 'No match', description: 'No earlier prefix has the needed remainder, so this end position gives no removal.' },
  { id: 'done', label: 'Complete', description: 'Return the shortest removal, or -1 when only the whole array would work.' },
]

export const examples = [
  { label: 'Short block', input: '{"nums":[6,3,5,2],"p":9}' },
  { label: 'Already fine', input: '{"nums":[2,4,6],"p":2}' },
  { label: 'Whole only', input: '{"nums":[5],"p":3}' },
]

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data) || !Array.isArray(data.nums) || !Number.isInteger(data.p)) throw new Error('Use an object with a nums list and an integer p, such as {"nums":[3,1,4],"p":6}.')
  if (data.nums.length < 1 || data.nums.length > 20) throw new Error('nums must have 1 to 20 values in this visualization.')
  if (!data.nums.every(v => Number.isInteger(v) && v >= 1 && v <= 1000)) throw new Error('Every nums value must be an integer from 1 to 1000.')
  if (data.p < 1 || data.p > 1000) throw new Error('p must be from 1 to 1000 in this visualization.')
  return { nums: data.nums, p: data.p }
}

export function buildTrace({ nums, p }) {
  const n = nums.length
  const total = nums.reduce((a, b) => a + b, 0) % p
  const snap = (extra = {}) => ({ nums, p, total, best: n, ...extra })
  const frames = [{ phase: 'start', activeLine: L('const total ='), pythonLine: P('total = sum'), snapshot: snap(),
    message: `The total leaves remainder ${total} when divided by ${p}.` }]
  if (total === 0) {
    frames.push({ phase: 'done', activeLine: L('return 0'), pythonLine: P('return 0'), snapshot: snap({ result: 0 }), message: 'The total is already divisible by p, so remove nothing.', result: 0 })
    for (const f of frames) f.scene = { ...f.snapshot }
    return { input: { nums, p }, result: 0, frames }
  }
  const seen = new Map([[0, -1]])
  let prefix = 0
  let best = n
  for (let i = 0; i < n; i++) {
    prefix = (prefix + nums[i]) % p
    const need = (prefix - total + p) % p
    if (seen.has(need)) {
      const l = seen.get(need) + 1
      const length = i - seen.get(need)
      if (length < best) {
        best = length
        frames.push({ phase: 'candidate', activeLine: L('best = Math.min'), pythonLine: P('best = min'), snapshot: snap({ l, r: i, best, prefix, need }),
          message: `Removing positions ${l} to ${i} leaves a sum divisible by ${p}; length ${length}.` })
      } else {
        frames.push({ phase: 'skip', activeLine: L('if (seen.has(need))'), pythonLine: P('if need in seen'), snapshot: snap({ l, r: i, best, prefix, need }),
          message: `Removing positions ${l} to ${i} works, but it is not shorter than ${best}.` })
      }
    } else {
      frames.push({ phase: 'scan', activeLine: L('const need ='), pythonLine: P('need = '), snapshot: snap({ r: i, best, prefix, need }),
        message: `At position ${i} the prefix is ${prefix}; no earlier prefix equals ${need}.` })
    }
    seen.set(prefix, i)
  }
  const result = best === n ? -1 : best
  frames.push({ phase: 'done', activeLine: L('return best === nums.length'), pythonLine: P('return -1 if'), snapshot: snap({ result }), message: `Return ${result}.`, result })
  for (const f of frames) f.scene = { ...f.snapshot }
  return { input: { nums, p }, result, frames }
}

export const code = `function minSubarrayRemoval(nums, p) {
  const total = nums.reduce((a, b) => a + b, 0) % p
  if (total === 0) return 0
  let prefix = 0, best = nums.length, seen = new Map([[0, -1]])
  for (let i = 0; i < nums.length; i++) {
    prefix = (prefix + nums[i]) % p; const need = (prefix - total + p) % p
    if (seen.has(need)) best = Math.min(best, i - seen.get(need))
    seen.set(prefix, i)
  }
  return best === nums.length ? -1 : best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
export const pythonLineMap = { 1: 1, 2: 2, 3: 3, 4: 5, 5: 8, 6: 9, 7: 11, 8: 13, 9: 13, 10: 14, 11: 14 }

export const python = `def minSubarrayRemoval(nums, p):
    total = sum(nums) % p
    if total == 0:
        return 0
    seen = {0: -1}
    prefix = 0
    best = len(nums)
    for i in range(len(nums)):
        prefix = (prefix + nums[i]) % p
        need = (prefix - total + p) % p
        if need in seen:
            best = min(best, i - seen[need])
        seen[prefix] = i
    return -1 if best == len(nums) else best
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
