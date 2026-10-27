export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Number.isInteger(obj.n) || typeof obj.s1 !== 'string' || typeof obj.s2 !== 'string' || typeof obj.evil !== 'string') {
    throw new Error('Use {"n": integer, "s1": string, "s2": string, "evil": string}.')
  }
  if (obj.n < 1 || obj.n > 4) throw new Error('n is an integer from 1 to 4.')
  if (obj.s1.length !== obj.n || obj.s2.length !== obj.n) throw new Error('s1 and s2 must both have length n.')
  if (!/^[a-z]+$/.test(obj.s1) || !/^[a-z]+$/.test(obj.s2) || !/^[a-z]{1,3}$/.test(obj.evil)) throw new Error('Use lowercase letters; evil has 1 to 3 letters.')
  if (obj.s1 > obj.s2) throw new Error('s1 must not be greater than s2.')
  return { n: obj.n, s1: obj.s1, s2: obj.s2, evil: obj.evil }
}

export function buildTrace(input) {
  const MOD = 1000000007
  const { n, s1, s2, evil } = input
  const m = evil.length
  const fail = Array(m).fill(0)
  let k = 0
  for (let i = 1; i < m; i++) {
    while (k > 0 && evil[i] !== evil[k]) k = fail[k - 1]
    if (evil[i] === evil[k]) k++
    fail[i] = k
  }
  const step = (state, ch) => {
    let st = state
    while (st > 0 && evil[st] !== ch) st = fail[st - 1]
    if (evil[st] === ch) st++
    return st
  }
  const letters = 'abcdefghijklmnopqrstuvwxyz'
  let ways = new Map([['0|1|1', 1]])
  const frames = [{ phase: 'start', activeLine: L('build the KMP failure'), position: null, states: ways.size, total: null, message: `Track how much of "${evil}" is matched, and whether the prefix still equals s1 or s2.` }]
  for (let i = 0; i < n; i++) {
    const next = new Map()
    for (const [key, count] of ways) {
      const [state, low, high] = key.split('|').map(Number)
      for (const ch of letters) {
        if (low && ch < s1[i]) continue
        if (high && ch > s2[i]) continue
        const ns = step(state, ch)
        if (ns === m) continue
        const nk = `${ns}|${low && ch === s1[i] ? 1 : 0}|${high && ch === s2[i] ? 1 : 0}`
        next.set(nk, ((next.get(nk) || 0) + count) % MOD)
      }
    }
    ways = next
    frames.push({ phase: 'position', activeLine: L('for each position i'), position: i, states: ways.size, total: null, message: `After position ${i + 1}: ${ways.size} live states.` })
  }
  let total = 0
  for (const count of ways.values()) total = (total + count) % MOD
  frames.push({ phase: 'done', activeLine: L('return the sum'), position: null, states: ways.size, total, message: `Good strings: ${total}.` })
  return { input, result: total, frames }
}

export const code = `count strings x of length n with s1 <= x <= s2 and no evil substring:
  build the KMP failure table for evil
  set ways to 1 for the start state: no letters matched, tight to s1 and s2
  for each position i from 0 to n - 1:
    make an empty next table of ways
    for each state (match, tight low, tight high) with ways:
      for each letter c from a to z:
        skip c if it is below s1[i] while tight low, or above s2[i] while tight high
        find the new match length after reading c
        if the new match equals the length of evil then skip c
        add the ways to next, with the new tight flags
    set ways to next
  return the sum of all ways modulo 1000000007`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def find_all_good_strings(n, s1, s2, evil):
    MOD = 1000000007
    m = len(evil)
    fail = [0] * m
    k = 0
    for i in range(1, m):
        while k > 0 and evil[i] != evil[k]:
            k = fail[k - 1]
        if evil[i] == evil[k]:
            k += 1
        fail[i] = k

    def step(state, ch):
        while state > 0 and evil[state] != ch:
            state = fail[state - 1]
        if evil[state] == ch:
            state += 1
        return state

    ways = {(0, True, True): 1}
    for i in range(n):
        nxt = {}
        for (state, low, high), count in ways.items():
            for ch in 'abcdefghijklmnopqrstuvwxyz':
                if low and ch < s1[i]:
                    continue
                if high and ch > s2[i]:
                    continue
                ns = step(state, ch)
                if ns == m:
                    continue
                key = (ns, low and ch == s1[i], high and ch == s2[i])
                nxt[key] = (nxt.get(key, 0) + count) % MOD
        ways = nxt
    return sum(ways.values()) % MOD
`
