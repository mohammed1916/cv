const ERROR = 'Enter {"n":10,"m":12} with n and m from 1 to 999 that have the same number of digits. Neither may be prime.'

export function isPrime(x) {
  if (x < 2) return false
  for (let d = 2; d * d <= x; d++) if (x % d === 0) return false
  return true
}

export function parseInput(text) {
  const value = JSON.parse(text)
  if (!value || typeof value !== 'object' || !Number.isInteger(value.n) || !Number.isInteger(value.m)) throw new Error(ERROR)
  const { n, m } = value
  if (n < 1 || n > 999 || m < 1 || m > 999 || String(n).length !== String(m).length) throw new Error(ERROR)
  return { n, m }
}

export const code = `minimum cost to turn n into m, or -1 if impossible
if n or m is prime then return -1
width = number of digits in n
dist[n] = n, every other dist = infinity
heap = [(n, n)] ordered by cost
while the heap is not empty
  pop (d, v) with the smallest d
  if d > dist[v] then continue
  if v = m then return d
  for each digit position of v
    up = v plus 1 at that position, allowed if that digit is below 9
    down = v minus 1 at that position, allowed if that digit is above 0
    for each allowed w that is not prime
      if d + w < dist[w] then record it and push it
return -1`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ n, m }) {
  const frames = []
  if (isPrime(n) || isPrime(m)) {
    frames.push({ phase: 'done', activeLine: L('return -1'), value: n, cost: null, message: `${isPrime(n) ? n : m} is prime, so no transformation can start or finish there: return -1.` })
    return { input: { n, m }, result: -1, frames }
  }
  const width = String(n).length
  const dist = new Map([[n, n]])
  const heap = [[n, n]]
  frames.push({ phase: 'start', activeLine: L('dist[n] = n'), value: n, cost: n, message: `Start at ${n} with cost ${n}. Every value on the way adds to the cost, and no visited value may be prime.` })
  let result = -1
  const popSmallest = () => { let k = 0; for (let i = 1; i < heap.length; i++) if (heap[i][0] < heap[k][0]) k = i; return heap.splice(k, 1)[0] }
  while (heap.length) {
    const [d, v] = popSmallest()
    if (d > dist.get(v)) continue
    if (v === m) { result = d; frames.push({ phase: 'done', activeLine: L('if v = m then return d'), value: v, cost: d, message: `Reached ${m} with total cost ${d}.` }); break }
    frames.push({ phase: 'settle', activeLine: L('pop (d, v)'), value: v, cost: d, message: `Expand ${v} with cost ${d}.` })
    for (let position = 0; position < width; position++) {
      const place = 10 ** (width - 1 - position)
      const digit = Math.floor(v / place) % 10
      const options = []
      if (digit < 9) options.push(v + place)
      if (digit > 0) options.push(v - place)
      for (const w of options) {
        if (isPrime(w)) { frames.push({ phase: 'relax', activeLine: L('for each allowed w that is not prime'), value: w, cost: null, message: `${w} is prime, so that change is not allowed.` }); continue }
        const nd = d + w
        if (nd < (dist.get(w) ?? Infinity)) {
          dist.set(w, nd)
          heap.push([nd, w])
          frames.push({ phase: 'relax', activeLine: L('if d + w < dist[w]'), value: w, cost: nd, message: `Change digit ${position + 1} of ${v} to reach ${w}: cost ${d} + ${w} = ${nd}.` })
        }
      }
    }
  }
  if (result === -1) frames.push({ phase: 'done', activeLine: L('return -1'), value: m, cost: null, message: `${m} cannot be reached without passing through a prime: return -1.` })
  return { input: { n, m }, result, frames }
}

export const python = `import heapq

def min_digit_cost(n, m):
    def is_prime(x):
        if x < 2:
            return False
        i = 2
        while i * i <= x:
            if x % i == 0:
                return False
            i += 1
        return True

    if is_prime(n) or is_prime(m):
        return -1
    width = len(str(n))
    inf = float('inf')
    dist = {n: n}
    heap = [(n, n)]
    while heap:
        d, v = heapq.heappop(heap)
        if d > dist.get(v, inf):
            continue
        if v == m:
            return d
        for position in range(width):
            place = 10 ** (width - 1 - position)
            digit = (v // place) % 10
            options = []
            if digit < 9:
                options.append(v + place)
            if digit > 0:
                options.append(v - place)
            for w in options:
                if is_prime(w):
                    continue
                nd = d + w
                if nd < dist.get(w, inf):
                    dist[w] = nd
                    heapq.heappush(heap, (nd, w))
    return -1
`
