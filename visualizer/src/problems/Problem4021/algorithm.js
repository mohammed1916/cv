export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj.s !== 'string') throw new Error('Use an object with a string field s.')
  const { s } = obj
  if (s.length < 2 || s.length > 12) throw new Error('Use s with 2 to 12 letters for the visualization.')
  if (!/^[a-z]+$/.test(s)) throw new Error('s must use lowercase letters a to z only.')
  return { s }
}

// Cheapest way to make two letters equal using forward increments on either letter.
const pairCost = (a, b) => {
  const d = (b.charCodeAt(0) - a.charCodeAt(0) + 26) % 26
  return Math.min(d, 26 - d)
}

export function buildTrace(input) {
  const { s } = input
  const n = s.length
  const frames = []
  let best = null
  const table = []
  frames.push({ pythonLine: 3, phase: 'start', activeLine: L('set best to nothing'), r: -1, text: s, cost: 0, pair: null, pairs: [], table: [], best,
    message: `Length ${n}. Try every left rotation and price its mirror pairs.` })
  for (let r = 0; r < n; r++) {
    const t = s.slice(r) + s.slice(0, r)
    let cost = r
    const pairs = []
    frames.push({ pythonLine: 5, phase: 'rotate', activeLine: L('build the rotated string'), r, text: t, cost, pair: null, pairs: [], table: [...table], best,
      message: `Rotate left by ${r} to get ${t}; the rotations alone cost ${r}.` })
    for (let i = 0; i < Math.floor(n / 2); i++) {
      const price = pairCost(t[i], t[n - 1 - i])
      cost += price
      pairs.push({ i, j: n - 1 - i, price })
      frames.push({ pythonLine: 9, phase: 'pair', activeLine: L('add the cheapest'), r, text: t, cost, pair: [i, n - 1 - i], pairs: [...pairs], table: [...table], best,
        message: `Positions ${i} and ${n - 1 - i} hold ${t[i]} and ${t[n - 1 - i]}; matching them costs ${price}.` })
    }
    table.push({ r, text: t, cost })
    if (best === null || cost < best) best = cost
    frames.push({ pythonLine: 11, phase: 'best', activeLine: L('set best to cost'), r, text: t, cost, pair: null, pairs: [...pairs], table: [...table], best,
      message: `Rotation ${r} costs ${cost}; the best so far is ${best}.` })
  }
  frames.push({ pythonLine: 12, phase: 'done', activeLine: L('return best'), r: -1, text: s, cost: null, pair: null, pairs: [], table: [...table], best,
    message: `Minimum operations: ${best}.` })
  return { input, result: best, frames }
}

export const code = `function minOperationsRotatedPalindrome(s) {
  const n = s.length
  // set best to nothing
  let best = null
  for (let r = 0; r < n; r++) {
    // build the rotated string t by moving the first r letters to the end
    const t = s.slice(r) + s.slice(0, r)
    // set cost to r
    let cost = r
    for (let i = 0; i < Math.floor(n / 2); i++) {
      // add the cheapest increments that make t[i] and t[n-1-i] equal
      const d = (t.charCodeAt(n - 1 - i) - t.charCodeAt(i) + 26) % 26
      cost += Math.min(d, 26 - d)
    }
    // if best is nothing or cost is less than best then
    if (best === null || cost < best) {
      // set best to cost
      best = cost
    }
  }
  // return best
  return best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_operations_rotated_palindrome(s):
    n = len(s)
    best = None
    for r in range(n):
        t = s[r:] + s[:r]
        cost = r
        for i in range(n // 2):
            d = (ord(t[n - 1 - i]) - ord(t[i])) % 26
            cost += min(d, 26 - d)
        if best is None or cost < best:
            best = cost
    return best
`
