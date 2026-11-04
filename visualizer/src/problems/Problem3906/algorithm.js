const codeLines = `function countGood(l, r, directions) {
  // the route visits 7 cells: start at index 0, D adds 4, R adds 1
  const chain = [0]
  let pos = 0
  for (const d of directions) {
    pos += d === 'D' ? 4 : 1
    chain.push(pos)
  }
  // chain is the 7 route indices in order; isChain marks them among the 16 digit positions
  const isChain = Array.from({ length: 16 }, (_, i) => chain.includes(i))
  // count(X) is how many 16-digit strings up to X keep chain digits non-decreasing
  const count = X => {
    if (X < 0n) return 0n
    const digits = X.toString().padStart(16, '0')
    // states: a tight flag and the last chain digit
    let dp = new Map([['1:0', 1n]])
    for (let p = 0; p < 16; p++) {
      const nxt = new Map()
      for (const [key, c] of dp) {
        const [t, lastText] = key.split(':')
        const tight = t === '1'
        const last = Number(lastText)
        const top = tight ? Number(digits[p]) : 9
        // for each digit position, try each allowed digit
        for (let d = 0; d <= top; d++) {
          // skip a chain digit that is smaller than the last chain digit
          if (isChain[p] && d < last) continue
          const nk = (tight && d === top ? '1' : '0') + ':' + String(isChain[p] ? d : last)
          nxt.set(nk, (nxt.get(nk) || 0n) + c)
        }
      }
      dp = nxt
    }
    let total = 0n
    for (const v of dp.values()) total += v
    return total
  }
  // return count(r) minus count(l - 1)
  return count(BigInt(r)) - count(BigInt(l) - 1n)
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => codeLines.findIndex(c => c.text.includes(s)) + 1
const pythonLines = `def count_good(l, r, directions):
    chain = [0]
    pos = 0
    for d in directions:
        pos += 4 if d == 'D' else 1
        chain.append(pos)
    is_chain = [i in chain for i in range(16)]
    def count(X):
        if X < 0:
            return 0
        digits = str(X).zfill(16)
        dp = {(True, 0): 1}
        for p in range(16):
            nxt = {}
            for (tight, last), c in dp.items():
                top = int(digits[p]) if tight else 9
                for d in range(top + 1):
                    if is_chain[p] and d < last:
                        continue
                    key = (tight and d == top, d if is_chain[p] else last)
                    nxt[key] = nxt.get(key, 0) + c
            dp = nxt
        return sum(dp.values())
    return count(r) - count(l - 1)`.split('\n')
const P = s => pythonLines.findIndex(t => t.includes(s)) + 1

export function routeIndices(directions) {
  const chain = [0]
  let pos = 0
  for (const d of directions) {
    pos += d === 'D' ? 4 : 1
    chain.push(pos)
  }
  return chain
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input.l !== 'string' || typeof input.r !== 'string' || typeof input.directions !== 'string') throw new Error('Use an object with l, r (decimal strings) and directions.')
  const { l, r, directions } = input
  if (!/^\d+$/.test(l) || !/^\d+$/.test(r)) throw new Error('l and r are non-negative decimal strings.')
  if (BigInt(r) >= 10n ** 16n || BigInt(l) > BigInt(r)) throw new Error('Use 0 <= l <= r < 10^16.')
  if (directions.length !== 6 || [...directions].filter(c => c === 'D').length !== 3 || [...directions].filter(c => c === 'R').length !== 3) {
    throw new Error('directions has three D and three R.')
  }
  return { l, r, directions }
}

function countUpTo(X, chain, frames, label) {
  if (X < 0n) return 0n
  const digits = X.toString().padStart(16, '0')
  const isChain = Array.from({ length: 16 }, (_, i) => chain.includes(i))
  let dp = new Map([['1:0', 1n]])
  for (let p = 0; p < 16; p++) {
    const nxt = new Map()
    for (const [key, c] of dp) {
      const [t, lastText] = key.split(':')
      const tight = t === '1'
      const last = Number(lastText)
      const top = tight ? Number(digits[p]) : 9
      for (let d = 0; d <= top; d++) {
        if (isChain[p] && d < last) continue
        const nk = `${tight && d === top ? 1 : 0}:${isChain[p] ? d : last}`
        nxt.set(nk, (nxt.get(nk) || 0n) + c)
      }
    }
    dp = nxt
    let live = 0n
    for (const v of dp.values()) live += v
    frames.push({ phase: 'digit', activeLine: L('for each digit position'), pythonLine: P('for p in range(16)'), label, position: p, states: dp.size, live,
      message: `${label}: after digit ${p}, ${dp.size} state${dp.size === 1 ? '' : 's'} alive.` })
  }
  let total = 0n
  for (const v of dp.values()) total += v
  return total
}

export function isGood(x, chain) {
  const digits = x.toString().padStart(16, '0')
  const seq = chain.map(i => Number(digits[i]))
  return seq.every((v, i) => i === 0 || seq[i - 1] <= v)
}

export function buildTrace({ l, r, directions }) {
  const chain = routeIndices(directions)
  const lo = BigInt(l)
  const hi = BigInt(r)
  const sample = hi
  const sampleDigits = sample.toString().padStart(16, '0')
  const frames = [{ phase: 'route', activeLine: L('the route visits'), pythonLine: P('chain = [0]'), chain, sampleDigits, sampleGood: isGood(sample, chain), count: null, label: null, position: -1, states: 0,
    message: `Route indices ${chain.join(', ')}. The sample ${r} is ${isGood(sample, chain) ? 'good' : 'not good'}.` }]
  const upper = countUpTo(hi, chain, frames, 'up to r')
  const lower = countUpTo(lo - 1n, chain, frames, 'up to l minus 1')
  const result = upper - lower
  frames.push({ phase: 'done', activeLine: L('return count(r) minus'), pythonLine: P('return count(r) - count(l - 1)'), chain, sampleDigits, sampleGood: null, count: result, label: null, position: -1, states: 0,
    message: `${upper} minus ${lower} gives ${result} good integers.` })
  return { input: { l, r, directions }, result: Number(result), frames }
}

export const code = codeLines
export const python = pythonLines.join('\n')
