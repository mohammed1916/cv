export function parseInput(text) {
  const data = JSON.parse(text)
  const { gifts, k } = data ?? {}
  if (!Array.isArray(gifts) || gifts.length < 1 || gifts.length > 6) throw new Error('Use "gifts" as an array of 1 to 6 piles.')
  if (gifts.some(g => !Number.isInteger(g) || g < 1 || g > 100)) throw new Error('Each pile is an integer from 1 to 100.')
  if (!Number.isInteger(k) || k < 1 || k > 8) throw new Error('"k" is an integer from 1 to 8.')
  return { gifts, k }
}

export function buildTrace({ gifts, k }) {
  const piles = [...gifts]
  const frames = [{ phase: 'start', activeLine: L('put every pile into a max heap'), piles: [...piles], picked: -1, message: 'Every pile starts in the heap.' }]
  for (let second = 1; second <= k; second++) {
    let at = 0
    for (let i = 1; i < piles.length; i++) if (piles[i] > piles[at]) at = i
    const before = piles[at]
    piles[at] = Math.floor(Math.sqrt(before))
    frames.push({ phase: 'take', activeLine: L('take the largest pile'), piles: [...piles], picked: at, message: `Second ${second}: pile ${at} had ${before} and keeps ${piles[at]}.` })
  }
  const result = piles.reduce((sum, g) => sum + g, 0)
  frames.push({ phase: 'done', activeLine: L('return the sum of all piles'), piles: [...piles], picked: -1, message: `Gifts left: ${result}.` })
  return { input: { gifts, k }, result, frames }
}

export const code = `sum of gifts left after k seconds, given gifts and k
  put every pile into a max heap
  repeat k times
    take the largest pile x out of the heap
    put floor of the square root of x back into the heap
  return the sum of all piles left`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `import heapq
import math

def remaining_gifts(gifts, k):
    heap = [-g for g in gifts]
    heapq.heapify(heap)
    for _ in range(k):
        x = -heapq.heappop(heap)
        heapq.heappush(heap, -math.isqrt(x))
    return -sum(heap)
`
