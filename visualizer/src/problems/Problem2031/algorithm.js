export const phases = [
  { id: 'start', label: 'Balance', description: 'Give every 1 a +1 and every 0 a -1; a subarray has more ones when its balance is positive.' },
  { id: 'prefix', label: 'Prefix balances', description: 'The balance of nums[i..j] is prefix[j+1] - prefix[i], so count earlier prefixes that are smaller.' },
  { id: 'count', label: 'Count pairs', description: 'Each earlier prefix below the current one gives one subarray that ends here.' },
  { id: 'done', label: 'Result', description: 'Return the count modulo 1000000007.' },
]

export const code = `function countSubarraysMoreOnes(nums) {
  const MOD = 1000000007
  const prefix = [0]
  for (const v of nums) prefix.push(prefix[prefix.length - 1] + (v === 1 ? 1 : -1))
  let count = 0
  for (let j = 1; j < prefix.length; j++) {
    for (let i = 0; i < j; i++) {
      if (prefix[i] < prefix[j]) count++
    }
  }
  return count % MOD
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def count_subarrays_more_ones(nums):
    MOD = 1000000007
    prefix = [0]
    for v in nums:
        prefix.append(prefix[-1] + (1 if v == 1 else -1))
    count = 0
    for j in range(1, len(prefix)):
        for i in range(j):
            if prefix[i] < prefix[j]:
                count += 1
    return count % MOD
`

const C = fragment => code.findIndex(c => c.text.includes(fragment)) + 1
const P = fragment => python.split('\n').findIndex(line => line.includes(fragment)) + 1

export function parseInput(text) {
  let nums
  try { nums = JSON.parse(text) } catch { throw new Error('Use a JSON array of 0s and 1s such as [0,1,1,0,1].') }
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 40 || !nums.every(v => v === 0 || v === 1)) {
    throw new Error('nums must have 1 to 40 entries, each 0 or 1.')
  }
  return nums
}

export function buildTrace(nums) {
  const MOD = 1000000007
  const frames = []
  const prefix = [0]
  for (const v of nums) prefix.push(prefix[prefix.length - 1] + (v === 1 ? 1 : -1))
  const add = (phase, c, p, message, j, count) => frames.push({
    phase, activeLine: C(c), pythonLine: P(p), message,
    snapshot: { nums, prefix, j, count },
  })
  add('start', 'const prefix = [0]', 'prefix = [0]', 'Balances start at 0.', 0, 0)
  add('prefix', 'for (const v of nums)', 'for v in nums', `Prefix balances: ${prefix.join(', ')}.`, prefix.length - 1, 0)
  let count = 0
  for (let j = 1; j < prefix.length; j++) {
    let gained = 0
    for (let i = 0; i < j; i++) if (prefix[i] < prefix[j]) gained++
    count += gained
    add('count', 'if (prefix[i] < prefix[j])', 'if prefix[i] < prefix[j]', `Prefix ${j} = ${prefix[j]} beats ${gained} earlier prefix(es): ${gained} subarray(s) end here.`, j, count)
  }
  add('done', 'return count % MOD', 'return count % MOD', `Count of subarrays with more ones: ${count % MOD}.`, prefix.length - 1, count)
  return { input: nums, result: count % MOD, frames }
}
