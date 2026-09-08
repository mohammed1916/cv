export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || !nums.length || nums.length > 100000 || nums.some(v => !Number.isInteger(v) || v < 1 || v > 100000)) throw new Error('Enter 1–100,000 positive integers, each at most 100,000.')
  return nums
}
export function buildTrace(nums) {
  let maximum = 2
  for (const value of nums) maximum = Math.max(maximum, value)
  const limit = 2 * maximum, prime = new Uint8Array(limit + 1).fill(1)
  prime[0] = prime[1] = 0
  for (let p = 2; p * p <= limit; p++) if (prime[p]) for (let multiple = p * p; multiple <= limit; multiple += p) prime[multiple] = 0
  const nextPrime = new Int32Array(limit + 1), nextNonPrime = new Int32Array(limit + 1)
  let p = -1, q = -1
  for (let value = limit; value >= 1; value--) {
    if (prime[value]) p = value
    else q = value
    nextPrime[value] = p
    nextNonPrime[value] = q
  }
  const targets = [], costs = []
  let total = 0
  const frames = [{ phase: 'start', index: -1, total, activeLine: 2, message: `Sieve primes through ${limit}, then prepare nearest-prime and nearest-non-prime lookup tables.` }]
  nums.forEach((value, index) => {
    const wantPrime = index % 2 === 0
    frames.push({ phase: 'classify', index, total, activeLine: 16, message: `Index ${index} is ${wantPrime ? 'even: requires prime' : 'odd: requires non-prime'}. Current value ${value} is ${prime[value] ? 'prime' : 'non-prime'}.` })
    const target = wantPrime ? nextPrime[value] : nextNonPrime[value], cost = target - value
    targets.push(target)
    costs.push(cost)
    frames.push({ phase: 'choose', index, total, target, cost, activeLine: 17, message: `Nearest allowed value at or above ${value} is ${target}. Required increments: ${target} − ${value} = ${cost}.` })
    total += cost
    frames.push({ phase: 'apply', index, total, target, cost, activeLine: 18, message: `Apply ${cost} unit increments at index ${index}. Total operations: ${total}.` })
  })
  frames.push({ phase: 'done', index: -1, total, activeLine: 19, message: `Return ${total}. Each position uses its independently cheapest allowed value.` })
  return { input: [...nums], prime, targets, costs, result: total, frames }
}
export const code = `def minOperations(nums):
    limit = 2 * max(2, max(nums))
    prime = [True] * (limit + 1)
    prime[0] = prime[1] = False
    for p in range(2, int(limit ** 0.5) + 1):
        if prime[p]:
            for multiple in range(p*p, limit + 1, p):
                prime[multiple] = False
    next_prime, next_non = [-1]*(limit+1), [-1]*(limit+1)
    p = q = -1
    for v in range(limit, 0, -1):
        if prime[v]: p = v
        else: q = v
        next_prime[v], next_non[v] = p, q
    cost = 0
    for i, value in enumerate(nums):
        target = next_prime[value] if i % 2 == 0 else next_non[value]
        cost += target - value
    return cost`.split('\n').map((text, index) => ({ line: index + 1, text }))
