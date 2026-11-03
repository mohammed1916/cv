const MOD = 1000000007

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 16) throw new Error('Use a JSON array of 1 to 16 integers.')
  if (!nums.every(x => Number.isInteger(x) && x >= 0 && x <= 1000)) throw new Error('Each value is an integer from 0 to 1000.')
  return nums
}

export const code = `FUNCTION countOddSum(nums)
    MOD ← 1000000007
    odd ← 0, even ← 1 (the empty subsequence has sum 0)
    FOR each value x in nums
        IF x is odd THEN
            odd, even ← odd + even, even + odd, both mod MOD
        ELSE
            odd, even ← 2 · odd, 2 · even, both mod MOD
    RETURN odd`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def count_odd_sum(nums):
    MOD = 1000000007
    odd, even = 0, 1
    for x in nums:
        if x % 2 == 1:
            odd, even = (odd + even) % MOD, (even + odd) % MOD
        else:
            odd, even = (2 * odd) % MOD, (2 * even) % MOD
    return odd


if __name__ == "__main__":
    import json
    import sys
    print(count_odd_sum(json.loads(sys.stdin.read())))
`

const P = s => {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}

export function buildTrace(nums) {
  const frames = []
  let odd = 0
  let even = 1
  frames.push({
    phase: 'start', activeLine: L('odd ← 0'), pythonLine: P('odd, even = 0, 1'),
    index: -1, x: null, odd, even, prevOdd: odd, prevEven: even,
    message: 'Start with the empty subsequence. Its sum 0 is even, so even = 1 and odd = 0.',
  })
  nums.forEach((x, index) => {
    const prevOdd = odd
    const prevEven = even
    const isOdd = x % 2 === 1
    frames.push({
      phase: 'decide', activeLine: L('IF x is odd'), pythonLine: P('if x % 2 == 1'),
      index, x, odd: prevOdd, even: prevEven, prevOdd, prevEven, isOdd,
      message: `${x} is ${isOdd ? 'odd' : 'even'}, so ${isOdd ? 'subsets that were even swap to odd and odd swap to even' : 'every subset keeps its parity and is doubled by including x'}.`,
    })
    if (isOdd) {
      odd = (prevOdd + prevEven) % MOD
      even = (prevEven + prevOdd) % MOD
    } else {
      odd = (2 * prevOdd) % MOD
      even = (2 * prevEven) % MOD
    }
    frames.push({
      phase: 'update', activeLine: isOdd ? L('odd, even ← odd + even') : L('2 · odd'),
      pythonLine: isOdd ? P('odd, even = (odd + even)') : P('odd, even = (2 * odd)'),
      index, x, odd, even, prevOdd, prevEven, isOdd,
      message: isOdd
        ? `odd = ${prevOdd} + ${prevEven} and even = ${prevEven} + ${prevOdd}, both mod ${MOD}.`
        : `odd = 2 · ${prevOdd} and even = 2 · ${prevEven}, both mod ${MOD}.`,
    })
  })
  frames.push({
    phase: 'done', activeLine: L('RETURN odd'), pythonLine: P('return odd'),
    index: nums.length, x: null, odd, even, prevOdd: odd, prevEven: even,
    message: `${odd} nonempty subsequences have an odd sum (mod ${MOD}).`,
  })
  return { input: nums, result: odd, frames }
}
