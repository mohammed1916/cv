const MOD = 1000000007

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.nums) || !Number.isInteger(input.target1) || !Number.isInteger(input.target2)) throw new Error('Use a JSON object with a nums array and integers target1 and target2.')
  if (input.nums.length < 1 || input.nums.length > 10) throw new Error('nums needs 1 to 10 values (visualization cap).')
  if (input.nums.some(v => !Number.isInteger(v) || v < 0 || v > 15)) throw new Error('nums values are integers from 0 to 15.')
  if (![input.target1, input.target2].every(t => Number.isInteger(t) && t >= 0 && t <= 15)) throw new Error('targets are integers from 0 to 15.')
  if (input.target1 === input.target2) throw new Error('target1 and target2 must differ.')
  return input
}

export function buildTrace(input) {
  const { nums, target1, target2 } = input
  const n = nums.length
  const pre = [0]
  for (const x of nums) pre.push(pre[pre.length - 1] ^ x)
  const ways1 = Array(n + 1).fill(0)
  const ways2 = Array(n + 1).fill(0)
  ways2[0] = 1
  const frames = [{ phase: 'start', activeLine: L('ways2[0] = 1'), at: 0, ways1: [...ways1], ways2: [...ways2], message: 'The empty prefix behaves as if target2 came just before, so the first block must be target1.' }]
  for (let i = 1; i <= n; i++) {
    for (let j = 0; j < i; j++) {
      const v = pre[i] ^ pre[j]
      if (v === target1) ways1[i] = (ways1[i] + ways2[j]) % MOD
      else if (v === target2) ways2[i] = (ways2[i] + ways1[j]) % MOD
    }
    frames.push({ phase: 'cut', activeLine: L('for each earlier cut j'), at: i, ways1: [...ways1], ways2: [...ways2], message: `Prefix of length ${i}: ${ways1[i]} partition(s) end with target1, ${ways2[i]} with target2.` })
  }
  const result = (ways1[n] + ways2[n]) % MOD
  frames.push({ phase: 'done', activeLine: L('return ways1[n]'), at: n, ways1: [...ways1], ways2: [...ways2], message: `Valid partitions modulo 1000000007: ${result}.` })
  return { input, result, frames }
}

export const code = `number of alternating xor partitions (nums, target1, target2):
  pre = prefix xor values, with pre[0] = 0
  ways1[0] = 0 and ways2[0] = 1
  for each end position i from 1 to n
    for each earlier cut j from 0 to i - 1
      v = pre[i] xor pre[j]
      if v is target1 then add ways2[j] to ways1[i]
      otherwise if v is target2 then add ways1[j] to ways2[i]
  return ways1[n] + ways2[n] modulo 1000000007`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def number_of_alternating_xor_partitions(nums, target1, target2):
    MOD = 1000000007
    n = len(nums)
    pre = [0]
    for x in nums:
        pre.append(pre[-1] ^ x)
    ways1 = [0] * (n + 1)
    ways2 = [0] * (n + 1)
    ways2[0] = 1
    for i in range(1, n + 1):
        for j in range(i):
            v = pre[i] ^ pre[j]
            if v == target1:
                ways1[i] = (ways1[i] + ways2[j]) % MOD
            elif v == target2:
                ways2[i] = (ways2[i] + ways1[j]) % MOD
    return (ways1[n] + ways2[n]) % MOD
`
