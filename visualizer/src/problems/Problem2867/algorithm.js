export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n and edges.')
  const { n, edges } = input
  if (!Number.isInteger(n) || n < 1 || n > 10) throw new Error('n must be an integer from 1 to 10.')
  if (!Array.isArray(edges) || edges.length !== n - 1) throw new Error('A tree on n nodes needs n - 1 edges.')
  const parentOf = Array.from({ length: n + 1 }, (_, i) => i)
  const find = x => (parentOf[x] === x ? x : (parentOf[x] = find(parentOf[x])))
  for (const e of edges) {
    if (!Array.isArray(e) || e.length !== 2 || e.some(v => !Number.isInteger(v) || v < 1 || v > n)) throw new Error('Each edge joins two labels from 1 to n.')
    const [a, b] = e
    if (find(a) === find(b)) throw new Error('The edges must form a tree without cycles.')
    parentOf[find(a)] = find(b)
  }
  return { n, edges }
}

const isPrime = x => {
  if (x < 2) return false
  for (let d = 2; d * d <= x; d++) if (x % d === 0) return false
  return true
}

export function buildTrace({ n, edges }) {
  const adjacency = Array.from({ length: n + 1 }, () => [])
  for (const [a, b] of edges) { adjacency[a].push(b); adjacency[b].push(a) }
  const frames = []
  let count = 0
  frames.push({ phase: 'start', activeLine: L('set count to 0'), u: -1, v: -1, primes: 0, reached: [], count, message: `Walk from every node of the tree labelled 1 to ${n}.` })
  for (let u = 1; u <= n; u++) {
    const pending = [[u, 0, isPrime(u) ? 1 : 0]]
    const reached = []
    frames.push({ phase: 'walk', activeLine: L('for each start node'), u, v: u, primes: isPrime(u) ? 1 : 0, reached: [], count, message: `Start a walk at ${u}.` })
    while (pending.length) {
      const [v, parent, primes] = pending.pop()
      reached.push(v)
      if (v > u && primes === 1) {
        count++
        frames.push({ phase: 'pair', activeLine: L('if v is greater than u'), u, v, primes, reached: [...reached], count, message: `Path ${u} to ${v} has exactly one prime. Count is ${count}.` })
      } else if (v > u) {
        frames.push({ phase: 'skip', activeLine: L('if v is greater than u'), u, v, primes, reached: [...reached], count, message: `Path ${u} to ${v} has ${primes} primes; not counted.` })
      }
      for (const w of adjacency[v]) {
        if (w !== parent) pending.push([w, v, primes + (isPrime(w) ? 1 : 0)])
      }
    }
  }
  frames.push({ phase: 'done', activeLine: L('return count'), u: -1, v: -1, primes: 0, reached: [], count, message: `Valid pairs: ${count}.` })
  return { input: { n, edges }, result: count, frames }
}

export const code = `count pairs of nodes whose path has exactly one prime label
  set count to 0
  for each start node u from 1 to n
    walk outward from u, carrying the number of prime labels on the path so far
    for each node v reached with prime count c
      if v is greater than u and c equals 1 then add one to count
  return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_prime_path_pairs(n, edges):
    def is_prime(x):
        if x < 2:
            return False
        d = 2
        while d * d <= x:
            if x % d == 0:
                return False
            d += 1
        return True

    adjacency = [[] for _ in range(n + 1)]
    for a, b in edges:
        adjacency[a].append(b)
        adjacency[b].append(a)
    count = 0
    for start in range(1, n + 1):
        pending = [(start, 0, 1 if is_prime(start) else 0)]
        while pending:
            v, parent, primes = pending.pop()
            if v > start and primes == 1:
                count += 1
            for w in adjacency[v]:
                if w != parent:
                    pending.append((w, v, primes + (1 if is_prime(w) else 0)))
    return count
`
