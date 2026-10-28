const MOD = 1000000007

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('Use an array of 1 to 12 integers.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 100000)) throw new Error('Each element is an integer from 1 to 100000.')
  return nums
}

export function buildTrace(nums) {
  // run1[p] counts non-empty subsequences ending with parity p whose last run has length 1;
  // run2[p] counts those whose last run has length 2. A run of three is never allowed.
  const run1 = [0, 0]
  const run2 = [0, 0]
  const frames = [{ phase: 'start', activeLine: L('set run1 and run2'), index: -1, run1: [...run1], run2: [...run2], total: 0, message: 'No subsequences yet.' }]
  nums.forEach((x, i) => {
    const p = x % 2
    const q = 1 - p
    const switched = (1 + run1[q] + run2[q]) % MOD
    const extended = run1[p]
    run2[p] = (run2[p] + extended) % MOD
    run1[p] = (run1[p] + switched) % MOD
    const total = (run1[0] + run1[1] + run2[0] + run2[1]) % MOD
    frames.push({
      phase: 'add', activeLine: L('add switched to run1 for p'), index: i, run1: [...run1], run2: [...run2], total,
      message: `${x} is ${p === 0 ? 'even' : 'odd'}. ${switched} new subsequences start or switch parity here, and ${extended} extend a run of one into a run of two.`,
    })
  })
  const result = (run1[0] + run1[1] + run2[0] + run2[1]) % MOD
  frames.push({ phase: 'done', activeLine: L('return the sum of all four counts'), index: -1, run1: [...run1], run2: [...run2], total: result, message: `Stable subsequences: ${result}.` })
  return { input: nums, result, frames }
}

export const code = `count stable subsequences of nums
  set run1 and run2 for odd and even to 0
  for each value x in nums
    let p be the parity of x
    let q be the other parity
    let switched be 1 plus all ways that end with parity q
    let extended be the ways ending with parity p that have run length 1
    add extended to run2 for p
    add switched to run1 for p
  return the sum of all four counts modulo 1000000007`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_stable_subsequences(nums):
    MOD = 10**9 + 7
    run1 = [0, 0]
    run2 = [0, 0]
    for x in nums:
        p = x % 2
        q = 1 - p
        switched = (1 + run1[q] + run2[q]) % MOD
        extended = run1[p]
        run2[p] = (run2[p] + extended) % MOD
        run1[p] = (run1[p] + switched) % MOD
    return (sum(run1) + sum(run2)) % MOD
`
