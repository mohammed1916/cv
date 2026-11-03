export const phases = [
  { id: 'start', label: 'Total remainder', description: 'The removed block must have the same remainder as the whole array.' },
  { id: 'scan', label: 'Prefix remainder', description: 'Track the running remainder after each index.' },
  { id: 'match', label: 'Find match', description: 'Look up the latest earlier index with the remainder that makes the removed block divisible.' },
  { id: 'record', label: 'Remember index', description: 'Store the latest index for this prefix remainder, which keeps future removals shortest.' },
  { id: 'done', label: 'Return', description: 'Return the shortest proper removal, 0 when already divisible, or -1 when only the whole array works.' },
]

export const complexity = 'O(n) time: one pass with a map of at most p remainders. O(min(n, p)) extra space.'

export const examples = [
  { label: 'Short block', input: '{"nums":[3,1,4,2],"p":6}' },
  { label: 'Already fine', input: '{"nums":[2,4,6],"p":2}' },
  { label: 'Whole only', input: '{"nums":[5],"p":3}' },
]

export function parseInput(text) {
  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('Enter JSON like {"nums":[...],"p":n}.')
  }
  const nums = data?.nums
  const p = data?.p
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 50 || !nums.every(v => Number.isInteger(v) && v >= 0 && v <= 100)) {
    throw new Error('nums must be 1 to 50 integers from 0 to 100.')
  }
  if (!Number.isInteger(p) || p < 1 || p > 100) throw new Error('p must be an integer from 1 to 100.')
  return { nums: [...nums], p }
}

export function buildTrace({ nums, p }) {
  const n = nums.length
  const total = nums.reduce((sum, v) => sum + v, 0)
  const need = total % p
  const frames = []
  const last = new Map([[0, -1]])
  let prefix = 0
  let best = n
  const snap = extra => ({ total, need, p, prefix, best, last: Object.fromEntries(last), ...extra })
  const finish = (result, activeLine, message) => {
    frames.push({ phase: 'done', activeLine, message, snapshot: snap({ result }) })
    return { input: { nums, p }, result, frames }
  }
  frames.push({ phase: 'start', activeLine: 2, message: `Total ${total} mod ${p} = ${need}. The removed block needs remainder ${need}.`, snapshot: snap() })
  if (need === 0) return finish(0, 3, 'The total is already divisible by p, so remove nothing.')
  for (let i = 0; i < n; i++) {
    prefix = (prefix + nums[i]) % p
    frames.push({ phase: 'scan', activeLine: 6, message: `Prefix remainder after index ${i} is ${prefix}.`, snapshot: snap({ i }) })
    const want = (prefix - need + p) % p
    const found = last.has(want)
    if (found) best = Math.min(best, i - last.get(want))
    frames.push({ phase: 'match', activeLine: 8, message: found ? `Remainder ${want} was last seen at index ${last.get(want)}: removal length ${i - last.get(want)}.` : `No earlier index has remainder ${want}; no removal ends here.`, snapshot: snap({ i, want }) })
    last.set(prefix, i)
    frames.push({ phase: 'record', activeLine: 9, message: `Remember index ${i} for remainder ${prefix}.`, snapshot: snap({ i, want }) })
  }
  if (best === n) return finish(-1, 10, 'Only removing the whole array works, which is not allowed. Return -1.')
  return finish(best, 11, `Return the shortest removal length ${best}.`)
}

export const python = `def minSubarrayRemoval(nums, p):
    need = sum(nums) % p
    if need == 0:
        return 0
    last = {0: -1}
    prefix = 0
    best = len(nums)
    for i in range(len(nums)):
        prefix = (prefix + nums[i]) % p
        want = (prefix - need + p) % p
        if want in last:
            best = min(best, i - last[want])
        last[prefix] = i
    return -1 if best == len(nums) else best`

export const code = [
  'FUNCTION minSubarrayRemoval(nums, p)',
  '    need = sum(nums) mod p',
  '    IF need == 0 RETURN 0',
  '    last = {0: -1}; prefix = 0; best = n',
  '    FOR i from 0 to n - 1',
  '        prefix = (prefix + nums[i]) mod p',
  '        want = (prefix - need + p) mod p',
  '        IF want is in last THEN best = min(best, i - last[want])',
  '        last[prefix] = i',
  '    IF best == n RETURN -1',
  '    RETURN best',
].map((text, index) => ({ line: index + 1, text }))

// Pseudocode line -> Python line.
export const pythonLineMap = { 1: 1, 2: 2, 3: 3, 4: 5, 5: 8, 6: 9, 7: 10, 8: 11, 9: 13, 10: 14, 11: 14 }
