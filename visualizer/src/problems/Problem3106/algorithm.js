export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with s and k.')
  const { s, k } = input
  if (typeof s !== 'string' || s.length < 1 || s.length > 30 || !/^[a-z]+$/.test(s)) throw new Error('s has 1 to 30 lowercase letters.')
  if (!Number.isInteger(k) || k < 0 || k > 100) throw new Error('k is an integer from 0 to 100.')
  return { s, k }
}

const ALPHA = 'abcdefghijklmnopqrstuvwxyz'
const cyclicCost = (a, b) => {
  const d = Math.abs(a.charCodeAt(0) - b.charCodeAt(0))
  return Math.min(d, 26 - d)
}

export function buildTrace({ s, k }) {
  const frames = []
  const out = []
  let budget = k
  frames.push({ pythonLine: 2, phase: 'start', activeLine: L('const out = []'), at: -1, letter: null, cost: null, budget, out: '', message: `Budget is ${k}.` })
  for (let i = 0; i < s.length; i++) {
    for (const c of ALPHA) {
      const cost = cyclicCost(s[i], c)
      if (cost <= budget) {
        out.push(c)
        budget -= cost
        frames.push({ pythonLine: 8, phase: 'pick', activeLine: L('budget -= cost'), at: i, letter: c, cost, budget, out: out.join(''), message: `Position ${i}: ${s[i]} becomes ${c} for cost ${cost}; ${budget} left.` })
        break
      }
    }
  }
  const result = out.join('')
  frames.push({ pythonLine: 11, phase: 'done', activeLine: L('return out.join'), at: -1, letter: null, cost: null, budget, out: result, message: `Smallest string: ${result}.` })
  return { input: { s, k }, result, frames }
}

export const code = `function smallestString(s, k) {
  const out = []
  let budget = k
  for (const ch of s) {
    for (const c of 'abcdefghijklmnopqrstuvwxyz') {
      const d = Math.abs(ch.charCodeAt(0) - c.charCodeAt(0))
      const cost = Math.min(d, 26 - d)
      if (cost <= budget) {
        out.push(c)
        budget -= cost
        break
      }
    }
  }
  return out.join('')
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def smallest_string(s, k):
    out = []
    for ch in s:
        for c in "abcdefghijklmnopqrstuvwxyz":
            diff = abs(ord(ch) - ord(c))
            cost = min(diff, 26 - diff)
            if cost <= k:
                out.append(c)
                k -= cost
                break
    return "".join(out)
`
