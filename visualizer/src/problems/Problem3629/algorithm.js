export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 30) throw new Error('Use an array of 1 to 30 integers.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 1000000)) throw new Error('Values are integers from 1 to 1000000.')
  return nums
}

const isPrime = v => {
  if (v < 2) return false
  for (let d = 2; d * d <= v; d++) if (v % d === 0) return false
  return true
}

export function buildTrace(nums) {
  const n = nums.length
  const dist = new Array(n).fill(-1)
  dist[0] = 0
  const queue = [0]
  const usedPrime = new Set()
  const frames = [{ phase: 'start', activeLine: L('set distance of index 0'), index: 0, dist: 0, message: 'Start at index 0 with 0 jumps.' }]
  for (let head = 0; head < queue.length; head++) {
    const i = queue[head]
    if (i === n - 1) break
    const candidates = []
    if (i > 0) candidates.push(i - 1)
    if (i + 1 < n) candidates.push(i + 1)
    const p = nums[i]
    if (isPrime(p) && !usedPrime.has(p)) {
      usedPrime.add(p)
      for (let j = 0; j < n; j++) if (nums[j] % p === 0) candidates.push(j)
    }
    const added = []
    for (const c of candidates) {
      if (dist[c] !== -1) continue
      dist[c] = dist[i] + 1
      queue.push(c)
      added.push(c)
    }
    frames.push({ phase: 'visit', activeLine: L('take the next index i'), index: i, dist: dist[i], message: `Index ${i} (value ${p}) at ${dist[i]} jumps. ${isPrime(p) ? `Prime ${p} teleports to multiples. ` : ''}New indices: [${added.join(', ')}].` })
  }
  const result = dist[n - 1]
  frames.push({ phase: 'done', activeLine: L('return the distance of the last index'), index: n - 1, dist: result, message: `Index ${n - 1} is reached with ${result} jumps.` })
  return { input: nums, result, frames }
}

export const code = `minimum jumps to the end (nums):
  let n be the length of nums
  set distance of index 0 to 0 and queue it
  let used be an empty set of primes
  while the queue is not empty do
    take the next index i from the queue
    the candidates are i - 1 and i + 1 when they exist
    if nums at i is a prime p not yet used then
      mark p as used and add every j where nums at j is divisible by p
    for each candidate c with no distance yet do
      set its distance to the distance of i plus 1 and queue it
  return the distance of the last index`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from collections import deque


def min_jumps(nums):
    n = len(nums)

    def is_prime(v):
        if v < 2:
            return False
        d = 2
        while d * d <= v:
            if v % d == 0:
                return False
            d += 1
        return True

    dist = [-1] * n
    dist[0] = 0
    queue = deque([0])
    used = set()
    while queue:
        i = queue.popleft()
        if i == n - 1:
            break
        candidates = []
        if i > 0:
            candidates.append(i - 1)
        if i + 1 < n:
            candidates.append(i + 1)
        p = nums[i]
        if is_prime(p) and p not in used:
            used.add(p)
            candidates.extend(j for j in range(n) if nums[j] % p == 0)
        for c in candidates:
            if dist[c] == -1:
                dist[c] = dist[i] + 1
                queue.append(c)
    return dist[n - 1]
`
