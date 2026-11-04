const MOD = 1000000007

const L = s => {
  const line = code.findIndex(c => c.text.includes(s)) + 1
  if (line < 1) throw new Error(`Missing pseudocode line: ${s}`)
  return line
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums1 and nums2.')
  const { nums1, nums2 } = input
  const ok = a => Array.isArray(a) && a.length >= 1 && a.length <= 8 && a.every(v => Number.isInteger(v) && v >= 0 && v <= 9)
  if (!ok(nums1) || !ok(nums2)) throw new Error('nums1 and nums2 are lists of 1 to 8 integers from 0 to 9.')
  if (nums1.length !== nums2.length) throw new Error('nums1 and nums2 must have the same length.')
  return { nums1, nums2 }
}

// Each entry is a difference (chosen nums1 sum minus chosen nums2 sum) and the number of ways reaching it.
function sortedEntries(map) {
  return [...map.entries()].filter(([, w]) => w > 0).sort((a, b) => a[0] - b[0]).map(([d, w]) => ({ d, w }))
}

export function buildTrace({ nums1, nums2 }) {
  const n = nums1.length
  const frames = []
  let count = new Map()
  let total = 0
  frames.push({ pythonLine: 4, phase: 'start', activeLine: L('let count = new Map()'), index: -1, table: [], added: 0, total, message: 'No range has been started yet, so the table is empty and the total is 0.' })
  for (let r = 0; r < n; r++) {
    const next = new Map()
    const bump = (d, w) => next.set(d, ((next.get(d) ?? 0) + w) % MOD)
    frames.push({ pythonLine: 5, phase: 'index', activeLine: L('for (let r = 0'), index: r, table: sortedEntries(count), added: 0, total, message: `Index ${r}: extend every range that ended at ${r - 1}, and start a new range here.` })
    for (const [d, w] of count) {
      bump(d + nums1[r], w)
      bump(d - nums2[r], w)
    }
    frames.push({ pythonLine: 9, phase: 'extend', activeLine: L('for (const [d, w] of count)'), index: r, table: sortedEntries(next), added: 0, total, message: `Each old difference splits into +${nums1[r]} (take nums1[${r}]) and -${nums2[r]} (take nums2[${r}]).` })
    for (const d of [nums1[r], -nums2[r]]) bump(d, 1)
    const zero = next.get(0) ?? 0
    total = (total + zero) % MOD
    frames.push({ pythonLine: 12, phase: 'count', activeLine: L('total = (total +'), index: r, table: sortedEntries(next), added: zero, total, message: `A range starting at ${r} adds to the table. Ways with difference 0 ending at ${r}: ${zero}. Running total: ${total}.` })
    count = next
  }
  frames.push({ pythonLine: 14, phase: 'done', activeLine: L('return total'), index: -1, table: sortedEntries(count), added: 0, total, message: `Every range is counted. The answer is ${total} modulo 1000000007.` })
  return { input: { nums1, nums2 }, result: total, frames }
}

export const code = `function countBalancedChoices(nums1, nums2) {
  const MOD = 1000000007
  let count = new Map()
  let total = 0
  for (let r = 0; r < nums1.length; r++) {
    const next = new Map()
    for (const [d, w] of count) {
      next.set(d + nums1[r], ((next.get(d + nums1[r]) ?? 0) + w) % MOD)
      next.set(d - nums2[r], ((next.get(d - nums2[r]) ?? 0) + w) % MOD)
    }
    for (const d of [nums1[r], -nums2[r]]) next.set(d, ((next.get(d) ?? 0) + 1) % MOD)
    total = (total + (next.get(0) ?? 0)) % MOD
    count = next
  }
  return total
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def count_equal_choices(nums1, nums2):
    MOD = 1000000007
    count = {}
    total = 0
    for r in range(len(nums1)):
        nxt = {}
        for d, w in count.items():
            nxt[d + nums1[r]] = (nxt.get(d + nums1[r], 0) + w) % MOD
            nxt[d - nums2[r]] = (nxt.get(d - nums2[r], 0) + w) % MOD
        for d in (nums1[r], -nums2[r]):
            nxt[d] = (nxt.get(d, 0) + 1) % MOD
        total = (total + nxt.get(0, 0)) % MOD
        count = nxt
    return total
`
