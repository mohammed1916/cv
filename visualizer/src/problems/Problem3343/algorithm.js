const MOD = 1000000007n

export function parseInput(text) {
  const o = JSON.parse(text)
  if (!o || typeof o.num !== 'string') throw new Error('Use an object with a digit string num.')
  if (!/^\d{2,10}$/.test(o.num)) throw new Error('num must be 2 to 10 digits.')
  return { num: o.num }
}

const powmod = (b, e) => {
  let r = 1n
  let base = BigInt(b) % MOD
  let exp = BigInt(e)
  while (exp > 0n) {
    if (exp & 1n) r = (r * base) % MOD
    base = (base * base) % MOD
    exp >>= 1n
  }
  return r
}
const factmod = m => {
  let r = 1n
  for (let i = 2; i <= m; i++) r = (r * BigInt(i)) % MOD
  return r
}

export function buildTrace({ num }) {
  const digits = [...num].map(Number)
  const L_ = digits.length
  const total = digits.reduce((a, b) => a + b, 0)
  const frames = [{ phase: 'start', activeLine: L('set total to the sum'), digit: -1, reach: 0, message: `Digit sum ${total} of ${num}.` }]
  if (total % 2) {
    frames.push({ phase: 'done', activeLine: L('return zero'), digit: -1, reach: 0, message: 'The digit sum is odd, so no split is balanced.' })
    return { input: { num }, result: 0, frames, digits }
  }
  const half = total / 2
  const evenSlots = Math.ceil(L_ / 2)
  const oddSlots = Math.floor(L_ / 2)
  const cnt = new Array(10).fill(0)
  for (const d of digits) cnt[d]++
  let dp = Array.from({ length: evenSlots + 1 }, () => new Array(half + 1).fill(0n))
  dp[0][0] = 1n
  for (let d = 0; d < 10; d++) {
    const next = Array.from({ length: evenSlots + 1 }, () => new Array(half + 1).fill(0n))
    for (let c = 0; c <= evenSlots; c++) {
      for (let s = 0; s <= half; s++) {
        if (dp[c][s] === 0n) continue
        for (let a = 0; a <= Math.min(cnt[d], evenSlots - c); a++) {
          const ns = s + a * d
          if (ns > half) break
          const w = (powmod(factmod(a), MOD - 2n) * powmod(factmod(cnt[d] - a), MOD - 2n)) % MOD
          next[c + a][ns] = (next[c + a][ns] + dp[c][s] * w) % MOD
        }
      }
    }
    dp = next
    const reach = dp.reduce((acc, row) => acc + row.filter(v => v !== 0n).length, 0)
    frames.push({ phase: 'digit', activeLine: L('for each digit d from 0 to 9'), digit: d, reach, message: `Digit ${d} (${cnt[d]} copies): ${reach} reachable (count, sum) states.` })
  }
  const result = Number((dp[evenSlots][half] * factmod(evenSlots) % MOD) * factmod(oddSlots) % MOD)
  frames.push({ phase: 'done', activeLine: L('return dp[even][half]'), digit: 9, reach: 0, message: `Balanced permutations: ${result}.` })
  return { input: { num }, result, frames, digits }
}

export const code = `count distinct balanced permutations of the digit string num
  set total to the sum of the digits
  if total is odd then return zero
  let half be total divided by two, and let even be the number of even positions, odd the number of odd positions
  let dp[c][s] be the weight of choosing c digits for even positions with sum s
  set dp[0][0] to one
  for each digit d from 0 to 9
    for each state (c, s) and each count a of copies of d placed in even positions
      add dp[c][s] times 1 over a! times 1 over (copies minus a)! to the state (c + a, s + a times d)
  return dp[even][half] times even! times odd!, modulo 1000000007`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_balanced_permutations(num):
    MOD = 10 ** 9 + 7
    digits = [int(ch) for ch in num]
    total = sum(digits)
    if total % 2:
        return 0
    half = total // 2
    even_slots = (len(digits) + 1) // 2
    odd_slots = len(digits) // 2
    cnt = [0] * 10
    for d in digits:
        cnt[d] += 1

    fact = [1] * (len(digits) + 1)
    for i in range(1, len(digits) + 1):
        fact[i] = fact[i - 1] * i % MOD
    inv = [pow(f, MOD - 2, MOD) for f in fact]

    dp = [[0] * (half + 1) for _ in range(even_slots + 1)]
    dp[0][0] = 1
    for d in range(10):
        nxt = [[0] * (half + 1) for _ in range(even_slots + 1)]
        for c in range(even_slots + 1):
            for s in range(half + 1):
                if dp[c][s] == 0:
                    continue
                for a in range(min(cnt[d], even_slots - c) + 1):
                    ns = s + a * d
                    if ns > half:
                        break
                    w = inv[a] * inv[cnt[d] - a] % MOD
                    nxt[c + a][ns] = (nxt[c + a][ns] + dp[c][s] * w) % MOD
        dp = nxt
    return dp[even_slots][half] * fact[even_slots] % MOD * fact[odd_slots] % MOD
`
