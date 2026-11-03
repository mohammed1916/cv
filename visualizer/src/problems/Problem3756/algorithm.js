const MOD = 1000000007n

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with s and queries.')
  const { s, queries } = input
  if (typeof s !== 'string' || s.length < 1 || s.length > 20 || !/^[0-9]+$/.test(s)) throw new Error('s has 1 to 20 digits.')
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 8) throw new Error('queries has 1 to 8 pairs.')
  for (const q of queries) {
    if (!Array.isArray(q) || q.length !== 2 || !q.every(Number.isInteger) || q[0] < 0 || q[0] > q[1] || q[1] >= s.length) {
      throw new Error(`Each query needs 0 <= l <= r < ${s.length}.`)
    }
  }
  return { s, queries }
}

const blank = { span: null, x: null, sum: null, answer: null }
const frame = o => ({ at: -1, ...blank, ...o })

export function buildTrace({ s, queries }) {
  const m = s.length
  const val = [0n]
  const cnt = [0]
  const dsum = [0]
  const pw = [1n]
  const frames = []
  frames.push(frame({ phase: 'start', pythonLine: Y('val, cnt, dsum'), activeLine: L('build prefix'), message: 'Prefix arrays track the concatenation, the nonzero count and the digit sum.' }))
  for (let i = 0; i < m; i++) {
    const d = Number(s[i])
    if (d === 0) {
      val.push(val[i]); cnt.push(cnt[i]); dsum.push(dsum[i])
      frames.push(frame({ at: i, phase: 'skip', pythonLine: Y('if d == 0'), activeLine: L('if d is zero'), message: `Zero at index ${i} adds no digit to x.` }))
    } else {
      val.push((val[i] * 10n + BigInt(d)) % MOD); cnt.push(cnt[i] + 1); dsum.push(dsum[i] + d)
      frames.push(frame({ at: i, phase: 'collect', pythonLine: Y('val.append((val'), activeLine: L('otherwise extend'), message: `Digit ${d} at index ${i} extends the concatenation.` }))
    }
  }
  for (let k = 0; k < m; k++) pw.push(pw[k] * 10n % MOD)
  const answers = []
  for (const [l, r] of queries) {
    frames.push(frame({ span: [l, r], phase: 'window', pythonLine: Y('for l, r in queries'), activeLine: L('for each query'), message: `Window from ${l} to ${r}.` }))
    const a = l
    const b = r + 1
    const k = cnt[b] - cnt[a]
    const x = ((val[b] - val[a] * pw[k]) % MOD + MOD) % MOD
    const total = dsum[b] - dsum[a]
    const answer = x * BigInt(total) % MOD
    answers.push(Number(answer))
    frames.push(frame({ span: [l, r], x: Number(x), sum: total, answer: Number(answer), phase: 'combine', pythonLine: Y('x = (val'), activeLine: L('x is the concatenation'), message: `k = ${k} nonzero digits, x = ${x}, digit sum ${total}, answer ${answer}.` }))
  }
  frames.push(frame({ phase: 'done', pythonLine: Y('return answers'), activeLine: L('return the answers'), answer: answers[answers.length - 1], message: 'Every query has its answer.' }))
  return { input: { s, queries }, result: answers, frames }
}

export const code = `answer each query as a concatenation times a digit sum
  build prefix arrays of the concatenation, the nonzero count and the digit sum
  for each digit d in s
    if d is zero then keep the previous values
    otherwise extend the concatenation with d, count it and add it to the sum
  precompute the powers of ten
  for each query [l, r]
    k is the number of nonzero digits in the window
    x is the concatenation: the whole prefix minus the old part shifted by 10 to the k
    answer is x times the digit sum, modulo 1000000007
  return the answers`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def concatenate_and_multiply(s, queries):
    mod = 10**9 + 7
    val, cnt, dsum = [0], [0], [0]
    for d in map(int, s):
        if d == 0:
            val.append(val[-1]); cnt.append(cnt[-1]); dsum.append(dsum[-1])
        else:
            val.append((val[-1] * 10 + d) % mod)
            cnt.append(cnt[-1] + 1)
            dsum.append(dsum[-1] + d)
    pw = [1]
    for _ in range(len(s)):
        pw.append(pw[-1] * 10 % mod)
    answers = []
    for l, r in queries:
        a, b = l, r + 1
        k = cnt[b] - cnt[a]
        x = (val[b] - val[a] * pw[k]) % mod
        total = dsum[b] - dsum[a]
        answers.append(x * total % mod)
    return answers
`
const Y = s => python.split('\n').findIndex(line => line.includes(s)) + 1
