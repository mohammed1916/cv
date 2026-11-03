export const phases = [
  { id: 'start', label: 'Setup', description: 'Start with no cost for any residue.' },
  { id: 'residue', label: 'Residue', description: 'Price moving every value to one residue class.' },
  { id: 'pair', label: 'Pair', description: 'Compare an even residue with a different odd residue.' },
  { id: 'done', label: 'Result', description: 'Report the cheapest valid pair.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and k.')
  const { nums, k } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('nums has 1 to 12 values.')
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= 1000000000)) throw new Error('Each value is an integer from 1 to 1000000000.')
  if (!Number.isInteger(k) || k < 2 || k > 12) throw new Error('k is an integer from 2 to 12.')
  return { nums, k }
}

const modp = (a, k) => ((a % k) + k) % k
const gapTo = (x, r, k) => {
  const t = modp(r - x, k)
  return Math.min(t, k - t)
}

export function buildTrace({ nums, k }) {
  const n = nums.length
  const evenCost = Array(k).fill(0)
  const oddCost = Array(k).fill(0)
  const frames = [{ phase: 'start', activeLine: L('let evenCost and oddCost'), pythonLine: P('even_cost = [0]'), message: `Price each residue 0 to ${k - 1} for the even and odd positions.`, r: -1, evenCost: evenCost.slice(), oddCost: oddCost.slice(), pair: null, best: null }]
  for (let r = 0; r < k; r++) {
    for (let i = 0; i < n; i++) {
      const gap = gapTo(nums[i], r, k)
      if (i % 2 === 0) evenCost[r] += gap
      else oddCost[r] += gap
    }
    frames.push({ phase: 'residue', activeLine: L('for each residue r'), pythonLine: P('for r in range(k)'), message: `Residue ${r}: even positions cost ${evenCost[r]}, odd positions cost ${oddCost[r]}.`, r, evenCost: evenCost.slice(), oddCost: oddCost.slice(), pair: null, best: null })
  }
  let best = Infinity
  for (let r0 = 0; r0 < k; r0++) {
    for (let r1 = 0; r1 < k; r1++) {
      if (r0 === r1) continue
      const total = evenCost[r0] + oddCost[r1]
      if (total < best) best = total
      frames.push({ phase: 'pair', activeLine: L('if evenCost[r0] plus'), pythonLine: P('if best is None'), message: `Even residue ${r0} with odd residue ${r1} costs ${total}.`, r: -1, evenCost: evenCost.slice(), oddCost: oddCost.slice(), pair: [r0, r1], best })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return best'), pythonLine: P('return best'), message: `The cheapest valid choice costs ${best}.`, r: -1, evenCost: evenCost.slice(), oddCost: oddCost.slice(), pair: null, best })
  return { input: { nums, k }, result: best, frames }
}

export const code = `minimum cost for alternating residues
  let evenCost and oddCost be arrays of zeros with k entries
  for each residue r from 0 to k minus 1
    for each index i
      let gap be the distance from nums[i] to the nearest value with residue r
      add gap to evenCost[r] if i is even, else to oddCost[r]
  let best be infinity
  for each pair r0 and r1 with r0 different from r1
    if evenCost[r0] plus oddCost[r1] beats best then update best
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(line => line.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def min_operations_alternating(nums, k):
    n = len(nums)
    even_cost = [0] * k
    odd_cost = [0] * k
    for r in range(k):
        for i in range(n):
            t = (r - nums[i]) % k
            gap = min(t, k - t)
            if i % 2 == 0:
                even_cost[r] += gap
            else:
                odd_cost[r] += gap
    best = None
    for r0 in range(k):
        for r1 in range(k):
            if r0 != r1:
                total = even_cost[r0] + odd_cost[r1]
                if best is None or total < best:
                    best = total
    return best`

const pyLines = python.split('\n')
const P = s => {
  const index = pyLines.findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}
