// LeetCode 1960: every odd palindrome is found by expanding from its centre with two pointers l and r. Record the longest palindrome ending at each index and starting at each index, then combine prefix and suffix maxima.
const SOURCE = [
  "function maxProduct(s) {",
  "  const n = s.length",
  "  const endBest = new Array(n).fill(0), startBest = new Array(n).fill(0)",
  "  for (let centre = 0; centre < n; centre++) {",
  "    let l = centre, r = centre",
  "    while (l >= 0 && r < n && s[l] === s[r]) {",
  "      const length = r - l + 1",
  "      endBest[r] = Math.max(endBest[r], length)",
  "      startBest[l] = Math.max(startBest[l], length)",
  "      l--",
  "      r++",
  "    }",
  "  }",
  "  const pre = new Array(n).fill(0), suf = new Array(n).fill(0)",
  "  for (let i = 0; i < n; i++) pre[i] = Math.max(i ? pre[i - 1] : 0, endBest[i])",
  "  for (let i = n - 1; i >= 0; i--) suf[i] = Math.max(i + 1 < n ? suf[i + 1] : 0, startBest[i])",
  "  let ans = 0",
  "  for (let split = 0; split < n - 1; split++) ans = Math.max(ans, pre[split] * suf[split + 1])",
  "  return ans",
  "}",
]

export const code = SOURCE.map((text, index) => ({ line: index + 1, text }))

export const python = `def max_product(s):
    n = len(s)
    end_best = [0] * n
    start_best = [0] * n
    for centre in range(n):
        l, r = centre, centre
        while l >= 0 and r < n and s[l] == s[r]:
            length = r - l + 1
            end_best[r] = max(end_best[r], length)
            start_best[l] = max(start_best[l], length)
            l -= 1
            r += 1
    pre = [0] * n
    suf = [0] * n
    for i in range(n):
        pre[i] = max(pre[i - 1] if i else 0, end_best[i])
    for i in range(n - 1, -1, -1):
        suf[i] = max(suf[i + 1] if i + 1 < n else 0, start_best[i])
    ans = 0
    for split in range(n - 1):
        ans = max(ans, pre[split] * suf[split + 1])
    return ans
`

const L = text => { const i = SOURCE.findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no code line: ${text}`); return i + 1 }
const P = text => { const i = python.split('\n').findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no python line: ${text}`); return i + 1 }

export const phases = [
  { id: 'expand', label: 'Expand centres', description: 'Grow odd palindromes outward from each centre.' },
  { id: 'combine', label: 'Combine', description: 'Pair a palindrome on the left with one on the right.' },
  { id: 'done', label: 'Result', description: 'Largest product of two disjoint odd palindromes.' },
]

export function parseInput(text) {
  const s = String(text).trim()
  if (!/^[a-z]{2,14}$/.test(s)) throw new Error('Enter 2 to 14 lowercase letters.')
  return { s }
}

export function buildTrace({ s }) {
  const n = s.length
  const frames = []
  const endBest = new Array(n).fill(0)
  const startBest = new Array(n).fill(0)
  for (let centre = 0; centre < n; centre++) {
    let l = centre, r = centre
    while (l >= 0 && r < n && s[l] === s[r]) {
      const length = r - l + 1
      endBest[r] = Math.max(endBest[r], length)
      startBest[l] = Math.max(startBest[l], length)
      frames.push({ phase: 'expand', activeLine: L('endBest[r] = Math.max'), pythonLine: P('end_best[r] = max'), message: `Centre ${centre}: palindrome s[${l}..${r}] has length ${length}.`, l, r, centre, endBest: [...endBest], startBest: [...startBest], split: null, product: null })
      l--
      r++
    }
  }
  const pre = new Array(n).fill(0)
  const suf = new Array(n).fill(0)
  for (let i = 0; i < n; i++) pre[i] = Math.max(i ? pre[i - 1] : 0, endBest[i])
  for (let i = n - 1; i >= 0; i--) suf[i] = Math.max(i + 1 < n ? suf[i + 1] : 0, startBest[i])
  let ans = 0
  for (let split = 0; split < n - 1; split++) {
    const product = pre[split] * suf[split + 1]
    ans = Math.max(ans, product)
    frames.push({ phase: 'combine', activeLine: L('ans = Math.max(ans'), pythonLine: P('ans = max(ans, pre'), message: `Split after ${split}: left best ${pre[split]} × right best ${suf[split + 1]} = ${product}.`, l: -1, r: -1, centre: -1, endBest: [...endBest], startBest: [...startBest], split, product, ans, pre: [...pre], suf: [...suf] })
  }
  frames.push({ phase: 'done', activeLine: L('return ans'), pythonLine: P('return ans'), message: `Largest product: ${ans}.`, l: -1, r: -1, centre: -1, endBest: [...endBest], startBest: [...startBest], split: null, product: null, ans, pre: [...pre], suf: [...suf] })
  return { input: { s }, result: ans, frames }
}
