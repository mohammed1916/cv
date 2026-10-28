export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || typeof input.s !== 'string' || !Array.isArray(input.cost)) throw new Error('Use a JSON object with a string s and a cost array.')
  const n = input.s.length
  if (n < 1 || n > 20 || input.cost.length !== n) throw new Error('s and cost need the same length from 1 to 20.')
  if (!/^[a-z]+$/.test(input.s)) throw new Error('s may only contain lowercase letters.')
  if (input.cost.some(c => !Number.isInteger(c) || c < 1 || c > 100)) throw new Error('cost values are integers from 1 to 100.')
  return input
}

export function buildTrace(input) {
  const { s, cost } = input
  const total = cost.reduce((sum, c) => sum + c, 0)
  const sums = {}
  const frames = [{ phase: 'start', activeLine: L('total = sum of all costs'), index: -1, sums: {}, message: 'Sum the deletion cost of every letter group.' }]
  for (let i = 0; i < s.length; i++) {
    sums[s[i]] = (sums[s[i]] || 0) + cost[i]
    frames.push({ phase: 'add', activeLine: L('add cost[i] to the sum'), index: i, sums: { ...sums }, message: `Letter ${s[i]} gains cost ${cost[i]}, so its keep-cost is ${sums[s[i]]}.` })
  }
  const best = Math.max(...Object.values(sums))
  const result = total - best
  frames.push({ phase: 'done', activeLine: L('return total minus best'), index: -1, sums: { ...sums }, message: `Keep the letter with the largest cost ${best}. Delete the rest for ${result}.` })
  return { input, result, frames }
}

export const code = `minimum deletion cost to make all characters equal (s, cost):
  total = sum of all costs
  letter sums = empty map
  for each index i
    add cost[i] to the sum for the letter s[i]
  best = the largest letter sum
  return total minus best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimum_deletion_cost_to_make_all_characters_equal(s, cost):
    sums = {}
    for ch, c in zip(s, cost):
        sums[ch] = sums.get(ch, 0) + c
    return sum(cost) - max(sums.values())
`
